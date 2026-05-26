import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:4200'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error(`CORS blocked for origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },

    methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',

    allowedHeaders:
        process.env.CORS_ALLOWED_HEADERS ||
        'Content-Type,Authorization,X-Requested-With',

    exposedHeaders:
        process.env.CORS_EXPOSED_HEADERS ||
        'Content-Length,Authorization',

    credentials: process.env.CORS_CREDENTIALS === 'true',

    optionsSuccessStatus: 204
};

export default cors(corsOptions);