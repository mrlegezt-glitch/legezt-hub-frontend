import { MediaItem, PaginatedResponse } from '@/types/media';

export const MOCK_TRENDING: MediaItem[] = [
    {
        id: 27205,
        title: "Inception",
        original_title: "Inception",
        overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
        poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        backdrop_path: "/s3TBrRGB1invgHHz1BSRBP6jK7x.jpg",
        media_type: "movie",
        popularity: 150.5,
        release_date: "2010-07-15",
        vote_average: 8.4,
        vote_count: 34000
    },
    {
        id: 119051,
        name: "Wednesday",
        original_name: "Wednesday",
        overview: "Wednesday Addams is sent to Nevermore Academy, a bizarre boarding school where she attempts to master her psychic powers, stop a monstrous killing spree of the town citizens, and solve the supernatural mystery that affected her family 25 years ago — all while navigating her new relationships.",
        poster_path: "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
        backdrop_path: "/iHSwvRVsRyxpX7WE7AezIoS57ne.jpg",
        media_type: "tv",
        popularity: 200.1,
        first_air_date: "2022-11-23",
        vote_average: 8.5,
        vote_count: 7500
    },
    {
        id: 603,
        title: "The Matrix",
        original_title: "The Matrix",
        overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
        poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        backdrop_path: "/7u3epc9IGnbeaVCZLedw0nO4LMe.jpg",
        media_type: "movie",
        popularity: 90.2,
        release_date: "1999-03-30",
        vote_average: 8.2,
        vote_count: 23000
    },
    {
        id: 155,
        title: "The Dark Knight",
        original_title: "The Dark Knight",
        overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
        media_type: "movie",
        popularity: 120.4,
        release_date: "2008-07-16",
        vote_average: 8.5,
        vote_count: 30000
    },
    {
        id: 1399,
        name: "Game of Thrones",
        original_name: "Game of Thrones",
        overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night's Watch, is all that stands between the realms of men and icy horrors beyond.",
        poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
        backdrop_path: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
        media_type: "tv",
        popularity: 350.8,
        first_air_date: "2011-04-17",
        vote_average: 8.4,
        vote_count: 21000
    },
    {
        id: 66732,
        name: "Stranger Things",
        original_name: "Stranger Things",
        overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
        poster_path: "/49WJfeN0moxb9IPfGn8xsnvNw2C.jpg",
        backdrop_path: "/56v2KjBlU4XaM9tzLNfQrb2W1Jk.jpg",
        media_type: "tv",
        popularity: 180.3,
        first_air_date: "2016-07-15",
        vote_average: 8.6,
        vote_count: 16000
    },
    {
        id: 299534,
        title: "Avengers: Endgame",
        original_title: "Avengers: Endgame",
        overview: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
        poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        media_type: "movie",
        popularity: 210.9,
        release_date: "2019-04-24",
        vote_average: 8.3,
        vote_count: 23000
    }
];

export const MOCK_GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 10759, name: "Action & Adventure" },
    { id: 10765, name: "Sci-Fi & Fantasy" }
];

export const MOCK_DETAILS_BASE = {
    runtime: 148,
    status: "Released",
    tagline: "Your mind is the scene of the crime.",
    number_of_episodes: 24,
    number_of_seasons: 3,
    genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }],
    production_companies: [{ id: 1, name: "Warner Bros.", logo_path: null }]
};

export function getMockResponse<T>(data: T[]): PaginatedResponse<T> {
    return {
        page: 1,
        results: data,
        total_pages: 1,
        total_results: data.length
    };
}
