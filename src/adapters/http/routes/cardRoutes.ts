import express from "express";
import { CardController } from "../controllers/cardController";
import { CardService } from "../../../application/services/cardService";
import cardRepository from "../../../infrastructure/repositories/cardRepository";
import deckRepository from "../../../infrastructure/repositories/deckRepository";

const router = express.Router();

const cardController = new CardController(new CardService(cardRepository, deckRepository));

router.post("/create", cardController.uploadMiddleware, cardController.create);
router.get("/getById/:id", cardController.getById);
router.get("/getAll", cardController.getAll);
router.patch("/update/:id", cardController.update);
router.delete("/delete/:id", cardController.delete);

export default router;