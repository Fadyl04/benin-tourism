-- CreateIndex
CREATE INDEX `avis_isDeleted_idx` ON `avis`(`isDeleted`);

-- CreateIndex
CREATE INDEX `avis_deletedAt_idx` ON `avis`(`deletedAt`);

-- CreateIndex
CREATE INDEX `evenements_isDeleted_idx` ON `evenements`(`isDeleted`);

-- CreateIndex
CREATE INDEX `evenements_deletedAt_idx` ON `evenements`(`deletedAt`);

-- CreateIndex
CREATE INDEX `prestataires_isDeleted_idx` ON `prestataires`(`isDeleted`);

-- CreateIndex
CREATE INDEX `prestataires_deletedAt_idx` ON `prestataires`(`deletedAt`);

-- CreateIndex
CREATE INDEX `site_touristiques_isDeleted_idx` ON `site_touristiques`(`isDeleted`);

-- CreateIndex
CREATE INDEX `site_touristiques_deletedAt_idx` ON `site_touristiques`(`deletedAt`);

-- CreateIndex
CREATE INDEX `visites_isDeleted_idx` ON `visites`(`isDeleted`);

-- CreateIndex
CREATE INDEX `visites_deletedAt_idx` ON `visites`(`deletedAt`);
