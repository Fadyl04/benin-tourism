import dotenv from 'dotenv';
dotenv.config();

const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
};

export default jwtConfig;