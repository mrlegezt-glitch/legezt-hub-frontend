import * as pdfjsLib from 'pdfjs-dist';

// Configure worker - Use a local copy or CDN. For Next.js, CDN is often easier to avoid webpack issues without complex config.
// However, since we installed pdfjs-dist, we should try to use the installed worker.
// Using unpkg as a reliable fallback for standardized environment.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export const convertPdfToImages = async (file: File): Promise<string[]> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const images: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);

            // Render at higher scale for better quality
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
            }).promise;

            // Convert to JPEG for efficiency
            const imageUrl = canvas.toDataURL('image/jpeg', 0.85);
            images.push(imageUrl);
        }

        return images;
    } catch (error) {
        console.error('Error converting PDF to images:', error);
        throw new Error('Failed to process PDF file.');
    }
};
