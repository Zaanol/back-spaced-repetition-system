import { Model } from "mongoose";
import { Card } from "../../domain/models/card";
import cardModel from "../../domain/models/card";
import { CardDTO } from "../../application/dtos/cardDTO";
import { v4 as uuidv4 } from "uuid";
import { BaseRepository, IBaseRepository } from "./baseRepository";

export interface ReviewSessionOptions {
    sessionType?: 'MIXED' | 'NEW' | 'REVIEW';
    currentDate?: Date;
    limit?: number;
    sortPriority?: 'LEARNING' | 'DATE' | 'MIXED';
}

export interface ICardRepository extends IBaseRepository<Card> {
    createCard(card: CardDTO): Promise<Card>;
    findCardById(id: string): Promise<Card | null>;
    updateCard(id: string, card: Partial<CardDTO>): Promise<Card | null>;
    deleteCard(id: string): Promise<boolean>;
    getCardsIdsForReview(deckId: string, options: ReviewSessionOptions): Promise<string[]>;
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

    public async getCardsIdsForReview(deckId: string, options: ReviewSessionOptions = {}): Promise<string[]> {
        const {
            sessionType = 'MIXED',
            currentDate = new Date(),
            limit = 200,
            sortPriority = 'LEARNING'
        } = options;

        const matchConditions: any = { deckId };

        switch (sessionType) {
            case 'NEW':
                matchConditions.$or = [
                    { repetitions: 0 },
                    { isLearning: true }
                ];
                break;
            case 'REVIEW':
                matchConditions.$and = [
                    { isLearning: false },
                    { repetitions: { $gt: 0 } },
                    {
                        $or: [
                            { nextReviewDate: { $lte: currentDate } },
                            { nextReviewDate: null }
                        ]
                    }
                ];
                break;
            case 'MIXED':
            default:
                matchConditions.$or = [
                    { repetitions: 0 },
                    { isLearning: true },
                    {
                        isLearning: false,
                        repetitions: { $gt: 0 },
                        $or: [
                            { nextReviewDate: { $lte: currentDate } },
                            { nextReviewDate: null }
                        ]
                    }
                ];
                break;
        }

        let sortCriteria: any;
        switch (sortPriority) {
            case 'LEARNING':
                sortCriteria = { isLearning: -1, learningStep: 1, nextReviewDate: 1 };
                break;
            case 'DATE':
                sortCriteria = { nextReviewDate: 1 };
                break;
            case 'MIXED':
            default:
                sortCriteria = {
                    isLearning: -1,
                    nextReviewDate: 1,
                    createdAt: 1
                };
                break;
        }

        const cards = await this.cardModel
            .find(matchConditions)
            .sort(sortCriteria)
            .limit(limit)
            .select('id -_id')
            .lean()
            .exec();

        return cards.map(card => card.id);
    }
}

export default new CardRepository(cardModel);