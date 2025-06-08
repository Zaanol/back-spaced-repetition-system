import { Model } from "mongoose";
import { Card } from "../../domain/models/card";
import cardModel from "../../domain/models/card";
import { CardDTO } from "../../application/dtos/cardDTO";
import { v4 as uuidv4 } from "uuid";
import {BaseRepository, IBaseRepository} from "./baseRepository";

export interface ICardRepository extends IBaseRepository<Card> {
    createCard(card: CardDTO): Promise<Card>;
    findCardById(id: string): Promise<Card | null>;
    updateCard(id: string, card: Partial<CardDTO>): Promise<Card | null>;
    deleteCard(id: string): Promise<boolean>;
}

export class CardRepository extends BaseRepository<Card> implements ICardRepository {
    private readonly cardModel: Model<Card>;

    constructor(cardModel: Model<Card>) {
        super(cardModel);

        this.cardModel = cardModel;
    }

    public async createCard(cardDTO: CardDTO): Promise<Card> {
        const newCard = new this.cardModel({
            id: uuidv4(),
            deckId: cardDTO.deckId,
            frontMediaIds: cardDTO.front,
            backMediaIds: cardDTO.back
        });

        return await newCard.save();
    }

    public async findCardById(id: string): Promise<Card | null> {
        return await this.cardModel.findOne({ id }).exec();
    }

    public async updateCard(id: string, updateData: Partial<CardDTO>): Promise<Card | null> {
        return await this.cardModel.findOneAndUpdate(
            { id },
            { $set: updateData },
            { new: true }
        ).exec();
    }

    public async deleteCard(id: string): Promise<boolean> {
        const result = await this.cardModel.deleteOne({ id }).exec();
        return result.deletedCount === 1;
    }
}

export default new CardRepository(cardModel);