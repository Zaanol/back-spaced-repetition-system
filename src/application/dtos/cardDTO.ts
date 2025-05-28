import { MediaReducedDTO } from "./mediaDTO";

export interface CardDTO {
    deckId: string;
    front: String[];
    back: String[];
}

export interface CardWithMediaBlocksDTO {
    deckId: string;
    front: MediaReducedDTO[];
    back: MediaReducedDTO[];
}