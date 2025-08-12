import express from "express";
import { CardController } from "../controllers/cardController";
import { CardService } from "../../../application/services/cardService";
import { MediaService } from "../../../application/services/mediaService";
import cardRepository from "../../../infrastructure/repositories/cardRepository";
import deckRepository from "../../../infrastructure/repositories/deckRepository";
import mediaRepository from "../../../infrastructure/repositories/mediaRepository";
import { paginationMiddleware } from "../middlewares/paginationMiddleware";
import { ensureAsyncContext } from "../middlewares/uploadMiddleware";

const router = express.Router();

const mediaService: MediaService = new MediaService(mediaRepository);
const cardService: CardService = new CardService(cardRepository, deckRepository, mediaService);

const cardController = new CardController(cardService);

router.post("/create", ensureAsyncContext(cardController.uploadMiddleware), cardController.create);
router.get("/getById/:id", cardController.getById);
router.get("/getAll", paginationMiddleware, cardController.getAll);
router.patch("/update/:id", ensureAsyncContext(cardController.uploadMiddleware), cardController.update);
router.delete("/delete/:id", cardController.delete);

export default router;