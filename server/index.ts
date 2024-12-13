// Import dependencies
import express, { Express, Request, Response, NextFunction } from 'express';
import { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieSession from 'cookie-session';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes & models
import database from './models';
import authRoutes from './routes/auth.routes'
import screeningRoutes from './routes/screening.routes'
import bookingRoutes from './routes/booking.routes'
import userRoutes from './routes/user.routes'

// ENV variables
dotenv.config();
const PORT = process.env.PORT || 8000;
const DATABASE_URL = process.env.DATABASE_URL || 'vide';
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'vide';


if (!DATABASE_URL) {
    console.error('DATABASE_URL is not defined in the .env file');
    process.exit(1);
}

if (!COOKIE_SECRET) {
    console.error('JWT_SECRET is not defined in the .env file');
    process.exit(1);
}

// Initialize express
const app: Express = express();

// Enhance API security
app.use(helmet());

// Allow requests from multiple origins
app.use(
    cors({
        origin: ['http://localhost:3000', 'https://popcorn-palace.alexander-fejari.be'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
    })
);

// Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stores session data on the client within a cookie
app.use(
    cookieSession({
        name: "session",
        keys: [COOKIE_SECRET!],
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    })
);

// Set response headers
app.use(function(req: Request, res: Response, next: NextFunction) {
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept"
  );
  next();
});

// Log HTTP requests
app.use(morgan('combined'));

// Connection to the database
database.mongoose
  .connect(DATABASE_URL!, {} as ConnectOptions)
  .then(() => {
      console.log("Successfully connect to DB.");
  })
  .catch((err: Error) => {
      console.error("Connection error", err);
      process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Set port, listen for requests
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
