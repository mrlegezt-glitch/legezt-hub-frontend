export type MediaType = 'movie' | 'tv';

export interface Genre {
    id: number;
    name: string;
}

export interface MediaItem {
    id: number;
    title?: string;
    name?: string; // TV shows use 'name' instead of 'title'
    original_title?: string;
    original_name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    media_type?: MediaType;
    genre_ids?: number[];
    popularity: number;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    vote_count: number;
    // Additional details (when fetching specific item)
    genres?: Genre[];
    runtime?: number;
    episode_run_time?: number[];
    number_of_episodes?: number;
    number_of_seasons?: number;
    status?: string;
    tagline?: string;
    production_companies?: { id: number; name: string; logo_path: string | null }[];
}

export interface PaginatedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}
