'use client';

import { useUserActivity } from '@/hooks/useUserActivity';

export const UserActivityTracker = () => {
    useUserActivity();
    return null;
};
