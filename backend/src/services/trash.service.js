import prisma from "../config/db.config.js";

// ===== Soft delete de sites touristiques =====
/**
 * Déplacer un site touristique vers la corbeille
 */
export const moveSiteToTrashService = async (id) => {
    try {

        return await prisma.siteTouristique.update({
            where: { id_site: id},
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }

        });

    } catch (error) {
        if (error.code === "P2025") {
            return null;
        }
        throw error;
    }
}

/**
 * Récupérer les sites supprimés
 * avec pagination
 */
export const getDeletedSitesService = async ({ page = 1, limit = 10 } = {}) => {

    const skip = (page - 1) * limit;
    const where = {isDeleted: true};
    const [sites, total] = await prisma.$transaction([
        prisma.siteTouristique.findMany({ 
            where,
            include: { visiteSites: true },
            orderBy: {  deletedAt: "desc"},
            skip,
            take: limit 
        }),
        prisma.siteTouristique.count({where})

    ]);
    const totalPages = Math.ceil(total / limit);

    return {
        data: sites,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1

        }
    };
};

// ===== Soft delete de évènements culturels =====
/**
 * Déplacer un évènement culturel vers la corbeille
 */
export const moveEvenementToTrashService = async (id) => {
    try {
        return await prisma.evenement.update({
            where: {id_evenement: id},
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        })
    } catch (error) {
        if (error.code === "P2025") {
            return null;
        }
        throw error;   
    }
}


/**
 * Récupérer les évènements supprimés
 * avec pagination
 */
export const getDeletedEvenementService = async ({ page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;
    const where = {isDeleted: true};
    const [events, total] = await prisma.$transaction([
        prisma.evenement.findMany({
            where,
            orderBy: {  deletedAt: "desc"},
            skip,
            take: limit 
        }),
        prisma.evenement.count({where})

    ])
    const totalPages = Math.ceil(total / limit);
    return {
        data: events,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1

        }
    };

}

// ===== Soft delete de visite =====
/**
 * Déplacer une visite vers la corbeille
 */
export const moveVisiteToTrashService = async (id) => {
    try {
        return await prisma.visite.update({
            where: {id_visite: id},
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        })
    } catch (error) {
        if (error.code === "P2025") {
            return null;
        }
        throw error;
        
    }
}

/**
 * Récupérer les visites supprimés
 * avec pagination
 */
export const getDeletedVisiteSivice = async ({ page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;
    const where = {isDeleted: true};
    const [visites, total] = await prisma.$transaction([
        prisma.visite.findMany({
            where,
            orderBy: {  deletedAt: "desc"},
            skip,
            take: limit 
        }),
        prisma.visite.count({where})
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        data: visites,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}