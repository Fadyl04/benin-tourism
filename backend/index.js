import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import prisma from './src/config/db.config.js';

/*
  CONNEXION BASE DE DONNÉES
*/

prisma.$connect()
  .then(() => console.log('Base de données connectée avec succès.'))
  .catch((error) => {
    console.error('Erreur de connexion à la base de données :', error);
    process.exit(1);
  });

/* 
 DÉMARRAGE DU SERVEUR
*/
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://${HOST}:${PORT}`);
});
