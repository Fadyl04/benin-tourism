-- CreateTable
CREATE TABLE `users` (
    `id_user` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'client', 'prestataire') NOT NULL DEFAULT 'client',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `firstLogin` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `password_resets_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prestataires` (
    `id_prestataire` VARCHAR(191) NOT NULL,
    `idUser` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `type` ENUM('guide', 'hotel', 'transport') NOT NULL,
    `genre` ENUM('Homme', 'Femme', 'Personnel') NOT NULL,
    `date_naissance` DATETIME(3) NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `ville` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `annee_experience` INTEGER NOT NULL,
    `document_justificatif` VARCHAR(191) NOT NULL,
    `statut` ENUM('actif', 'inactif') NOT NULL DEFAULT 'inactif',
    `statut_validation` ENUM('en_attente', 'valide', 'refuse') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `prestataires_idUser_key`(`idUser`),
    INDEX `prestataires_statut_validation_idx`(`statut_validation`),
    PRIMARY KEY (`id_prestataire`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_touristiques` (
    `id_site` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `localisation` VARCHAR(191) NOT NULL,
    `horaire` VARCHAR(191) NOT NULL,
    `categorie` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `site_touristiques_categorie_idx`(`categorie`),
    PRIMARY KEY (`id_site`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evenements` (
    `id_evenement` VARCHAR(191) NOT NULL,
    `id_hotel` VARCHAR(191) NULL,
    `nom` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `localisation` VARCHAR(191) NOT NULL,
    `date_debut` DATETIME(3) NOT NULL,
    `date_fin` DATETIME(3) NOT NULL,
    `nombre_place` INTEGER NOT NULL,
    `prix_standard` DECIMAL(10, 2) NOT NULL,
    `prix_vip` DECIMAL(10, 2) NOT NULL,
    `prix_elite` DECIMAL(10, 2) NULL,
    `prix_premium` DECIMAL(10, 2) NOT NULL,
    `categorie` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `evenements_categorie_idx`(`categorie`),
    PRIMARY KEY (`id_evenement`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visites` (
    `id_visite` VARCHAR(191) NOT NULL,
    `id_guide` VARCHAR(191) NOT NULL,
    `id_hotel` VARCHAR(191) NULL,
    `id_transport` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `prix_economique` DECIMAL(10, 2) NOT NULL,
    `prix_confort` DECIMAL(10, 2) NOT NULL,
    `prix_premium` DECIMAL(10, 2) NOT NULL,
    `nombre_places` INTEGER NOT NULL,
    `date_debut` DATETIME(3) NOT NULL,
    `date_fin` DATETIME(3) NOT NULL,
    `lieu_date_depart` VARCHAR(191) NOT NULL,
    `parcours` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `visites_date_debut_idx`(`date_debut`),
    PRIMARY KEY (`id_visite`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `id_reservation` VARCHAR(191) NOT NULL,
    `id_user` VARCHAR(191) NOT NULL,
    `id_evenement` VARCHAR(191) NULL,
    `id_visite` VARCHAR(191) NULL,
    `montant` DECIMAL(10, 2) NOT NULL,
    `nombre_personnes` INTEGER NOT NULL,
    `date_reservation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statut` ENUM('en_attente', 'confirmee', 'annulee') NOT NULL DEFAULT 'en_attente',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reservations_id_user_idx`(`id_user`),
    INDEX `reservations_statut_idx`(`statut`),
    PRIMARY KEY (`id_reservation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paiements` (
    `id_paiement` VARCHAR(191) NOT NULL,
    `id_reservation` VARCHAR(191) NOT NULL,
    `id_user` VARCHAR(191) NOT NULL,
    `montant` DECIMAL(10, 2) NOT NULL,
    `date_paiement` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `methode` ENUM('mobile_money', 'carte_bancaire') NOT NULL DEFAULT 'mobile_money',
    `statut` ENUM('en_attente', 'reussi', 'echec') NOT NULL DEFAULT 'en_attente',
    `transaction` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `paiements_transaction_key`(`transaction`),
    INDEX `paiements_statut_idx`(`statut`),
    PRIMARY KEY (`id_paiement`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visite_sites` (
    `id` VARCHAR(191) NOT NULL,
    `id_visite` VARCHAR(191) NOT NULL,
    `id_site` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visite_sites_id_visite_id_site_key`(`id_visite`, `id_site`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `prestataires` ADD CONSTRAINT `prestataires_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evenements` ADD CONSTRAINT `evenements_id_hotel_fkey` FOREIGN KEY (`id_hotel`) REFERENCES `prestataires`(`id_prestataire`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visites` ADD CONSTRAINT `visites_id_guide_fkey` FOREIGN KEY (`id_guide`) REFERENCES `prestataires`(`id_prestataire`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visites` ADD CONSTRAINT `visites_id_hotel_fkey` FOREIGN KEY (`id_hotel`) REFERENCES `prestataires`(`id_prestataire`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visites` ADD CONSTRAINT `visites_id_transport_fkey` FOREIGN KEY (`id_transport`) REFERENCES `prestataires`(`id_prestataire`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_id_evenement_fkey` FOREIGN KEY (`id_evenement`) REFERENCES `evenements`(`id_evenement`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_id_visite_fkey` FOREIGN KEY (`id_visite`) REFERENCES `visites`(`id_visite`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiements` ADD CONSTRAINT `paiements_id_reservation_fkey` FOREIGN KEY (`id_reservation`) REFERENCES `reservations`(`id_reservation`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiements` ADD CONSTRAINT `paiements_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visite_sites` ADD CONSTRAINT `visite_sites_id_visite_fkey` FOREIGN KEY (`id_visite`) REFERENCES `visites`(`id_visite`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visite_sites` ADD CONSTRAINT `visite_sites_id_site_fkey` FOREIGN KEY (`id_site`) REFERENCES `site_touristiques`(`id_site`) ON DELETE CASCADE ON UPDATE CASCADE;
