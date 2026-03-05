export interface OODResult {
    isOOD: boolean;
    reason?: string;
}

class OODDetectionService {
    /**
     * TFLite vision models trained without a "background" or "none" class
     * will always force an output sum to 1.0 (100%).
     * 
     * However, if the image is truly random (a water bottle), the model
     * often struggles to reach a distinct high peak, OR it reaches a peak but
     * the secondary classes are completely illogical.
     * 
     * @param top1Confidence The raw confidence of the top prediction (0.0 - 1.0)
     * @param top2Confidence The raw confidence of the second prediction (0.0 - 1.0)
     * @param modelType "skin", "tooth", "fracture"
     */
    evaluateProbabilities(top1Confidence: number, top2Confidence: number, modelType: string): OODResult {
        // TFLite models on softmax usually hit > 0.85 when they see what they were trained on.
        // If a model is looking at a keyboard, it might say "Melanoma 0.45, Nevus 0.30"
        
        let requiredConfidence = 0.60; // Base requirement: Must be at least 60% sure.

        if (modelType === 'skin') {
            requiredConfidence = 0.55; 
        } else if (modelType === 'tooth') {
            requiredConfidence = 0.50; // Tooth model has many classes, spread is wider
        } else if (modelType === 'fracture') {
            requiredConfidence = 0.70; // Binary (fracture/normal), so should be highly confident
        }

        if (top1Confidence < requiredConfidence) {
            return {
                isOOD: true,
                reason: `Confidence too low (${(top1Confidence * 100).toFixed(1)}%). The AI does not strongly recognize a valid ${modelType} condition. Please take a closer, clearer photo of the affected area.`
            };
        }

        // Entropy / Margin Check
        // If the top 2 guesses are almost identical in probability, the model is guessing blindly.
        const margin = top1Confidence - top2Confidence;
        if (margin < 0.05 && top1Confidence < 0.80) {
             return {
                 isOOD: true,
                 reason: `The AI is highly confused between multiple conditions (Margin: ${(margin * 100).toFixed(1)}%). This usually happens when taking a photo of an unrelated object or a very blurry area.`
             };
        }

        return { isOOD: false };
    }
}

export default new OODDetectionService();
