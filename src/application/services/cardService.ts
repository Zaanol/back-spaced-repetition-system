import { CardRepository } from "../../infrastructure/repositories/cardRepository";
import { CardDTO, CardWithMediaBlocksDTO } from "../dtos/cardDTO";
import { Card } from "../../domain/models/card";
import { validateCard } from "../validators/cardValidator";
import i18n from "../../config/i18n";
import { FilterQuery } from "mongoose";
import { DeckRepository } from "../../infrastructure/repositories/deckRepository";
import { MediaFilesType, MediaService } from "./mediaService";
import { MediaReducedDTO } from "../dtos/mediaDTO";
import { PaginatedResult } from "../../infrastructure/repositories/baseRepository";

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

    public async create(cardDTO: CardWithMediaBlocksDTO, files: MediaFilesType): Promise<Card> {
        const validationError = validateCard(cardDTO);
        if (validationError) {
            throw new Error(i18n.t(validationError));
        }

        if (!await this.deckRepository.existsDeckById(cardDTO.deckId)) {
            throw new Error(i18n.t("deck.notFound"));
        }

        const createCardDTO: CardDTO = {
            deckId: cardDTO.deckId,
            front: await this.processMediaBlocks(cardDTO.front, files),
            back: await this.processMediaBlocks(cardDTO.back, files)
        };

        return await this.cardRepository.createCard(createCardDTO);
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

    public async update(id: string, cardDTO: CardWithMediaBlocksDTO, files: MediaFilesType): Promise<Card | null>  {
        if (!await this.cardRepository.existsDeckById(id)) {
            throw new Error(i18n.t("card.notFound")); //TODO create i18n
        }

        const validationError = validateCard(cardDTO);
        if (validationError) {
            throw new Error(i18n.t(validationError));
        }

        if (!await this.deckRepository.existsDeckById(cardDTO.deckId)) {
            throw new Error(i18n.t("deck.notFound"));
        }

        const updateCardDTO: CardDTO = {
            deckId: cardDTO.deckId,
            front: await this.processMediaBlocks(cardDTO.front, files),
            back: await this.processMediaBlocks(cardDTO.back, files)
        };

        return await this.cardRepository.updateCard(id, updateCardDTO);
    }

    public async delete(id: string): Promise<boolean> {
        if (!id) {
            throw new Error(i18n.t("id.nonNull"));
        }

        return await this.cardRepository.deleteCard(id);
    }

    public async processMediaBlocks(blocks: MediaReducedDTO[], files: MediaFilesType) {
        const createdBlocks = await this.mediaService.create(blocks, files);

        return createdBlocks.map(block => block.id);
    }
}