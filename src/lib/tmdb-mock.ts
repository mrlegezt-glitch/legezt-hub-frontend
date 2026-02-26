import { MediaItem, PaginatedResponse } from '@/types/media';

// A diverse, robust mock dataset containing movies and TV shows across multiple genres
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
        vote_count: 34000,
        genre_ids: [28, 878, 12]
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
        vote_count: 7500,
        genre_ids: [10765, 9648, 35]
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
        vote_count: 23000,
        genre_ids: [28, 878]
    },
    {
        id: 155,
        title: "The Dark Knight",
        original_title: "The Dark Knight",
        overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
        media_type: "movie",
        popularity: 120.4,
        release_date: "2008-07-16",
        vote_average: 8.5,
        vote_count: 30000,
        genre_ids: [18, 28, 80, 53]
    },
    {
        id: 1399,
        name: "Game of Thrones",
        original_name: "Game of Thrones",
        overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
        poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
        backdrop_path: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
        media_type: "tv",
        popularity: 350.8,
        first_air_date: "2011-04-17",
        vote_average: 8.4,
        vote_count: 21000,
        genre_ids: [10765, 18, 10759]
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
        vote_count: 16000,
        genre_ids: [10765, 9648, 18]
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
        vote_count: 23000,
        genre_ids: [12, 878, 28]
    },
    {
        id: 1078605,
        title: "Dune: Part Two",
        original_title: "Dune: Part Two",
        overview: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
        poster_path: "/1pdfLvkbY9ohJlCjQH2JGjjcNsV.jpg",
        backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        media_type: "movie",
        popularity: 450.2,
        release_date: "2024-02-27",
        vote_average: 8.7,
        vote_count: 5200,
        genre_ids: [878, 12]
    },
    {
        id: 108978,
        name: "Reacher",
        original_name: "Reacher",
        overview: "Jack Reacher was arrested for murder and now the police need his help. Based on the books by Lee Child.",
        poster_path: "/jBnjXKmrsA2K4k4bQnj1r6n0F5y.jpg",
        backdrop_path: "/z6RhiA6hQ61XG0nndWpWkO4zKAn.jpg",
        media_type: "tv",
        popularity: 280.4,
        first_air_date: "2022-02-03",
        vote_average: 8.1,
        vote_count: 3200,
        genre_ids: [10759, 80, 18]
    },
    {
        id: 157336,
        title: "Interstellar",
        original_title: "Interstellar",
        overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        poster_path: "/gEU2QlsUUHXjNpeMacBjQ12LMnM.jpg",
        backdrop_path: "/xJHokMbljvjVA86Xk098PAn2NnB.jpg",
        media_type: "movie",
        popularity: 140.2,
        release_date: "2014-11-05",
        vote_average: 8.4,
        vote_count: 31000,
        genre_ids: [12, 18, 878]
    },
    {
        id: 94605,
        name: "Arcane",
        original_name: "Arcane",
        overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.",
        poster_path: "/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
        backdrop_path: "/of0q2b8f8705Y7D6eWzVwU0qQ0c.jpg",
        media_type: "tv",
        popularity: 195.6,
        first_air_date: "2021-11-06",
        vote_average: 8.7,
        vote_count: 5500,
        genre_ids: [16, 10765, 10759, 18]
    },
    {
        id: 866398,
        title: "The Beekeeper",
        original_title: "The Beekeeper",
        overview: "One man's campaign for vengeance takes on national stakes after he is revealed to be a former operative of a powerful and clandestine organization known as Beekeepers.",
        poster_path: "/A7EByudX0eZvn9OaHX1yU1aGtc2.jpg",
        backdrop_path: "/mRGmNna6ALDaCQ40VycXUbgX5f3.jpg",
        media_type: "movie",
        popularity: 320.1,
        release_date: "2024-01-10",
        vote_average: 7.4,
        vote_count: 2100,
        genre_ids: [28, 53]
    },
    {
        id: 111166,
        name: "Halo",
        original_name: "Halo",
        overview: "Depicting an epic 26th-century conflict between humanity and an alien threat known as the Covenant, the series weaves deeply drawn personal stories with action, adventure and a richly imagined vision of the future.",
        poster_path: "/9bZ7mKkUeM6H4yX1M08q6jQ5z5r.jpg",
        backdrop_path: "/l2m0Nn7vS2i5L5bBwP5r6Cg4G3s.jpg",
        media_type: "tv",
        popularity: 240.7,
        first_air_date: "2022-03-24",
        vote_average: 7.9,
        vote_count: 1800,
        genre_ids: [10765, 10759]
    },
    {
        id: 823464,
        title: "Godzilla x Kong: The New Empire",
        original_title: "Godzilla x Kong: The New Empire",
        overview: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence – and our own.",
        poster_path: "/tMefBSflR6PGQLvLuPEBfSqQh1P.jpg",
        backdrop_path: "/1mQxK6qH1n1tI9rQhE2X5n8vQ0g.jpg",
        media_type: "movie",
        popularity: 410.5,
        release_date: "2024-03-27",
        vote_average: 7.2,
        vote_count: 1500,
        genre_ids: [28, 878, 12]
    },
    {
        id: 76479,
        name: "The Boys",
        original_name: "The Boys",
        overview: "A group of vigilantes known informally as \"The Boys\" set out to take down corrupt superheroes with no more than blue-collar grit and a willingness to fight dirty.",
        poster_path: "/jYmK9P8KEdz1H4I1jW4E7l8R42v.jpg",
        backdrop_path: "/nMgk4We2lX9bEFTu4Y6RXXxXF0y.jpg",
        media_type: "tv",
        popularity: 260.9,
        first_air_date: "2019-07-25",
        vote_average: 8.5,
        vote_count: 8900,
        genre_ids: [10765, 10759]
    }
];

export const MOCK_GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 53, name: "Thriller" },
    { id: 878, name: "Science Fiction" },
    { id: 9648, name: "Mystery" },
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
