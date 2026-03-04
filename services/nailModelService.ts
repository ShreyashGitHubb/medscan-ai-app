

import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { Asset } from 'expo-asset';
import { Buffer } from 'buffer';
import Constants from 'expo-constants';

// Nail disease classes
const LABELS = [
  "Acral_Lentiginous_Melanoma",
  "Healthy_Nail",
  "Onychogryphosis",
  "blue_finger",
  "clubbing",
  "pitting"
];

const DISPLAY_NAMES = {
  "Acral_Lentiginous_Melanoma": "Acral Lentiginous Melanoma",
  "Healthy_Nail": "Healthy Nail",
  "Onychogryphosis": "Onychogryphosis (Ram's Horn Nail)",
  "blue_finger": "Blue Finger (Cyanosis)",
  "clubbing": "Nail Clubbing",
  "pitting": "Nail Pitting"
};

// Disease information database
const DISEASE_INFO: any = {
  Acral_Lentiginous_Melanoma: {
    severity: 'Critical',
    urgency: 'Emergency - Immediate Medical Attention',
    treatment: [
      '🚨 URGENT: Consult oncologist/dermatologist immediately',
      'Surgical excision',
      'Biopsy required for confirmation',
      'Check lymph nodes'
    ],
    precautions: [
      '⚠️ SKIN CANCER - Aggressive type',
      'Do not ignore dark streaks on nails',
      'Early detection saves lives',
      'Review family history of melanoma'
    ]
  },
  Healthy_Nail: {
    severity: 'None',
    urgency: 'Routine',
    treatment: [
      'Maintain good hygiene',
      'Keep nails trimmed and clean',
      'Moisturize cuticles'
    ],
    precautions: [
      'Continue regular nail care',
      'Avoid harsh chemicals',
      'Wear gloves when doing dishes/cleaning'
    ]
  },
  Onychogryphosis: {
    severity: 'Moderate',
    urgency: 'Consult Podiatrist/Dermatologist',
    treatment: [
      'Professional nail trimming/debridement',
      'Topical urea creams',
      'Proper footwear',
      'Surgical removal in severe cases'
    ],
    precautions: [
      'Avoid tight shoes',
      'Keep feet clean and dry',
      'Do not attempt to cut thick nails at home'
    ]
  },
  blue_finger: {
    severity: 'High',
    urgency: 'Urgent - Seek Medical Attention',
    treatment: [
      'Check oxygen levels (Pulse Oximetry)',
      'Warm the hands/feet',
      'Consult doctor for heart/lung evaluation',
      'Review medications with doctor'
    ],
    precautions: [
      '⚠️ Sign of low oxygen or circulation issues',
      'Do not ignore if accompanied by shortness of breath',
      'Keep extremities warm'
    ]
  },
  clubbing: {
    severity: 'High',
    urgency: 'Consult Healthcare Provider',
    treatment: [
      'Evaluate underlying cause (heart/lung)',
      'Chest X-ray or CT scan may be needed',
      'Blood tests for oxygen levels',
      'Treat the primary condition'
    ],
    precautions: [
      '⚠️ Often a sign of systemic disease',
      'Monitor breathing and energy levels',
      'Report any chest pain or cough'
    ]
  },
  pitting: {
    severity: 'Moderate',
    urgency: 'Routine - Consult Dermatologist',
    treatment: [
      'Evaluation for psoriasis or eczema',
      'Topical corticosteroids',
      'Vitamin D analogues',
      'Keep nails short'
    ],
    precautions: [
      'Avoid trauma to nails',
      'Do not clean under nails aggressively',
      'Monitor for joint pain (psoriatic arthritis)'
    ]
  },
  default: {
    severity: 'Moderate',
    urgency: 'Consult Healthcare Provider',
    treatment: ['Professional medical evaluation recommended', 'Topical treatments as prescribed'],
    precautions: ['Seek professional medical advice for proper diagnosis and treatment']
  }
};

class NailModelService {
  private model: any | null = null;
  private isLoaded = false;
  // This will point to the real tflite file we are about to put in assets
  private modelPath = require('../assets/models/nail_model.tflite');

  constructor() {}

  async loadModel(onProgress?: (status: string) => void) {
    if (this.isLoaded && this.model) return;

    try {
      console.log('Loading Nail Model...');
      if (onProgress) onProgress('Initializing Nail Analysis Engine...');

      // Check for Expo Go
      if (Constants.appOwnership === 'expo') {
          console.warn('TFLite not supported in Expo Go. Switching to Mock Mode.');
          throw new Error('TFLite not supported in Expo Go');
      }

      const asset = Asset.fromModule(this.modelPath);
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error('Failed to download model asset');
      }

      let loadTensorflowModel;
      try {
          const tflite = require('react-native-fast-tflite');
          loadTensorflowModel = tflite.loadTensorflowModel;
      } catch (e) {
          throw new Error('Native TFLite module not found');
      }

      this.model = await loadTensorflowModel({ url: asset.localUri });
      this.isLoaded = true;
      console.log('Nail model loaded');

    } catch (error) {
      console.error('Failed to load Nail model:', error);
      throw error;
    }
  }

  async predict(imageUri: string, onProgress?: (status: string) => void) {
    try {
      if (!this.isLoaded || !this.model) {
        // Attempt to load if not loaded (will fail in Expo Go, triggering catch -> mock)
        await this.loadModel(onProgress);
      }

      console.log('Preprocessing image...');
      if (onProgress) onProgress('Preprocessing image...');
      const inputData = await this.preprocessImage(imageUri);
      
      console.log('Running inference...');
      if (onProgress) onProgress('Analyzing nail structure...');
      const output = await this.model!.run([inputData]);
      const logits = output[0] as Float32Array; 
      
      if (onProgress) onProgress('Finalizing diagnosis...');

      // Softmax
      const logitsArray = Array.from(logits);
      const maxLogit = Math.max(...logitsArray);
      const expScores = logitsArray.map(x => Math.exp(x - maxLogit));
      const sumExpScores = expScores.reduce((a, b) => a + b, 0);
      const probabilities = expScores.map(x => x / sumExpScores);

      const allPredictions = LABELS.map((className, idx) => ({
        className,
        // @ts-ignore
        displayName: DISPLAY_NAMES[className] || className,
        probability: probabilities[idx],
        confidence: probabilities[idx],
      })).sort((a, b) => b.probability - a.probability);

      const topPrediction = allPredictions[0];
      const diseaseInfo = DISEASE_INFO[topPrediction.className] || DISEASE_INFO['default'];

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
          model: 'Nail Disease Model (EfficientNet-B0)',
          timestamp: new Date().toISOString(),
        }
      };

    } catch (error) {
      console.error('Nail model inference failed:', error);
      // If model loading completely fails (should be rare with correct imports), use mock as last resort
      if (onProgress) onProgress('⚠️ Model failed - Using simulation...');
      return this.mockPredict(onProgress);
    }
  }

  private async preprocessImage(imageUri: string): Promise<Float32Array> {
    // Resize to 224x224 (EfficientNet standard)
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: 'base64'
    });

    const buffer = Buffer.from(base64, 'base64');
    const rawData = jpeg.decode(buffer, { useTArray: true }); 

    // Normalize (Standard ImageNet mean/std)
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    
    const float32Data = new Float32Array(224 * 224 * 3);
    const { data } = rawData; 
    
    let p = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255.0;
      const g = data[i + 1] / 255.0;
      const b = data[i + 2] / 255.0;

      float32Data[p++] = (r - mean[0]) / std[0]; 
      float32Data[p++] = (g - mean[1]) / std[1]; 
      float32Data[p++] = (b - mean[2]) / std[2]; 
    }

    return float32Data;
  }

  // Fallback Mock Prediction
  private async mockPredict(onProgress?: (status: string) => void) {
      if (onProgress) onProgress('Simulation Mode (Expo Go / Error)...');
      await new Promise(r => setTimeout(r, 1500));
      
      const randomIndex = Math.floor(Math.random() * LABELS.length);
      const predictedClass = LABELS[randomIndex];
      const confidence = 0.85 + (Math.random() * 0.14); 
      
      let remaining = 1.0 - confidence;
      const probabilitiesArray = LABELS.map((label, idx) => {
          if (idx === randomIndex) return confidence;
          return remaining / (LABELS.length - 1); 
      });

      const allPredictions = LABELS.map((className, idx) => ({
        className,
        // @ts-ignore
        displayName: DISPLAY_NAMES[className] || className,
        probability: probabilitiesArray[idx] || 0,
        confidence: probabilitiesArray[idx] || 0,
      })).sort((a, b) => b.probability - a.probability);

      const topPrediction = allPredictions[0];
      const diseaseInfo = DISEASE_INFO[topPrediction.className] || DISEASE_INFO['default'];

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
          model: 'Nail Disease Model (Simulated)',
          timestamp: new Date().toISOString(),
        }
      };
  }
}

export default new NailModelService();
