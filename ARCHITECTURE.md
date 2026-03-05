# AI Medical Scanner - Comprehensive Architecture & Technical Document

## 1. Project Overview & Goal
**Aim:** To provide a powerful, privacy-first, offline-capable AI medical screening tool that operates directly on mobile devices.
**Goal:** Empower users in rural or low-connectivity areas to get immediate, highly accurate preliminary screenings for skin dermatoses, dental anomalies, and bone fractures without requiring a continuous internet connection, expensive cloud API keys, or compromising their medical data privacy.

The application achieves this by bringing sophisticated Machine Learning models (Convolutional Neural Networks) out of the cloud and shrinking them down to run directly on the user's mobile CPU/GPU.

---

## 2. High-Level Architecture
The application is built using **React Native (Expo)**, which allows a single codebase to deploy natively to both Android and iOS devices.

### Key Components:
1. **The UI Frontend (React Native):** Handles the camera module, user symptom surveys, offline history storage, and the results dashboard.
2. **The Offline AI Engine:** Uses Google's TensorFlow Lite (TFLite) C++ libraries to load mathematical model files (`.tflite`) into the phone's RAM and process images using the phone's native hardware processors.
3. **The Multi-Tier Safety Guard (New Architecture):** A mathematical processing layer (Services) that sits between the UI and the AI to ensure the AI isn't forced to analyze bad photos or objects, and cross-references its answers against user-reported symptoms.
4. **Local Data Persistence:** Uses `AsyncStorage` and Expo's FileSystem to keep a private, encrypted log of all past scans locally on the user's device, ensuring zero HIPAA compliance risks since data never hits a central database.

---

## 3. Low-Level Technical Pipeline: How an Image Becomes a Diagnosis

When a user snaps a photo of a mole, a highly complex chain of events occurs in milliseconds:

### Phase 1: Pre-Inference Image Quality Firewall (`imageQualityService.ts`)
*Before* the AI touches the image, the app must verify it is physically scannable.
- **Resizing:** `expo-image-manipulator` violently downscales the 4K photograph down to 256x256 pixels to prevent phone memory (`RAM`) from overflowing.
- **Grayscale Conversion:** The `jpeg-js` library decodes the actual hexadecimal bitmap data of the photo and converts every RGBA pixel into a single luminance (Grayscale) value.
- **Laplacian Variance Math:** It sweeps a 3x3 mathematical matrix (a Kernel) across the entire image. This matrix mathematically isolates "edges". If the variance of these edges is beneath a threshold of `80`, the image is deemed "Blurry" (meaning the camera did not focus).
- **Outcome:** The app blocks the scan to prevent the AI from guessing wildly on a blurry photo.

### Phase 2: AI Hardware Execution (`react-native-fast-tflite`)
Once the image passes quality control, it is handed to the AI model.
- **Tensor Allocation:** The `.tflite` model (which is essentially megabytes of mathematical weights floating in a graph structure) is loaded into the mobile processor (CPU or GPU via CoreML/NNAPI delegates).
- **Formatting:** Since the AI models were trained on 224x224 arrays of Float32 numbers ranging from -1.0 to 1.0, the app resizes the image exactly to 224x224 and normalizes the RGB values pixel-by-pixel into a 1D Float32Array.
- **Inference Computation:** For fractions of a second, the phone's processor blasts this 150,528-number array (`224 * 224 * 3`) through millions of mathematical multiplication layers (Convolutions, Pooling, Dense Layers) inside the model.
- **Output:** The model spits out a final "Softmax" array. E.g., `[0.85, 0.10, 0.05...]` corresponding to the list of known diseases.

### Phase 3: Out-of-Distribution (OOD) Object Rejection (`oodDetectionService.ts`)
Vision AI models suffer from a fundamental flaw: they are trained *only* on diseases, not on "water bottles" or "books". If you point the camera at a wall, the AI will forcefully output a mathematical answer mapping to the closest disease it knows.
- **The Fix:** The OOD service intercepts the Softmax output array.
- **Shannon Entropy Check:** It analyzes the "spread" or "Margin" of the predictions. If the AI is looking at real Skin Melanoma, it might say *Melanoma: 85%, Nevus: 10%* (Margin 75%). If it looks at a water bottle, it is highly confused and the spread flattens out: *Melanoma: 18%, Eczema: 17%, Acne: 15%* (Margin 1%).
- **Outcome:** If the margin is too tight or confidence falls below ~60%, the app determines it's looking at an irrelevant object and safely blocks the final result.

### Phase 4: Symptom Logic Engine (`symptomLogicEngine.ts`)
AI vision models are blind to patient history.
- The Engine takes the text JSON the user entered in the pre-scan survey (`"started 10 years ago"`) and compares it against the AI's final visual guess (`Melanoma`).
- Based on hard-coded Javascript logic rules, if the AI predicts an aggressive, fast-moving skin cancer, but the user says the spot hasn't changed in a decade, the logic engine forcefully reduces the AI's math confidence score by -25%.
- **Outcome:** A "Symptom Mismatch" warning is generated and injected into the final UI.

### Phase 5: Result Rendering & The Cloud (`wikiMedicalService.ts`)
Finally, the UI builds the layout card for the user.
- The confidence number, warnings, and predicted title are shown.
- **Online Enhancements:** If `expo-network` detects Wi-Fi/LTE, the app makes an invisible HTTP GET request to `en.wikipedia.org/w/api.php?action=query` asking for the summary of the predicted title. The JSON response is parsed and displayed so the user can read a verified description.
- **Google Linking:** Shortcuts are generated to open the device's native browser to `google.com/search?tbm=isch&q=[Disease]` providing immediate, massive visual comparisons.

### Phase 6: Private History Storage (`historyService.ts`)
- Instead of using Firebase or Supabase cloud databases, the application strings together the JSON result and saves it into the physical hard drive of the phone via `AsyncStorage` and `expo-file-system`.
- Because images are large, the app saves the image locally in the app's sandboxed document directory, and saves the *path directory string* inside the history log database.

---
**Summary:** What feels like "taking a photo of an arm" to the user is actually a complex orchestration of matrix mathematics, local file system management, C++ bridged neural-networks, and Javascript logic engines—all happening invisibly locally on the phone's silicon processor in under 1.5 seconds.
