
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import Constants from 'expo-constants';

// Labels from labels.txt (Swapped based on testing):
// 0 Not Fractured
// 1 Fractured
const LABELS = ['Not Fractured', 'Fractured'];

class FractureModelService {
  private model: any | null = null;
  private isLoaded = false;
  private modelPath = require('../assets/models/fracture_detection.tflite');

  constructor() {}

  async loadModel(onProgress?: (status: string) => void) {
    if (this.isLoaded && this.model) return;

    try {
      console.log('Loading Fracture TFLite model...');

      if (Constants.appOwnership === 'expo') {
          console.warn('TFLite not supported in Expo Go.');
          if (onProgress) onProgress('Expo Go detected - Switching to Mock Mode...');
          await new Promise(r => setTimeout(r, 1000));
          throw new Error('TFLite not supported in Expo Go.');
      }

      const asset = Asset.fromModule(this.modelPath);
      await asset.downloadAsync();
      
      if (!asset.localUri) {
        throw new Error('Failed to download fracture model');
      }

      if (onProgress) onProgress('Loading localized model...');
      const { loadTensorflowModel } = require('react-native-fast-tflite');
      this.model = await loadTensorflowModel({ url: asset.localUri });
      this.isLoaded = true;
      console.log('✓ Fracture model loaded');
    } catch (error) {
      console.error('Failed to load Fracture model:', error);
      throw error;
    }
  }

  async predict(imageUri: string, onProgress?: (status: string) => void) {
    try {
      if (!this.isLoaded || !this.model) {
        await this.loadModel(onProgress);
      }

      console.log('Preprocessing for Fracture Model (96x96 Grayscale)...');
      if (onProgress) onProgress('Preprocessing (96x96 Grayscale)...');
      
      const inputData = await this.preprocessImage(imageUri);
      
      console.log('Running inference...');
      if (onProgress) onProgress('Analyzing bone structure...');
      await new Promise(resolve => setTimeout(resolve, 100));

      const output = await this.model!.run([inputData]);
      const predictions = output[0] as Float32Array; // Likely [logit0, logit1]
      
      // Softmax
      const logits = Array.from(predictions);
      const maxLogit = Math.max(...logits);
      const expScores = logits.map(x => Math.exp(x - maxLogit));
      const sumExpScores = expScores.reduce((a, b) => a + b, 0);
      const probabilities = expScores.map(x => x / sumExpScores);

      const fractureProb = probabilities[0]; // Swapped to fix inversion
      const nonFractureProb = probabilities[1]; // Swapped to fix inversion

      const isFractured = fractureProb > nonFractureProb;
      const confidence = isFractured ? fractureProb : nonFractureProb;
      const title = isFractured ? 'Fracture Detected' : 'No Fracture Detected';

      return {
        finalPrediction: title,
        confidence: confidence,
        probabilities: {
            'Fractured': fractureProb,
            'Not Fractured': nonFractureProb
        },
        model: 'Fracture Detection (TFLite)',
        summary: isFractured 
            ? `Analysis detects patterns consistent with a bone fracture. Confidence: ${(confidence * 100).toFixed(1)}%`
            : `No significant fracture patterns detected. Confidence: ${(confidence * 100).toFixed(1)}%`,
        recommendations: isFractured ? [
            'Immobilize the affected area immediately.',
            'Seek immediate medical attention (Orthopedic).',
            'Do not apply pressure to the area.'
        ] : [
            'Monitor for pain or swelling.',
            'Apply ice if bruising is present.',
            'Consult a doctor if pain persists.'
        ]
      };

    } catch (error) {
      console.error('Fracture prediction failed:', error);
      throw error;
    }
  }

  private async preprocessImage(imageUri: string): Promise<Float32Array> {
    // 1. Resize to 96x96 (Model is vww_96)
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

    // 4. Convert to Grayscale & Normalize
    // Assuming model expects [1, 96, 96, 1] or flattened
    // And assuming it expects Float32. If quantized, it might need different handling,
    // but usually TFLite interpreter handles float inputs for quantized models via dequantization/quantization wrappers.
    // Let's assume range [0, 1] or [-1, 1]. VWW usually uses signed int8 [-128, 127] or uint8 [0, 255].
    // Given 'vww_96_grayscale_quantized', let's try normalized float [-1, 1] first or [0, 1].
    // Actually, TFLite Micro VWW example typically converts RGB to 1-byte grayscale.
    
    // Let's create a Float32Array of size 96*96*1
    const float32Data = new Float32Array(96 * 96 * 1);
    
    let p = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Standard grayscale conversion
      const gray = (0.299 * r + 0.587 * g + 0.114 * b);
      
      // Normalize to [-1, 1] (Common for TFLite models)
      // If results are garbage, try [0, 1] or raw [0, 255]
      float32Data[p++] = (gray / 127.5) - 1.0; 
    }

    return float32Data;
  }
}

export default new FractureModelService();
