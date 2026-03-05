import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';

export interface QualityResult {
    isBlurry: boolean;
    isTooDark: boolean;
    isTooBright: boolean;
    blurScore: number;
    brightnessScore: number;
    passed: boolean;
    message?: string;
}

class ImageQualityService {
    // Thresholds
    private readonly BLUR_THRESHOLD = 80; // Variance of Laplacian threshold (lower = blurrier)
    private readonly MIN_BRIGHTNESS = 40;  // 0-255 scale
    private readonly MAX_BRIGHTNESS = 240; // 0-255 scale

    /**
     * Main entry point to check an image URI
     */
    async evaluateImage(uri: string): Promise<QualityResult> {
        try {
            console.log('Evaluating image quality for:', uri);

            // 1. Downscale the image massively to ensure speed and prevent memory crashes
            // We only need a rough map for variance and average brightness
            const resized = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 256 } }],
                { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8, base64: true }
            );

            // 2. Decode JPEG pixel data
            // Since we asked for base64 from Manipulator, we convert that to a Buffer
            if (!resized.base64) {
                throw new Error("Base64 string was not generated");
            }

            const rawBuffer = Buffer.from(resized.base64, 'base64');
            const jpegData = jpeg.decode(rawBuffer, { useTArray: true }); // Returns Uint8Array

            const width = jpegData.width;
            const height = jpegData.height;
            const data = jpegData.data; // RGBA array [R, G, B, A, R, G, B, A...]

            // 3. Convert to Grayscale
            const grayscale = new Float32Array(width * height);
            let totalBrightness = 0;

            for (let i = 0; i < width * height; i++) {
                const r = data[i * 4];
                const g = data[i * 4 + 1];
                const b = data[i * 4 + 2];
                // Standard grayscale conversion (Luminance)
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                grayscale[i] = gray;
                totalBrightness += gray;
            }

            const averageBrightness = totalBrightness / (width * height);

            // 4. Calculate Variance of Laplacian (Blur detection)
            // A higher variance means more edges (sharper image). A lower variance means fewer edges (blurry).
            let meanLaplacian = 0;
            const laplacianSquares = [];

            // Apply 3x3 Laplacian filter kernel
            // [ 0  1  0 ]
            // [ 1 -4  1 ]
            // [ 0  1  0 ]
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;
                    const top = grayscale[(y - 1) * width + x];
                    const bottom = grayscale[(y + 1) * width + x];
                    const left = grayscale[y * width + (x - 1)];
                    const right = grayscale[y * width + (x + 1)];
                    const center = grayscale[idx];

                    const laplacian = top + bottom + left + right - 4 * center;
                    meanLaplacian += laplacian;
                }
            }

            const numPixels = (width - 2) * (height - 2);
            meanLaplacian = meanLaplacian / numPixels;

            let variance = 0;
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;
                    const top = grayscale[(y - 1) * width + x];
                    const bottom = grayscale[(y + 1) * width + x];
                    const left = grayscale[y * width + (x - 1)];
                    const right = grayscale[y * width + (x + 1)];
                    const center = grayscale[idx];

                    const laplacian = top + bottom + left + right - 4 * center;
                    variance += Math.pow(laplacian - meanLaplacian, 2);
                }
            }

            variance = variance / numPixels;

            console.log(`Quality check completed. Variance: ${variance.toFixed(2)}, Brightness: ${averageBrightness.toFixed(2)}`);

            // 5. Build Result
            const isBlurry = variance < this.BLUR_THRESHOLD;
            const isTooDark = averageBrightness < this.MIN_BRIGHTNESS;
            const isTooBright = averageBrightness > this.MAX_BRIGHTNESS;

            let message = "";
            if (isBlurry && isTooDark) {
                message = "The image is too blurry and too dark. The AI prediction will be highly inaccurate.";
            } else if (isBlurry) {
                message = "The image is blurry. Try holding the camera steady and tapping to focus.";
            } else if (isTooDark) {
                message = "The image is too dark. Please move to a well-lit area.";
            } else if (isTooBright) {
                message = "The image is too bright or overexposed.";
            }

            return {
                isBlurry,
                isTooDark,
                isTooBright,
                blurScore: variance,
                brightnessScore: averageBrightness,
                passed: !(isBlurry || isTooDark || isTooBright),
                message: message ? message : undefined
            };

        } catch (error) {
            console.error("Image quality evaluation failed:", error);
            // Fail open: If the check itself fails, we allow the scan to proceed so the app doesn't break.
            return {
                isBlurry: false,
                isTooDark: false,
                isTooBright: false,
                blurScore: Number.MAX_SAFE_INTEGER,
                brightnessScore: 128,
                passed: true
            };
        }
    }
}

export default new ImageQualityService();
