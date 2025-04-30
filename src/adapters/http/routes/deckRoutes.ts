import express from 'express';
import { DeckController } from '../controllers/deckController';
import { DeckService } from '../../../application/services/deckService';
import deckRepository from '../../../infrastructure/repositories/deckRepository';

const router = express.Router();

const deckController = new DeckController(new DeckService(deckRepository));

router.post('/create', deckController.create);
router.get('/getById/:id', deckController.getById);
router.get('/getAll', deckController.getAll);

export default router;