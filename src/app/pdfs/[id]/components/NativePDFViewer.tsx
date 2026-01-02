import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface NativePDFViewerProps {
    url: string;
}

export const NativePDFViewer: React.FC<NativePDFViewerProps> = ({ url }) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => [
            defaultTabs[0], // Thumbnails
            // Remove bookmarks/attachments if causing issues, but keeping thumbnails is good
        ],
    });

    return (
        <div className="h-full w-full bg-gray-900 text-white">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                    fileUrl={url}
                    plugins={[defaultLayoutPluginInstance]}
                    theme="dark"
                />
            </Worker>
        </div>
    );
};
