import mongoose from "mongoose";
import { MediaBlockType } from "../../domain/models/mediaBlock";

export interface MediaDTO {
    type: MediaBlockType;
    text?: string;
    fileFieldName?: string;
    data?: Buffer;
    gridFsId?: mongoose.Types.ObjectId;
    contentType?: string;
    size?: number;
}

export interface MediaReducedDTO {
    type: MediaBlockType;
    text?: string;
    fileFieldName?: string;
    contentType?: string;
}