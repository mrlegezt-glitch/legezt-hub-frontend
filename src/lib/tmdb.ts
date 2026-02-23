import { MediaItem, PaginatedResponse, Genre } from '@/types/media';
import { MOCK_TRENDING, MOCK_GENRES, MOCK_DETAILS_BASE, getMockResponse } from './tmdb-mock';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IS_MOCK = !API_KEY || API_KEY === 'your_tmdb_api_key_here' || API_KEY.trim() === '';

const fetchTMDB = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
    // Graceful fallback if no API key is provided
    if (IS_MOCK) {
        console.warn('TMDB API Key missing. Using high-quality mock data for UI testing.');
        return handleMockRequest<T>(endpoint);
    }

    const queryParams = new URLSearchParams({
        api_key: API_KEY as string,
        ...params,
    });

    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`, {
        next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
        console.error(`TMDB API Error: ${response.status} ${response.statusText}`);
        // Fallback to mock data if API call fails
        return handleMockRequest<T>(endpoint);
    }

    return response.json();
};

// ==========================================
// Mock Handling Logic
// ==========================================
function handleMockRequest<T>(endpoint: string): T {
    // Simulated delay for realism
    if (endpoint.includes('/trending/') || endpoint.includes('/discover/') || endpoint.includes('/movie/popular') || endpoint.includes('/tv/popular')) {
        // Shuffle mock data slightly to make rows look distinct
        const shuffled = [...MOCK_TRENDING].sort(() => 0.5 - Math.random());
        return getMockResponse<MediaItem>(shuffled) as unknown as T;
    }

    if (endpoint.includes('/genre/')) {
        return { genres: MOCK_GENRES } as unknown as T;
    }

    if (endpoint.includes('/search/')) {
        return getMockResponse<MediaItem>(MOCK_TRENDING.slice(0, 3)) as unknown as T;
    }

    // Default detail fallback
    const idStr = endpoint.split('/')[2];
    const id = parseInt(idStr) || 27205;
    const baseItem = MOCK_TRENDING.find(m => m.id === id) || MOCK_TRENDING[0];
    return { ...baseItem, ...MOCK_DETAILS_BASE } as unknown as T;
}

// ==========================================
// API Methods
// ==========================================

export const tmdb = {
    // Configuration
    getImageUrl: (path: string | null, size: 'original' | 'w500' | 'w1280' = 'w500') => {
        if (!path) return '/placeholder-media.png'; // Make sure you have a placeholder in public/
        return `https://image.tmdb.org/t/p/${size}${path}`;
    },

    // Trending
    getTrending: (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') => {
        return fetchTMDB<PaginatedResponse<MediaItem>>(`/trending/${mediaType}/${timeWindow}`);
    },

    // Movies
    getTopRatedMovies: () => fetchTMDB<PaginatedResponse<MediaItem>>('/movie/top_rated'),
    getPopularMovies: () => fetchTMDB<PaginatedResponse<MediaItem>>('/movie/popular'),
    getUpcomingMovies: () => fetchTMDB<PaginatedResponse<MediaItem>>('/movie/upcoming'),

    // TV 
    getTopRatedTV: () => fetchTMDB<PaginatedResponse<MediaItem>>('/tv/top_rated'),
    getPopularTV: () => fetchTMDB<PaginatedResponse<MediaItem>>('/tv/popular'),
    getTrendingTV: () => fetchTMDB<PaginatedResponse<MediaItem>>('/trending/tv/week'),

    // Discover (Categories)
    getMoviesByGenre: (genreId: number) => fetchTMDB<PaginatedResponse<MediaItem>>('/discover/movie', { with_genres: genreId.toString() }),
    getTVByGenre: (genreId: number) => fetchTMDB<PaginatedResponse<MediaItem>>('/discover/tv', { with_genres: genreId.toString() }),

    // Genres
    getMovieGenres: () => fetchTMDB<{ genres: Genre[] }>('/genre/movie/list'),
    getTVGenres: () => fetchTMDB<{ genres: Genre[] }>('/genre/tv/list'),

    // Details
    getMovieDetails: (id: string | number) => fetchTMDB<MediaItem>(`/movie/${id}`),
    getTVDetails: (id: string | number) => fetchTMDB<MediaItem>(`/tv/${id}`),

    // Search
    searchMulti: (query: string) => fetchTMDB<PaginatedResponse<MediaItem>>('/search/multi', { query }),
};
