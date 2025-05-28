import { Model, FilterQuery } from "mongoose";
import { Card } from "../../domain/models/card";
import cardModel from "../../domain/models/card";
import { CardDTO } from "../../application/dtos/cardDTO";
import { v4 as uuidv4 } from "uuid";

export interface ICardRepository {
    createCard(card: CardDTO): Promise<Card>;
    findCardById(id: string): Promise<Card | null>;
    findAllCards(filters: FilterQuery<Card>): Promise<Card[]>;
    updateCard(id: string, card: Partial<CardDTO>): Promise<Card | null>;
    deleteCard(id: string): Promise<boolean>;
}

export class CardRepository implements ICardRepository {
    private readonly cardModel: Model<Card>;

    constructor(cardModel: Model<Card>) {
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

    public async findAllCards(filters: FilterQuery<Card>): Promise<Card[]> {
        return await this.cardModel.find(filters).exec();
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