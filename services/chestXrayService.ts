
/**
 * Chest X-ray Model Service
 * TFLite model inference for pneumonia detection
 */

// import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite'; // Removed top-level import
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { Asset } from 'expo-asset';
import { Buffer } from 'buffer';
import Constants from 'expo-constants';

const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

const XRAY_CLASSES = ['Normal', 'Pneumonia'];

interface XrayPrediction {
  finalPrediction: string;
  confidence: number;
  probabilities: {
    'Normal': number;
    'Pneumonia': number;
  };
  details: string;
  recommendations: string[];
  model: string;
}

class ChestXrayService {
  private model: any | null = null; // Type: TensorflowModel (lazy loaded)
  private isLoaded = false;
  private modelPath = require('../assets/models/chest_xray.tflite');

  constructor() {}

  async loadModel(onProgress?: (status: string) => void) {
    if (this.isLoaded && this.model) return;

    try {
      console.log('Loading Chest X-ray TFLite model...');

      // 1. Check for Expo Go environment FIRST
      if (Constants.appOwnership === 'expo') {
          console.warn('TFLite not supported in Expo Go. Skipping download.');
          if (onProgress) onProgress('Expo Go detected - Switching to Mock Mode...');
          await new Promise(r => setTimeout(r, 1000));
          throw new Error('TFLite not supported in Expo Go.');
      }

      if (onProgress) onProgress('Preparing X-ray model...');
      
      const modelAsset = Asset.fromModule(this.modelPath);
      
      if (onProgress) onProgress('Downloading X-ray model...');
      await modelAsset.downloadAsync();
      
      if (!modelAsset.localUri) {
        throw new Error('Failed to download model asset locally');
      }

      // Lazy load to avoid crash in Expo Go
      if (onProgress) onProgress('Initializing native engine...');
      
      let loadTensorflowModel;
      try {
          const tflite = require('react-native-fast-tflite');
          loadTensorflowModel = tflite.loadTensorflowModel;
      } catch (e) {
         throw new Error('Native TFLite module not found. Rebuild development client or use EAS Build.');
      }
      
      // TFLite expects { url: string } object, not plain string
      this.model = await loadTensorflowModel({ url: modelAsset.localUri });
      this.isLoaded = true;
      console.log('✓ Chest X-ray model loaded');
    } catch (error) {
      console.error('Failed to load X-ray model:', error);
      throw error;
    }
  }

  async predict(imageUri: string, onProgress?: (status: string) => void): Promise<XrayPrediction> {
    try {
      if (!this.isLoaded || !this.model) {
        await this.loadModel(onProgress);
      }

      console.log('Preprocessing X-ray image...');
      if (onProgress) onProgress('Preprocessing X-ray (Resize 224x224)...');
      const inputData = await this.preprocessImage(imageUri);
      
      console.log('Running inference...');
      if (onProgress) onProgress('Analyzing opacities...');
      // Small delay to let UI show the status update
      await new Promise(resolve => setTimeout(resolve, 100));

      const output = await this.model!.run([inputData]);
      const predictions = output[0] as Float32Array;
      
      if (!predictions) {
        throw new Error('Model returned no predictions');
      }

      if (onProgress) onProgress('Interpreting results...');
      const logits = Array.from(predictions);
      
      // Softmax
      const maxLogit = Math.max(...logits);
      const expScores = logits.map(x => Math.exp(x - maxLogit)); 
      const sumExpScores = expScores.reduce((a, b) => a + b, 0);
      const probabilities = expScores.map(x => x / sumExpScores);

      const topIdx = probabilities.indexOf(Math.max(...probabilities));
      const prediction = XRAY_CLASSES[topIdx];
      const confidence = probabilities[topIdx];

      return {
        finalPrediction: prediction,
        confidence: confidence,
        probabilities: {
          'Normal': probabilities[0],
          'Pneumonia': probabilities[1]
        },
        details: prediction === 'Pneumonia' 
          ? 'Opacity detected suggesting consolidation or infiltrate consistent with pneumonia.'
          : 'No significant abnormalities detected. Lungs appear clear.',
        recommendations: prediction === 'Pneumonia' ? [
          'Clinical correlation with symptoms recommended',
          'Consider antibiotic therapy if indicated',
          'Follow-up imaging may be advised'
        ] : [
          'Continue routine monitoring',
          'Maintain good respiratory hygiene'
        ],
        model: 'Chest X-ray ResNet18 (TFLite)'
      };

    } catch (error) {
      console.error('X-ray prediction failed:', error);
      throw error;
    }
  }

  private async preprocessImage(imageUri: string): Promise<Float32Array> {
    // 1. Resize to 224x224
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2. Read as Base64
    const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: 'base64'
    });

    // 3. Decode JPEG to raw RGB
    const buffer = Buffer.from(base64, 'base64');
    const rawData = jpeg.decode(buffer, { useTArray: true }); 

    // 4. Normalize
    const float32Data = new Float32Array(224 * 224 * 3);
    const { data } = rawData;
    
    let p = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255.0;
      const g = data[i + 1] / 255.0;
      const b = data[i + 2] / 255.0;

      float32Data[p++] = (r - MEAN[0]) / STD[0]; 
      float32Data[p++] = (g - MEAN[1]) / STD[1]; 
      float32Data[p++] = (b - MEAN[2]) / STD[2]; 
    }

    return float32Data;
  }
}

export default new ChestXrayService();
