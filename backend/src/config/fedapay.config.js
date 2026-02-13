import dotenv from 'dotenv';
dotenv.config();

const fedapayConfig = {
    publicKey: process.env.FEDAPAY_PUBLIC_KEY,
    secretKey: process.env.FEDAPAY_SECRET_KEY,
    environment: process.env.FEDAPAY_ENVIRONMENT || 'sandbox',
}

export default fedapayConfig;

