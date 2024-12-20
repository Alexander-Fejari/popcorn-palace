import mongoose, { Document, Model, Schema } from 'mongoose';

interface Movie {
    id: string;
    title: string;
}

interface IMovieChange {
    results: Movie[];
}

interface IMovie {
    title: string;
    director: string[];
    casting: string[];
    genres: string[];
    synopsis: string;
    poster: string;
    backdrop: string;
    trailer: string;
    score: string;
    length: string;
    release: Date;
}

interface IScreening extends Document {
    movie: IMovie;
    date: Date;
    slug: string;
    bookedSeats: string[];
}

const ScreeningSchema = new Schema({
    movie: {
        title: String,
        director: [String],
        casting: [String],
        genres: [String],
        synopsis: String,
        poster: String,
        backdrop: String,
        trailer: String,
        score: String,
        length: String,
        release: Date,
    },
    date: Date,
    slug: String,
    bookedSeats: [String],
});

const Screening: Model<IScreening> = mongoose.model<IScreening>(
    'Screening',
    ScreeningSchema
);

export { IScreening, IMovieChange, Screening };