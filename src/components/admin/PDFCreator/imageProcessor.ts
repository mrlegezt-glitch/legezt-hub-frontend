export type FilterType = 'original' | 'grayscale' | 'magic' | 'bw';

export const applyFilter = async (
    imageUrl: string,
    filter: FilterType,
    options?: { threshold?: number }
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            if (filter === 'grayscale') {
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg;     // R
                    data[i + 1] = avg; // G
                    data[i + 2] = avg; // B
                }
            } else if (filter === 'bw') {
                const threshold = options?.threshold ?? 128; // Default to 128 if not provided
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    const val = avg > threshold ? 255 : 0; // Dynamic threshold
                    data[i] = val;
                    data[i + 1] = val;
                    data[i + 2] = val;
                }
            } else if (filter === 'magic') {
                // "Magic Color": Increase contrast and saturation
                // Simplified implementation: High contrast + slight sharpening feel
                const contrast = 1.2; // Increase contrast by 20%
                const intercept = 128 * (1 - contrast);

                for (let i = 0; i < data.length; i += 4) {
                    data[i] = data[i] * contrast + intercept;
                    data[i + 1] = data[i + 1] * contrast + intercept;
                    data[i + 2] = data[i + 2] * contrast + intercept;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };

        img.onerror = (err) => reject(err);
    });
};
