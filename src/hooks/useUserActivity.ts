import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSocket } from '@/lib/socket-context';

export const useUserActivity = () => {
    const { socket, isConnected } = useSocket();
    const pathname = usePathname();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Determine activity based on pathname
        let activityType = 'VIEW_PAGE';
        let activityDetails: any = { path: pathname };

        if (pathname === '/') {
            activityType = 'IDLE'; // Or 'VIEW_HOME'
        } else if (pathname.startsWith('/pdfs/')) {
            activityType = 'VIEW_PDF';
            const pdfId = pathname.split('/pdfs/')[1];
            activityDetails = { ...activityDetails, pdfId };
        } else if (pathname.startsWith('/courses/')) {
            activityType = 'VIEW_COURSE';
            const courseId = pathname.split('/courses/')[1];
            activityDetails = { ...activityDetails, courseId };
        }

        socket.emit('activity_update', {
            type: activityType,
            details: activityDetails,
        });

    }, [socket, isConnected, pathname]);
};
