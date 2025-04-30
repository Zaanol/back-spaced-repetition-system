import { DeckRepository } from '../../infrastructure/repositories/deckRepository';
import { DeckDTO } from '../dtos/deckDTO';
import { Deck } from '../../domain/models/deck';
import { validateDeck } from '../validators/deckValidator';
import i18n from '../../config/i18n';
import { FilterQuery } from "mongoose";

export class DeckService {
    private deckRepository: DeckRepository;

    constructor(deckRepository: DeckRepository) {
        this.deckRepository = deckRepository;
    }

    public async create(deckDTO: DeckDTO): Promise<Deck> {
        const validationError = validateDeck(deckDTO);
        if (validationError) {
            throw new Error(i18n.t(validationError));
        }

        return await this.deckRepository.createDeck(deckDTO);
    }

    public async getById(id: string): Promise<Deck | null> {
        if (!id) {
            throw new Error(i18n.t('id.nonNull'));
        }

        return await this.deckRepository.findDeckById(id);
    }

    public async getAll(name?: string, description?: string): Promise<Deck[] | null> {
        const filter: FilterQuery<Deck> = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        if (description) {
            filter.description = { $regex: description, $options: 'i' };
        }

        return await this.deckRepository.findAllDecks(filter);
    }
}