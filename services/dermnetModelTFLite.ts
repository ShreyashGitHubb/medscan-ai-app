
// import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite'; // Removed top-level import
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { Asset } from 'expo-asset';
import { Buffer } from 'buffer';
import dermnetLabels from '../assets/models/dermnet_labels.json';
import Constants from 'expo-constants';

// Skin disease classes for DermNet
const LABELS = dermnetLabels.classes;
const DISPLAY_NAMES = dermnetLabels.display_names;

// Disease information database (Simplified/Copied from legacy service)
const DISEASE_INFO: any = {
  melanoma_skin_cancer_nevi_and_moles: {
    severity: 'Critical',
    urgency: 'Emergency - Immediate Medical Attention',
    treatment: [
      '🚨 URGENT: Consult oncologist/dermatologist immediately',
      'Surgical excision with margins',
      'Sentinel lymph node biopsy',
      'Immunotherapy or targeted therapy if metastatic'
    ],
    precautions: [
      '⚠️ SKIN CANCER - Time-sensitive condition',
      'Do not delay medical consultation',
      'Monitor for changes in size, shape, or color',
      'Complete sun protection mandatory'
    ]
  },
  actinic_keratosis_basal_cell_carcinoma: {
    severity: 'High',
    urgency: 'Urgent - Requires Specialist',
    treatment: [
      'Seek dermatologist immediately',
      'Cryotherapy or surgical removal',
      'Topical chemotherapy agents',
      'Photodynamic therapy'
    ],
    precautions: [
      '⚠️ Potential skin cancer - early detection critical',
      'Avoid sun exposure',
      'Use broad-spectrum SPF 50+',
      'Regular skin checks essential'
    ]
  },
  eczema: {
    severity: 'Mild to Moderate',
    urgency: 'Routine',
    treatment: [
      'Moisturizers (emollients)',
      'Topical corticosteroids',
      'Avoid irritants and allergens',
      'Cool compresses for itching'
    ],
    precautions: [
      'Identify and avoid triggers',
      'Keep skin well-moisturized',
      'Wear soft, breathable fabrics',
      'Manage stress levels'
    ]
  },
  // Normal Skin / Systemic Disease fallback
  systemic_disease: {
    severity: 'Normal',
    urgency: 'None',
    treatment: [
      'Maintain good hygiene',
      'Use daily moisturizer',
      'Apply sunscreen when outdoors',
      'Stay hydrated'
    ],
    precautions: [
      'Skin appears normal and healthy',
      'Continue regular routine',
      'Consult a doctor if any new symptoms appear'
    ]
  },
  // Default fallback for others
  default: {
    severity: 'Moderate',
    urgency: 'Consult Healthcare Provider',
    treatment: ['Professional medical evaluation recommended', 'Topical treatments as prescribed'],
    precautions: ['Seek professional medical advice for proper diagnosis and treatment']
  }
};

class DermNetTFLiteService {
  private model: any | null = null; // Type: TensorflowModel (lazy loaded)
  private isLoaded = false;
  private modelPath = require('../assets/models/dermnet.tflite');

  constructor() {}

  async loadModel(onProgress?: (status: string) => void) {
    if (this.isLoaded && this.model) return;

    try {
      console.log('Loading DermNet TFLite model...');
      
      // 1. Check for Expo Go environment FIRST to avoid unnecessary downloads
      // TFLite (react-native-fast-tflite) requires native code not present in Expo Go
      if (Constants.appOwnership === 'expo') {
          console.warn('TFLite not supported in Expo Go. Skipping download.');
          if (onProgress) onProgress('Expo Go detected - Switching to Mock Mode...');
          // Small delay to let user read the status
          await new Promise(r => setTimeout(r, 1000));
          throw new Error('TFLite not supported in Expo Go (Native module missing).');
      }

      if (onProgress) onProgress('Preparing model assets...');
      
      const asset = Asset.fromModule(this.modelPath);
      
      if (onProgress) onProgress('Downloading model to device cache...');
      await asset.downloadAsync();
      
      if (!asset.localUri) {
        throw new Error('Failed to download model asset locally');
      }

      // Lazy load to avoid crash in Expo Go
      if (onProgress) onProgress('Loading native neural engine...');
      
      let loadTensorflowModel;
      try {
          // Robust require
          const tflite = require('react-native-fast-tflite');
          loadTensorflowModel = tflite.loadTensorflowModel;
      } catch (e) {
          throw new Error('Native TFLite module not found. Rebuild development client.');
      }
      
      // TFLite expects { url: string } object, not plain string
      this.model = await loadTensorflowModel({ url: asset.localUri });
      
      this.isLoaded = true;
      console.log('✓ DermNet TFLite model loaded successfully');
    } catch (error) {
      console.error('Failed to load DermNet TFLite model:', error);
      throw error;
    }
  }

  async predict(imageUri: string, onProgress?: (status: string) => void) {
    try {
      if (!this.isLoaded || !this.model) {
        await this.loadModel(onProgress);
      }

      console.log('Preprocessing image...');
      if (onProgress) onProgress('Preprocessing image (Resize 224x224)...');
      const inputData = await this.preprocessImage(imageUri);
      
      console.log('Running inference...');
      if (onProgress) onProgress('Running neural analysis...');
      // Small delay to let UI show the status update
      await new Promise(resolve => setTimeout(resolve, 100)); 

      const output = await this.model!.run([inputData]);
      const predictions = output[0] as Float32Array; 
      
      if (!predictions) {
        throw new Error('Model returned no predictions');
      }

      if (onProgress) onProgress('Finalizing results...');
      
      // 1. Logits to Probabilities (Softmax)
      // The model returns raw logits (unbounded scores), we must normalize them.
      const logits = Array.from(predictions);
      const maxLogit = Math.max(...logits);
      const expScores = logits.map(x => Math.exp(x - maxLogit)); // Subtract max for numerical stability
      const sumExpScores = expScores.reduce((a, b) => a + b, 0);
      const probabilities = expScores.map(x => x / sumExpScores);

      // 2. Generate Heatmap (Experimental / Simulated)
      // Since standard TFLite models don't easily output gradients for Grad-CAM on mobile,
      // we'll rely on the UI overlay. Future: Implement separate segmentation model.
      
      const probabilitiesArray = probabilities;
      
      // Combine with labels
      const allPredictions = LABELS.map((className, idx) => {
        let displayName = DISPLAY_NAMES[className] || className;
        // Interpret 'systemic_disease' as Normal Skin
        if (className === 'systemic_disease') {
            displayName = 'Normal Skin';
        }
        return {
          className,
          // @ts-ignore
          displayName,
          probability: probabilitiesArray[idx],
          confidence: probabilitiesArray[idx],
        };
      }).sort((a, b) => b.probability - a.probability);
      
      const topPrediction = allPredictions[0];
      const diseaseInfo = DISEASE_INFO[topPrediction.className] || DISEASE_INFO['default'];

      // Format for ResultsScreen
      return {
        prediction: {
          title: topPrediction.displayName,
          confidence: `${(topPrediction.confidence * 100).toFixed(1)}%`,
          severity: diseaseInfo.severity,
          urgency: diseaseInfo.urgency,
        },
        probabilities: allPredictions.map(pred => ({
          name: pred.displayName,
          percentage: `${(pred.probability * 100).toFixed(2)}%`,
          value: pred.probability,
        })),
        recommendations: {
          treatment: diseaseInfo.treatment,
          precautions: diseaseInfo.precautions,
        },
        metadata: {
          model: 'DermNet ResNet50 (TFLite)',
          timestamp: new Date().toISOString(),
        }
      };

    } catch (error) {
      console.error('Prediction failed:', error);
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

    // 4. Normalize to Float32Array [1, 224, 224, 3]
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    
    const float32Data = new Float32Array(224 * 224 * 3);
    const { data } = rawData; 
    
    let p = 0; // pixel index
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255.0;
      const g = data[i + 1] / 255.0;
      const b = data[i + 2] / 255.0;
      // Alpha data[i+3] is ignored

      // Normalize
      float32Data[p++] = (r - mean[0]) / std[0]; // R
      float32Data[p++] = (g - mean[1]) / std[1]; // G
      float32Data[p++] = (b - mean[2]) / std[2]; // B
    }

    return float32Data;
  }
}

export default new DermNetTFLiteService();
