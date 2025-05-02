export interface MediaBlockDTO {
    type: "text" | "image" | "audio";
    text?: string;
    fileFieldName?: string;
    contentType?: string;
}

export interface CardDTO {
    deckId: string;
    front: MediaBlockDTO[];
    back: MediaBlockDTO[];
}