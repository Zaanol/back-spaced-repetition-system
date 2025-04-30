import { Model } from 'mongoose';
import { FilterQuery } from 'mongoose';
import { Deck } from '../../domain/models/deck';
import deckModel from '../../domain/models/deck';
import { DeckDTO } from '../../application/dtos/deckDTO';
import { v4 as uuidv4 } from 'uuid';

export interface IDeckRepository {
    createDeck(_deck: DeckDTO): Promise<Deck>;
    findDeckById(_deckId: string): Promise<Deck | null>;
    findAllDecks(filters: Partial<DeckDTO>): Promise<Deck[]>;
}

export class DeckRepository implements IDeckRepository {
    private readonly deckModel: Model<Deck>;

    constructor(deckModel: Model<Deck>) {
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

    public async findAllDecks(filters: FilterQuery<Deck>): Promise<Deck[]> {
        return await this.deckModel.find(filters).exec();
    }
}

export default new DeckRepository(deckModel);