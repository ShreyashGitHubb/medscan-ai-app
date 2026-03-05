export interface CrossCheckResult {
    adjustedConfidence: number;
    warningMessage?: string;
    isMismatched: boolean;
}

class SymptomLogicEngine {
    
    /**
     * Evaluates the AI's visual prediction against the user's self-reported symptoms.
     * @param type The type of scan (skin, tooth, fracture, mri)
     * @param prediction The string prediction from the model
     * @param rawConfidence The confidence score (0.0 to 1.0)
     * @param symptoms The parsed JSON object of user symptoms
     * @returns CrossCheckResult with adjusted confidence and warnings
     */
    evaluate(type: string, prediction: string, rawConfidence: number, symptoms: any): CrossCheckResult {
        if (!symptoms || rawConfidence < 0.3) {
            return { adjustedConfidence: rawConfidence, isMismatched: false };
        }

        let warning = "";
        let penalty = 0;
        
        // Convert to lowercase string for easy keyword matching
        const text = JSON.stringify(symptoms).toLowerCase();

        if (type === 'skin') {
            if (prediction.includes("Melanoma")) {
                // If user explicitly says "no" changes or "years", it might be a regular mole
                if ((text.includes("no ") && text.includes("change")) || text.includes("years") || text.includes("always")) {
                   penalty += 0.25;
                   warning = "AI Alert: Melanoma typically changes shape rapidly. You reported no recent changes, so this could be a benign mole. However, still consult a dermatologist.";
                }
            } else if (prediction.includes("Eczema") || prediction.includes("Atopic Dermatitis")) {
                 if (!text.includes("itch") && !text.includes("dry")) {
                    penalty += 0.15;
                    warning = "AI Alert: Eczema heavily correlates with severe itching. Your lack of reported itching lowers the probability of this diagnosis.";
                 }
            } else if (prediction.includes("Acne")) {
                 if (text.includes("painful") && text.includes("spreading")) {
                     warning = "AI Alert: While identified as Acne, painful spreading could indicate a deeper Staph infection. Keep it clean.";
                 }
            }
        } else if (type === 'tooth') {
             if (prediction.includes("Caries") || prediction.includes("Cavity")) {
                  if (!text.includes("sweet") && !text.includes("cold") && !text.includes("pain")) {
                      penalty += 0.15;
                      warning = "AI Alert: Cavities usually cause sensitivity to sweets or cold. Without these symptoms, this may be superficial tooth discoloration or staining.";
                  }
             } else if (prediction.includes("Calculus") || prediction.includes("Plaque")) {
                 if (text.includes("throbbing") || text.includes("severe pain")) {
                     penalty += 0.10;
                     warning = "AI Alert: Calculus (tartar) itself does not usually cause severe throbbing pain. You may have an underlying infection or deep cavity.";
                 }
             }
        } else if (type === 'fracture') {
             if (prediction.toLowerCase().includes("fracture") || prediction.toLowerCase().includes("broken")) {
                  if (text.includes("full mobility") || text.includes("can move fine") || text.includes("1/10") || text.includes("2/10")) {
                      penalty += 0.20;
                      warning = "AI Alert: A bone fracture typically presents with severe pain and limited mobility. Your reported low pain suggests this could be a sprain instead of a break.";
                  }
             }
        }

        // Apply penalty but ensure confidence doesn't drop below 10%
        const adjusted = Math.max(0.10, rawConfidence - penalty);
        
        return {
            adjustedConfidence: adjusted,
            warningMessage: warning ? warning : undefined,
            isMismatched: penalty > 0
        };
    }
}

export default new SymptomLogicEngine();
