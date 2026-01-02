// ==================================
// API Client
// ==================================

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legezt-hub-api-prod.azurewebsites.net';

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Try to refresh token (using cookie)
            try {
                const response = await axios.post(`${API_URL}/api/auth/refresh`, {});

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                // Update store
                useAuthStore.getState().setTokens(accessToken, newRefreshToken);

                // Retry original request
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                return api(originalRequest);
            } catch {
                // Refresh failed - logout
                useAuthStore.getState().logout();
            }
        }

        return Promise.reject(error);
    }
);

// API methods
export const authApi = {
    loginWithGoogle: () => `${API_URL}/api/auth/google`,
    me: () => api.get('/auth/me'),
    logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
};

export const contentApi = {
    getColleges: () => api.get('/content/colleges'),
    getBranches: (collegeId: string) => api.get(`/content/colleges/${collegeId}/branches`),
    getYears: (branchId: string) => api.get(`/content/branches/${branchId}/years`),
    getSemesters: (yearId: string) => api.get(`/content/years/${yearId}/semesters`),
    getSubjects: (semesterId: string) => api.get(`/content/semesters/${semesterId}/subjects`),
    getSubject: (id: string) => api.get(`/content/subjects/${id}`),
    getSubjectsList: (params?: { yearId?: string; semesterId?: string; search?: string }) => api.get('/content/subjects', { params }),
    search: (query: string) => api.get('/content/search', { params: { q: query } }),
    deleteCollege: (id: string) => api.delete(`/content/colleges/${id}`),
};



export const pdfApi = {
    list: (params?: { folderId?: string; page?: number; search?: string; yearId?: string; semesterId?: string; subjectId?: string; type?: 'theory' | 'lab' }) => api.get('/pdfs', { params }),
    get: (id: string) => api.get(`/pdfs/${id}`),
    getViewUrl: (id: string) => api.get(`/pdfs/${id}/view`),
    getDownloadUrl: (id: string) => api.get(`/pdfs/${id}/download`),
    getFolders: (params?: { subjectId?: string; parentId?: string }) => api.get('/pdfs/folders', { params }),
    updateFolder: (id: string, name: string) => api.patch(`/pdfs/folders/${id}`, { name }),
};


export const podcastApi = {
    // Navigation
    getSubjects: () => api.get('/podcasts/subjects'),
    getFolders: (subjectId: string) => api.get(`/podcasts/folders/${subjectId}`),
    getFolderChildren: (folderId: string) => api.get(`/podcasts/folders/${folderId}/children`),

    // Core
    list: (params?: { folderId?: string; page?: number; search?: string }) => api.get('/podcasts', { params }),
    get: (id: string) => api.get(`/podcasts/${id}`),
    getPlayUrl: (versionId: string) => api.get(`/podcasts/versions/${versionId}/play`),

    // Admin
    createFolder: (data: { name: string; subjectId: string; parentId?: string | null }) => api.post('/podcasts/folders', data),
    createPodcast: (data: { title: string; folderId: string; description?: string; thumbnailUrl?: string }) => api.post('/podcasts', data),
    addVersion: (id: string, data: FormData) => api.post(`/podcasts/${id}/versions`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    addSlide: (id: string, data: FormData) => api.post(`/podcasts/${id}/slides`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const courseApi = {
    list: (params?: { isPaid?: boolean; page?: number }) => api.get('/courses', { params }),
    get: (id: string) => api.get(`/courses/${id}`),
    enroll: (id: string) => api.post(`/courses/${id}/enroll`),
};

export const labApi = {
    getCourses: () => api.get('/labs/courses'),
    getCourse: (id: string) => api.get(`/labs/courses/${id}`),

    // Admin
    getDashboardStats: () => api.get('/labs/dashboard/stats'),
    createCourse: (data: any) => api.post('/labs/courses', data),
    deleteCourse: (id: string) => api.delete(`/labs/courses/${id}`),

    // Content Hierarchy
    getCourseContent: (courseId: string) => api.get(`/labs/courses/${courseId}/content`),
    createUnit: (data: any) => api.post('/labs/units', data),
    createExperiment: (data: any) => api.post('/labs/experiments', data),
    getExperiment: (id: string) => api.get(`/labs/experiments/${id}`),
};

export const userApi = {
    getProfile: () => api.get('/auth/me'),
    getActivity: () => api.get('/users/me/activity'),
    getBookmarks: () => api.get('/users/me/bookmarks'),
    toggleBookmark: (pdfId: string) => api.post(`/users/me/bookmarks/${pdfId}`),
    updateSettings: (data: any) => api.patch('/users/me/settings', data),
};

export const assessmentApi = {
    // Student
    getMine: () => api.get('/assessments/mine'),

    // Admin
    list: () => api.get('/assessments'),
    create: (data: any) => api.post('/assessments', data),
    delete: (id: string) => api.delete(`/assessments/${id}`),
};

export default api;

