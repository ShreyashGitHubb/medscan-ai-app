
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import Constants from 'expo-constants';

// Labels from labels.txt:
// 0 Glioma
// 1 Meningioma
// 2 No Tumor
// 3 Pituitary
const LABELS = ['Glioma', 'Meningioma', 'No Tumor', 'Pituitary'];

class MRIModelService {
  private model: any | null = null;
  private isLoaded = false;
  private modelPath = require('../assets/models/mri_tumor.tflite');

  constructor() {}

  async loadModel(onProgress?: (status: string) => void) {
    if (this.isLoaded && this.model) return;

    try {
      console.log('Loading MRI TFLite model...');

      if (Constants.appOwnership === 'expo') {
          console.warn('TFLite not supported in Expo Go.');
          if (onProgress) onProgress('Expo Go detected - Switching to Mock Mode...');
          await new Promise(r => setTimeout(r, 1000));
          throw new Error('TFLite not supported in Expo Go.');
      }

      const asset = Asset.fromModule(this.modelPath);
      await asset.downloadAsync();
      
      if (!asset.localUri) {
        throw new Error('Failed to download MRI model');
      }

      if (onProgress) onProgress('Loading specialized MRI model...');
      const { loadTensorflowModel } = require('react-native-fast-tflite');
      this.model = await loadTensorflowModel({ url: asset.localUri });
      this.isLoaded = true;
      console.log('✓ MRI model loaded');
    } catch (error) {
      console.error('Failed to load MRI model:', error);
      throw error;
    }
  }

  async predict(imageUri: string, onProgress?: (status: string) => void) {
    try {
      if (!this.isLoaded || !this.model) {
        await this.loadModel(onProgress);
      }

      console.log('Preprocessing for MRI Model (96x96 Grayscale)...');
      if (onProgress) onProgress('Preprocessing (96x96 Grayscale)...');
      
      const inputData = await this.preprocessImage(imageUri);
      
      console.log('Running inference...');
      if (onProgress) onProgress('Analyzing brain structure...');
      await new Promise(resolve => setTimeout(resolve, 100));

      const output = await this.model!.run([inputData]);
      const predictions = output[0] as Float32Array; 
      
      // Softmax
      const logits = Array.from(predictions);
      const maxLogit = Math.max(...logits);
      const expScores = logits.map(x => Math.exp(x - maxLogit));
      const sumExpScores = expScores.reduce((a, b) => a + b, 0);
      const probabilities = expScores.map(x => x / sumExpScores);

      // Find top prediction
      let maxIndex = 0;
      let maxProb = 0;
      probabilities.forEach((p, i) => {
        if (p > maxProb) {
          maxProb = p;
          maxIndex = i;
        }
      });

      const prediction = LABELS[maxIndex];
      const isTumor = prediction !== 'No Tumor';

      return {
        finalPrediction: prediction,
        confidence: maxProb,
        probabilities: {
            'Glioma': probabilities[0],
            'Meningioma': probabilities[1],
            'No Tumor': probabilities[2],
            'Pituitary': probabilities[3]
        },
        model: 'Brain Tumor MRI (TFLite)',
        summary: isTumor
            ? `Analysis detects signatures consistent with ${prediction}. Confidence: ${(maxProb * 100).toFixed(1)}%`
            : `No tumor detected. Brain structure appears normal. Confidence: ${(maxProb * 100).toFixed(1)}%`,
        recommendations: isTumor ? [
            'Consult a neurologist or oncologist immediately.',
            'Further imaging (High-res MRI/CT) required.',
            'Discuss biopsy options with your specialist.'
        ] : [
            'Continue routine health checkups.',
            'Monitor for any neurological symptoms (headaches, vision changes).',
            'Consult a doctor if symptoms persist.'
        ]
      };

    } catch (error) {
      console.error('MRI prediction failed:', error);
      throw error;
    }
  }

  private async preprocessImage(imageUri: string): Promise<Float32Array> {
    // 1. Resize to 96x96
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 96, height: 96 } }],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2. Read as Base64
    const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: 'base64'
    });

    // 3. Decode
    const buffer = Buffer.from(base64, 'base64');
    const rawData = jpeg.decode(buffer, { useTArray: true }); 
    const { data } = rawData; 

    // 4. Convert to Grayscale & Normalize [-1, 1]
    const float32Data = new Float32Array(96 * 96 * 1);
    
    let p = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const gray = (0.299 * r + 0.587 * g + 0.114 * b);
      // Normalize to [0, 1] (Experimenting with different range to improve accuracy)
      float32Data[p++] = gray / 255.0; 
    }

    return float32Data;
  }
}

export default new MRIModelService();
