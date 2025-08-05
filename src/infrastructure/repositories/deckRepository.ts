import { Model } from "mongoose";
import { Deck } from "../../domain/models/deck";
import deckModel from "../../domain/models/deck";
import { DeckDTO } from "../../application/dtos/deckDTO";
import { v4 as uuidv4 } from "uuid";
import { BaseRepository, IBaseRepository } from "./baseRepository";

export interface IDeckRepository extends IBaseRepository<Deck> {
    createDeck(_deck: DeckDTO): Promise<Deck>;
    findDeckById(_deckId: string): Promise<Deck | null>;
    existsDeckById(_deckId: string): Promise<boolean>;
}

export class DeckRepository extends BaseRepository<Deck> implements IDeckRepository {
    private readonly deckModel: Model<Deck>;

    constructor(deckModel: Model<Deck>) {
        super(deckModel);

        this.deckModel = deckModel;
    }

    public async createDeck(deckDTO: DeckDTO): Promise<Deck> {
        const newDeck = new this.deckModel({
            uuid: uuidv4(),
            name: deckDTO.name,
            description: deckDTO.description
        });

        return await newDeck.save();
    }

    public async findDeckById(id: string): Promise<Deck | null> {
        return await this.deckModel.findOne({ id: id }).exec();
    }

    public async existsDeckById(id: string): Promise<boolean> {
        const count = await this.deckModel.countDocuments({ id: id }).exec();
        return count > 0;
    }
}

export default new DeckRepository(deckModel);