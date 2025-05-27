import { CardRepository } from "../../infrastructure/repositories/cardRepository";
import { CardDTO, MediaBlockDTO } from "../dtos/cardDTO";
import { Card } from "../../domain/models/card";
import { validateCard } from "../validators/cardValidator";
import i18n from "../../config/i18n";
import mongoose, { FilterQuery } from "mongoose";
import { gridFSBucket, StoredMediaResult, storeMedia } from "../../infrastructure/storages/storage";
import { DeckRepository } from "../../infrastructure/repositories/deckRepository";
import { MediaBlock } from "../../domain/models/mediaBlock";

//TODO Implement translations
export class CardService {
    private cardRepository: CardRepository;
    private deckRepository: DeckRepository;

    constructor(cardRepository: CardRepository, deckRepository: DeckRepository) {
        this.cardRepository = cardRepository;
        this.deckRepository = deckRepository;
    }

    public async create(cardDTO: CardDTO, files: { [fieldname: string]: Express.Multer.File[] }): Promise<Card> {
        const validationError = validateCard(cardDTO);
        if (validationError) {
            throw new Error(i18n.t(validationError));
        }

        const deck = await this.deckRepository.findDeckById(cardDTO.deckId);

        if (!deck) {
            throw new Error(i18n.t("deck.notFound"));
        }

        const processMediaBlocks = async (blocks: MediaBlockDTO[]) => {
            return Promise.all(blocks.map(async (block) => {
                if (block.type === "text") return block;

                const file = files[block.fileFieldName!]?.[0];
                if (!file) {
                    throw new Error(i18n.t("card.missingFile", { field: block.fileFieldName }));
                }

                const storageResult: StoredMediaResult = await storeMedia(file);

                return {
                    type: block.type,
                    ...storageResult,
                    contentType: file.mimetype,
                    size: file.size
                };
            }));
        };

        const processedCard = {
            ...cardDTO,
            front: await processMediaBlocks(cardDTO.front),
            back: await processMediaBlocks(cardDTO.back)
        };

        return await this.cardRepository.createCard(processedCard);
    }

    public async getById(id: string): Promise<Card | null> {
        if (!id) {
            throw new Error(i18n.t("id.nonNull"));
        }
        
        const card = await this.cardRepository.findCardById(id);
        if (!card) 
            return null;

        card.front = await this.processMediaBlocks(card.front);
        card.back = await this.processMediaBlocks(card.back);

        return card;
    }

    public async getAll(filters: FilterQuery<Card> = {}): Promise<Card[]> {
        return await this.cardRepository.findAllCards(filters);
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

    private async processMediaBlocks(blocks: MediaBlock[]): Promise<MediaBlock[]> {
        return Promise.all(blocks.map(async (block) => {
            if (block.type === "text") return block;

            const processedBlock: MediaBlock = {
                type: block.type,
                contentType: block.contentType
            };

            if (block.data) {
                //TODO Rever conversao para base64
                //processedBlock.data = (block.data as any).toString("base64");
                return processedBlock;
            }

            if (block.gridFsId) {
                const gridFsId = new mongoose.Types.ObjectId(block.gridFsId);
                const chunks: Buffer[] = [];

                const downloadStream = gridFSBucket.openDownloadStream(gridFsId);
                await new Promise((resolve, reject) => {
                    downloadStream.on("data", (chunk) => chunks.push(chunk));
                    downloadStream.on("end", resolve);
                    downloadStream.on("error", reject);
                });

                //TODO Rever conversao para base64
                //processedBlock.data = Buffer.concat(chunks).toString("base64");
                return processedBlock;
            }

            throw new Error(i18n.t("card.malformedMediaBlock"));
        }));
    }
}