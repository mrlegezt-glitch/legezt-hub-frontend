import jsPDF from 'jspdf';

export const generatePDFFromImages = async (
    images: string[],
    filename: string = 'scanned_document.pdf'
): Promise<File> => {
    // Default to A4 size
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < images.length; i++) {
        if (i > 0) {
            pdf.addPage();
        }

        const img = await loadImage(images[i]);

        // Calculate aspect ratio to fit page
        const imgRatio = img.width / img.height;
        const pageRatio = pdfWidth / pdfHeight;

        let renderWidth = pdfWidth;
        let renderHeight = pdfHeight;
        let x = 0;
        let y = 0;

        if (imgRatio > pageRatio) {
            // Image is wider than page (fit width)
            renderHeight = pdfWidth / imgRatio;
            y = (pdfHeight - renderHeight) / 2; // Center vertical
        } else {
            // Image is taller than page (fit height)
            renderWidth = pdfHeight * imgRatio;
            x = (pdfWidth - renderWidth) / 2; // Center horizontal
        }

        pdf.addImage(images[i], 'JPEG', x, y, renderWidth, renderHeight);
    }

    const blob = pdf.output('blob');
    return new File([blob], filename, { type: 'application/pdf' });
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};
