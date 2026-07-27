import prisma from "../config/db.config.js";

// ===== Soft delete de sites touristiques =====
/**
 * Restaurer un site touristique supprimé
 */
export const restoreSiteService = async (id) => {
    try {
        return await prisma.siteTouristique.update({
            where: { id_site: id },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });
    } catch (error) {
        if (error.code === "P2025") {
            return null;
        }
        throw error;
    }
}

// ===== Soft delete de evenements =====
export const restoreEvenementService = async (id) => {
    try {
        return await prisma.evenement.update({
            where: {id_evenement: id},
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });
    } catch (error) {
        if (error.code === "P2025") {
            return null;
        }
        throw error;
    }
}

// ===== Soft delete de visites =====
export const restoreVisiteService = async (id) => {
    try {
        return await prisma.visite.update({
            where: {id_visite: id},
            data: {
                isDeleted: false,
                deletedAt: null
            }
        })
    } catch (error) {
        if (error.code === "P2025") {
            return null;
        }
        throw error;
    }
}