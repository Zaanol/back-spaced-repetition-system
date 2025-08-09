import { CardWithMediaBlocksDTO } from "../dtos/cardDTO";

//TODO Create translations
export const validateCard = (card: CardWithMediaBlocksDTO): string | null => {
    if (!card.deckId) return "card.deckRequired";
    if (card.front.length === 0) return "card.frontRequired";
    if (card.back.length === 0) return "card.backRequired";

    for (const [side, blocks] of Object.entries({ front: card.front, back: card.back })) {
        for (const block of blocks) {
            if (block.type === "text" && !block.text) {
                return `card.textBlockRequired.${side}`;
            }
            if (block.type !== "text" && !block.fileFieldName) {
                return `card.fileFieldRequired.${side}`;
            }
        }
    }

    return null;
};