import {Router} from 'express';
import { 
    cancelReservationController, 
    createReservationController,
    getAllReservationsController,
    getReservationByIdController
} from '../controllers/reservation.controller.js';
import {authenticate} from '../middlewares/auth.middlewares.js';
import {
    payReservationController,
    paiementCallbackController
} from '../controllers/paiement.controller.js';


const router = Router();

router.post('/reservation', authenticate ,createReservationController);
router.post('/pay', authenticate, payReservationController);
router.get('/callback', paiementCallbackController);
router.delete('/cancel', authenticate, cancelReservationController);
router.get('/show', authenticate, getAllReservationsController);
router.get('/:id', authenticate, getReservationByIdController);

export default router;