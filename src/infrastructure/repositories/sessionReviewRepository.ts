import { Model } from "mongoose";
import { SessionReview } from "../../domain/models/sessionReview";
import sessionReviewModel from "../../domain/models/sessionReview";
import { SessionReviewDTO } from "../../application/dtos/sessionReviewDTO";
import { v4 as uuidv4 } from "uuid";
import { BaseRepository, IBaseRepository } from "./baseRepository";

export interface ISessionReviewRepository extends IBaseRepository<SessionReview> {
    createSessionReview(sessionReview: SessionReviewDTO): Promise<SessionReview>;
    findSessionReviewById(id: string): Promise<SessionReview | null>;
    updateSessionReview(id: string, sessionReview: Partial<SessionReviewDTO>): Promise<SessionReview | null>;
    deleteSessionReview(id: string): Promise<boolean>;
}

export class SessionReviewRepository extends BaseRepository<SessionReview> implements ISessionReviewRepository {
    private readonly sessionReviewModel: Model<SessionReview>;

    constructor(sessionReviewModel: Model<SessionReview>) {
        super(sessionReviewModel);

        this.sessionReviewModel = sessionReviewModel;
    }

    public async createSessionReview(sessionReviewDTO: SessionReviewDTO): Promise<SessionReview> {
        const newSessionReview = new this.sessionReviewModel({
            id: uuidv4(),
            deckId: sessionReviewDTO.deckId,
            cardIds: sessionReviewDTO.cardIds,
            type: sessionReviewDTO.type
        });

        return await newSessionReview.save();
    }

    public async findSessionReviewById(id: string): Promise<SessionReview | null> {
        return await this.sessionReviewModel.findOne({ id }).exec();
    }

    public async updateSessionReview(id: string, updateData: Partial<SessionReview>): Promise<SessionReview | null> {
        return await this.sessionReviewModel.findOneAndUpdate(
            { id },
            { $set: updateData },
            { new: true }
        ).exec();
    }

    public async deleteSessionReview(id: string): Promise<boolean> {
        const result = await this.sessionReviewModel.deleteOne({ id }).exec();
        return result.deletedCount === 1;
    }
}

export default new SessionReviewRepository(sessionReviewModel);