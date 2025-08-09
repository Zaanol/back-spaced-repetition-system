import { MediaReducedDTO } from "./mediaDTO";

export interface CardDTO {
    userId: string;
    deckId: string;
    front: String[];
    back: String[];
}

export interface CardWithMediaBlocksDTO {
    userId: string;
    deckId: string;
    front: MediaReducedDTO[];
    back: MediaReducedDTO[];
}