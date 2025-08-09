import { Model } from "mongoose";
import { MediaBlock } from "../../domain/models/mediaBlock";
import { MediaDTO } from "../../application/dtos/mediaDTO";
import mediaBlockModel from "../../domain/models/mediaBlock";
import { v4 as uuidv4 } from "uuid";

export interface IMediaRepository {
    createMedia(media: MediaDTO): Promise<MediaBlock>;
    findMediaById(id: string): Promise<MediaBlock | null>;
}

export class MediaRepository implements IMediaRepository {
    private readonly mediaBlockModel: Model<MediaBlock>;

    constructor(mediaBlockModel: Model<MediaBlock>) {
        this.mediaBlockModel = mediaBlockModel;
    }

    public async createMedia(mediaDTO: MediaDTO): Promise<MediaBlock> {
        const newMedia = new this.mediaBlockModel({
            id: uuidv4(),
            type: mediaDTO.type,
            text: mediaDTO.text,
            data: mediaDTO.data,
            gridFsId: mediaDTO.gridFsId,
            contentType: mediaDTO.contentType,
            size: mediaDTO.size
        });

        return await newMedia.save();
    }

    public async findMediaById(id: string): Promise<MediaBlock | null> {
        return await this.mediaBlockModel.findOne({ id }).exec();
    }
}

export default new MediaRepository(mediaBlockModel);