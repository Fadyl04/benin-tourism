import {Router} from 'express'
import {
  createVisiteController,
  getAllVisiteController,
  getVisiteByIdController,
  searchVisiteController,
  deleteVisiteController,
  updateVisiteController
} from "../controllers/visite.controller.js";
import { authenticate, adminRole } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.post("/create", adminRole, upload.single('image'), createVisiteController);
router.put("/update/:id_visite", adminRole, upload.single('image'), updateVisiteController);
router.delete("/delete/:id_visite", adminRole, deleteVisiteController);

router.get("/show", authenticate, getAllVisiteController);
router.get("/:id_visite", authenticate, getVisiteByIdController);
router.get("/search/by-name", searchVisiteController);


export default router;