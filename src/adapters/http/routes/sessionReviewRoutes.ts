import express from "express";
import cardRepository from "../../../infrastructure/repositories/cardRepository";
import deckRepository from "../../../infrastructure/repositories/deckRepository";
import { paginationMiddleware } from "../middlewares/paginationMiddleware";
import { SessionReviewService } from "../../../application/services/sessionReviewService";
import sessionReviewRepository from "../../../infrastructure/repositories/sessionReviewRepository";
import { SessionReviewController } from "../controllers/sessionReviewController";

const router = express.Router();

const sessionReviewService: SessionReviewService = new SessionReviewService(sessionReviewRepository, deckRepository, cardRepository);

const cardController = new SessionReviewController(sessionReviewService);

router.post("/create", cardController.create);
router.get("/getById/:id", cardController.getById);
router.get("/getAll", paginationMiddleware, cardController.getAll);

export default router;