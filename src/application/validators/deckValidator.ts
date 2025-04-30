import { DeckDTO } from '../dtos/deckDTO';
import { isEmpty } from "./utils/utilsValidator";

export const validateDeck = (deck: DeckDTO): string | null => {
    const { name } = deck;

    if (isEmpty(name)) {
        return 'deck.name.nonNull';
    }

    return null;
};