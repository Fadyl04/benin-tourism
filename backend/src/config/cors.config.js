import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) : ['http://localhost:4200'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS' + origin));
        }
    },
    methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization',
    exposedHeaders: process.env.CORS_EXPOSED_HEADERS || 'Content-Length,Authorization',
    credentials: process.env.CORS_CREDENTIALS === 'true',
    preflightContinue: false,
    optionsSuccessStatus: 204
};

const corsHttp = cors(corsOptions);

export default corsHttp;