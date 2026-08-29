import {
sendPrestatairePendingNotification
}
from "../notification/prestataire.notification.js";


export const handlePrestataireRegistered = async( prestataire) => {
    await sendPrestatairePendingNotification(
        prestataire
    );
};