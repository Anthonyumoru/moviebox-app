import Movie from './movie.js';

const updateMovies = async () => {
    console.log("Starting movie update...");
    
    const updates = [
        {
            id: 1,
            $set: {
                overview: "A thief who steals corporate secrets through the use of dream-sharing technology...",
                year: 2010,
                rating: 8.8,
                poster: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
                backdrop: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg"
            }
        },
        {
            id: 2,
            $set: {
                overview: "When the menace known as the Joker wreaks havoc...",
                year: 2008,
                rating: 9.0,
                poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                backdrop: "https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg"
            }
        }
    ];

    for (const update of updates) {
        await Movie.updateOne({ id: update.id }, update);
    }
    
    console.log("Movies Updated Successfully!");
}

export default updateMovies;
