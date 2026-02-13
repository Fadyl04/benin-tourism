import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',   
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

/* transporter.verify((error, success) => {
  if (error) {
    console.error(' Connexion SMTP échouée :', error);
  } else {
    console.log('Connexion SMTP réussie');
  }
});
   */


export default transporter;