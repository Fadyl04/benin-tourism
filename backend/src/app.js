import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

import corsHttp from './config/cors.config.js';
import { globalLimiter } from './middlewares/rateLimit.middleware.js';

// Routes
import authRoute from './routes/auth/auth.route.js';
import prestataireRoute from './routes/auth/auth.prestataire.route.js';
import siteTouristiqueRoute from './routes/siteTouristique.route.js';
import evenementRoute from './routes/evenement.route.js';
import visiteRoute from './routes/visite.route.js';
import payReservationRoute from './routes/payReservation.route.js';
import adminRoute from './routes/auth/auth.admin.route.js';

const app = express();

/*
  MIDDLEWARES GLOBAUX
*/
app.use(cookieParser());
app.use(corsHttp);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(globalLimiter);



/* =======================
   SWAGGER DOCUMENTATION
======================= */

const swaggerOptions = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'API Benin Tourism',
      version: '1.0.0',
      description: 'Documentation complète de l\'API',
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 3000}/api` }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ['./src/routes/**/*.js'], // tous tes fichiers de routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/* =======================
   FICHIERS STATIQUES
======================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ Remonter d’un niveau car app.js est dans src/
/* app.use('/public', express.static(path.join(__dirname, '../public'))); */
app.use('/uploads', express.static('uploads'));

/*
  ROUTES API
*/
app.use('/api/auth', authRoute);
/* app.use('/api/prestataire', prestataireRoute);
app.use('/api/admin', adminRoute); */
app.use('/api/site', siteTouristiqueRoute);
app.use('/api/evenement', evenementRoute);
app.use('/api/visite', visiteRoute);
app.use('/api/paiement', payReservationRoute);


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
