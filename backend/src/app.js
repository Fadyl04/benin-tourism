import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import corsHttp from './config/cors.config.js';

// Routes
import passwordRoute from './routes/auth/auth.password.route.js';
import prestataireRoute from './routes/auth/auth.prestataire.route.js';
import clientRoute from './routes/auth/auth.client.route.js';
import siteTouristiqueRoute from './routes/siteTouristique.route.js';
import evenementRoute from './routes/evenement.route.js';
import visiteRoute from './routes/visite.route.js';
import payReservationRoute from './routes/payReservation.route.js';
import adminRoute from './routes/auth/auth.admin.route.js';

const app = express();

/*
  MIDDLEWARES GLOBAUX
*/
app.use(corsHttp);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));

/*
  RATE LIMITING
*/

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

/* =======================
   FICHIERS STATIQUES
======================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ Remonter d’un niveau car app.js est dans src/
/* app.use('/public', express.static(path.join(__dirname, '../public'))); */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/*
  ROUTES API
*/
app.use('/api/password', passwordRoute);
app.use('/api/prestataire', prestataireRoute);
app.use('/api/client', clientRoute);
app.use('/api/site', siteTouristiqueRoute);
app.use('/api/evenement', evenementRoute);
app.use('/api/visite', visiteRoute);
app.use('/api/paiement', payReservationRoute);
app.use('/api/admin', adminRoute);

/*
  GESTION DES ERREURS
*/
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'Fichier trop volumineux (max 5 Mo).'
    });
  }
  console.error(err);
  res.status(500).json({
    message: 'Erreur interne du serveur'
  });
});

/* 
  ROUTE TEST
*/
app.get('/', (req, res) => {
  res.send('Bienvenue Fadyl ! Votre serveur Express fonctionne.');
});

export default app;
