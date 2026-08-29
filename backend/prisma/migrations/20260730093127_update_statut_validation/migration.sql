-- AlterTable
ALTER TABLE `prestataires` MODIFY `statut_validation` ENUM('en_attente', 'valide', 'refuse', 'entretien') NOT NULL;
