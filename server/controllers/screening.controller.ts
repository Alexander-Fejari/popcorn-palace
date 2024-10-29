import { Request, Response } from 'express';
import slugify from 'slugify';
import {
    getCasting,
    getVideos,
    getMovieInfo,
    getMovies,
} from '../services/tmdb.services';
import database from '../models';
const Screening = database.screening;
const Booking = database.booking;

async function addAPIScreening(req: Request, movieId: string): Promise<void> {
    try {
        const [movieInfo, casting, videos] = await Promise.all([
            getMovieInfo(movieId),
            getCasting(movieId),
            getVideos(movieId),
        ]);

        const screening = new Screening({
            movie: {
                title: movieInfo.title,
                director: casting.crew
                    .filter((member: any) => member.job === 'Director')
                    .map((director: any) => director.name),
                casting: casting.cast
                    .slice(0, 5)
                    .map((member: any) => member.name),
                genres: movieInfo.genres.map((genre: any) => genre.name),
                synopsis: movieInfo.overview,
                poster: `https://image.tmdb.org/t/p/w300${movieInfo.poster_path}`,
                backdrop: `https://image.tmdb.org/t/p/w1280${movieInfo.backdrop_path}`,
                trailer: videos.results
                    .filter(
                        (video: any) =>
                            video.type === 'Trailer' && video.site === 'YouTube'
                    )
                    .map((video: any) => video.key)
                    .slice(0, 1)
                    .join(''),
                score: movieInfo.vote_average,
                length: movieInfo.runtime,
                release: movieInfo.release_date,
            },
            date: req.body.date,
            slug: slugify(movieInfo.title, {
                replacement: '-',
                lower: true,
                strict: true,
                locale: 'fr',
            }),
        });

        await screening.save();
        console.log('Screening ajouté pour le film:', movieInfo.title);
    } catch (err) {
        console.error('Erreur lors de l’ajout du screening:', err);
    }
}

// Create a new screening
async function addScreening(req: Request, res: Response) {
    try {
        const movieId = req.body.movie_id;
        // execute all promises at the same time
        const [movieInfo, casting, videos] = await Promise.all([
            getMovieInfo(movieId),
            getCasting(movieId),
            getVideos(movieId),
        ]);

        const screening = new Screening({
            movie: {
                title: movieInfo.title,
                director: casting.crew
                    .filter((member: any) => member.job === 'Director') // filter the array to have only directors
                    .map((director: any) => director.name), // returns only the name of the crew member
                casting: casting.cast
                    .slice(0, 5) // returns only the 5 first cast members
                    .map((member: any) => member.name), // returns only the name of the cast member
                genres: movieInfo.genres.map((genre: any) => genre.name),
                synopsis: movieInfo.overview,
                poster: `https://image.tmdb.org/t/p/w300${movieInfo.poster_path}`,
                backdrop: `https://image.tmdb.org/t/p/w1280${movieInfo.backdrop_path}`,
                trailer: videos.results
                    .filter(
                        (video: any) =>
                            video.type === 'Trailer' && video.site === 'YouTube'
                    ) // filter the array to have only trailers from youtube
                    .map((video: any) => video.key) // returns only the key of the video
                    .slice(0, 1)
                    .join(''), // returns only the first trailer
                score: movieInfo.vote_average,
                length: movieInfo.runtime,
                release: movieInfo.release_date,
            },
            date: req.body.date,
            slug: slugify(movieInfo.title, {
                replacement: '-',
                lower: true,
                strict: true,
                locale: 'fr',
            }),
        });

        await screening.save();

        res.status(200).send({
            message: 'Screening was created successfully!',
        });
    } catch (err: any) {
        res.status(500).send({ message: err });
    }
}

async function getAllScreenings(req: Request, res: Response) {
    try {
        const addAllScreenings = await getMovies();

        if (
            addAllScreenings.results &&
            Array.isArray(addAllScreenings.results)
        ) {
            const screeningPromises = addAllScreenings.results.map((movie) =>
                addAPIScreening(req, movie.id)
            );

            // Attendre que toutes les promesses se terminent, sans rejeter les erreurs
            await Promise.allSettled(screeningPromises);
        }

        const screenings = await Screening.find().select(
            'movie.title movie.poster date slug'
        );

        // Envoyer une réponse unique avec les screenings
        res.status(200).json(screenings);
    } catch (err) {
        res.status(500).send({
            message: 'Erreur serveur lors de la récupération des screenings',
        });
    }
}

// Get one screening
async function getOneScreening(req: Request, res: Response) {
  try {
    const screeningId = req.params.id
    const screening = await Screening.findById(screeningId)

    // Get booked and locked seats
    const bookings = await Booking.find({ screening_id: screeningId }, 'seats payment_status created_dt')
    if (bookings.length > 0) {
      const bookedSeats = bookings.map(booking => (booking.payment_status) ? booking.seats : []).flat(1);
      const lockedSeats = bookings.map(booking => (new Date(booking.created_dt) > new Date(Date.now() - 15 * 60 * 1000)) ? booking.seats : []).flat(1);
      screening!.bookedSeats = [...bookedSeats, ...lockedSeats]
    } else {
      screening!.bookedSeats = []
    }

    res.status(200).send(screening);
  } catch (err: any) {
    res.status(500).send({ message: err });
  }
}

// Get the genres of the upcoming movies
async function getGenres(req: Request, res: Response) {
  try {
    const genres = await Screening.distinct('movie.genres')

    res.status(200).send(genres);
  } catch (err: any) {
    res.status(500).send({ message: err });
  }
}

// Get the dates of the upcoming movies
async function getDates(req: Request, res: Response) {
  try {
    const rawDates = await Screening.distinct('date')

    // filter the array of dates to have only unique dates without times 
    const dates = Array.from(new Set(rawDates.map(date => new Date(date).toISOString().split('T')[0])));

    res.status(200).send(dates);
  } catch (err: any) {
    res.status(500).send({ message: err });
  }
}

export default { addScreening, getAllScreenings, getOneScreening, getGenres, getDates }