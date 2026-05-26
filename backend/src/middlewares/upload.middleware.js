import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Création automatique des dossiers
 */
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Factory upload middleware
 */
export const createUploadMiddleware = (folder) => {

    const uploadPath = path.join('uploads', folder);

    ensureDir(uploadPath);

    const storage = multer.diskStorage({

        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },

        filename: (req, file, cb) => {

            const uniqueName =
                Date.now() +
                '-' +
                Math.round(Math.random() * 1e9) +
                path.extname(file.originalname);

            cb(null, uniqueName);
        }
    });

    const fileFilter = (req, file, cb) => {

        const allowedTypes = /jpg|jpeg|png|webp|pdf/;

        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );

        const mimetype =
            file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf';

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Formats autorisés : JPG, JPEG, PNG, WEBP, PDF'
                ),
                false
            );
        }
    };

    return multer({
        storage,
        limits: {
            fileSize: 50 * 1024 * 1024
        },
        fileFilter
    });
};

/**
 * Upload spécialisé PRESTATAIRE
 */
export const uploadPrestataire = multer({

    storage: multer.diskStorage({

        destination: (req, file, cb) => {

            /**
             * IMAGE PROFIL
             */
            if (file.fieldname === 'image') {

                const type = req.body.type;

                let folder =
                    'uploads/users/prestataires';

                if (type === 'guide') {
                    folder += '/guides';
                }

                else if (type === 'hotel') {
                    folder += '/hotels';
                }

                else if (type === 'transport') {
                    folder += '/transports';
                }

                ensureDir(folder);

                return cb(null, folder);
            }

            /**
             * DOCUMENT JUSTIFICATIF
             */
            if (
                file.fieldname ===
                'document_justificatif'
            ) {

                const folder =
                    'uploads/documents/prestataires';

                ensureDir(folder);

                return cb(null, folder);
            }

            return cb(
                new Error('Champ fichier invalide')
            );
        },

        filename: (req, file, cb) => {

            const uniqueName =
                Date.now() +
                '-' +
                Math.round(Math.random() * 1e9) +
                path.extname(file.originalname);

            cb(null, uniqueName);
        }
    }),

    limits: {
        fileSize: 50 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes =
            /jpg|jpeg|png|webp|pdf/;

        const extname = allowedTypes.test(
            path.extname(file.originalname)
                .toLowerCase()
        );

        const mimetype =
            file.mimetype.startsWith('image/') ||
            file.mimetype ===
            'application/pdf';

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Formats autorisés : JPG, JPEG, PNG, WEBP, PDF'
                ),
                false
            );
        }
    }
});