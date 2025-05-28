import express from "express";
import { MediaController } from "../controllers/mediaController";
import { MediaService } from "../../../application/services/mediaService";
import mediaRepository from "../../../infrastructure/repositories/mediaRepository";

const router = express.Router();

const mediaController = new MediaController(new MediaService(mediaRepository));

router.get("/getById/:id", mediaController.getById);

export default router;