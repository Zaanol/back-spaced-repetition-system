import { CardRepository } from "../../infrastructure/repositories/cardRepository";
import { CardDTO, CardWithMediaBlocksDTO } from "../dtos/cardDTO";
import { Card } from "../../domain/models/card";
import { validateCard } from "../validators/cardValidator";
import i18n from "../../config/i18n";
import { FilterQuery } from "mongoose";
import { DeckRepository } from "../../infrastructure/repositories/deckRepository";
import { MediaService } from "./mediaService";
import { MediaReducedDTO } from "../dtos/mediaDTO";
import {PaginatedResult} from "../../infrastructure/repositories/baseRepository";

//TODO Implement translations
export class CardService {
    private cardRepository: CardRepository;
    private deckRepository: DeckRepository;
    private mediaService: MediaService;

    constructor(cardRepository: CardRepository, deckRepository: DeckRepository, mediaService: MediaService) {
        this.cardRepository = cardRepository;
        this.deckRepository = deckRepository;
        this.mediaService = mediaService;
    }

    public async create(cardDTO: CardWithMediaBlocksDTO, files: { [fieldname: string]: Express.Multer.File[] }): Promise<Card> {
        const validationError = validateCard(cardDTO);
        if (validationError) {
            throw new Error(i18n.t(validationError));
        }

        const deck = await this.deckRepository.findDeckById(cardDTO.deckId);

        if (!deck) {
            throw new Error(i18n.t("deck.notFound"));
        }

        const processMediaBlocks = async (blocks: MediaReducedDTO[]) => {
            const createdBlocks = await this.mediaService.create(blocks, files);

            return createdBlocks.map(block => block.id);
        };

        const card: CardDTO = {
            deckId: cardDTO.deckId,
            front: await processMediaBlocks(cardDTO.front),
            back: await processMediaBlocks(cardDTO.back),
        };

        return await this.cardRepository.createCard(card);
    }

    public async getById(id: string): Promise<Card | null> {
        if (!id) {
            throw new Error(i18n.t("id.nonNull"));
        }
        
        return await this.cardRepository.findCardById(id);
    }
    
    public async getAll(
        filters: FilterQuery<Card> = {},
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResult<Card>> {
        return await this.cardRepository.findAllPaginated(
            filters,
            { page, pageSize: limit }
        );
    }

    public async update(id: string, updateData: Partial<CardDTO>): Promise<Card | null> {
        if (!id) {
            throw new Error(i18n.t("id.nonNull"));
        }
        return await this.cardRepository.updateCard(id, updateData);
    }

    public async delete(id: string): Promise<boolean> {
        if (!id) {
            throw new Error(i18n.t("id.nonNull"));
        }
        return await this.cardRepository.deleteCard(id);
    }
}