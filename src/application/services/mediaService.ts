import { MediaRepository } from "../../infrastructure/repositories/mediaRepository";
import { MediaBlock } from "../../domain/models/mediaBlock";
import { MediaReducedDTO, MediaDTO } from "../dtos/mediaDTO";
import { gridFSBucket, storeMedia } from "../../infrastructure/storages/storage";
import i18n from "../../config/i18n";
import mongoose from "mongoose";
import { Response } from "express";

//TODO Create i18n and validade the pattern of CONST to spread to other services
const ERROR_MESSAGES = {
    ID_REQUIRED: "id.nonNull",
    MEDIA_NOT_FOUND: "mediaBlock.notFound",
    TEXT_NOT_FOUND: "mediaBlock.textNotFound",
    GRIDFS_NOT_FOUND: "mediaBlock.gridFsNotFound",
    MALFORMED_MEDIA: "mediaBlock.malformed",
};

const CONTENT_HEADERS = {
    OCTET_STREAM: "application/octet-stream",
};

export class MediaService {
    private mediaRepository: MediaRepository;

    constructor(mediaRepository: MediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    public async create(blocks: MediaReducedDTO[], files: { [fieldname: string]: Express.Multer.File[] }): Promise<MediaBlock[]> {
        return Promise.all(blocks.map(async (block) => {
            return this.createBlock(block, files);
        }));
    }

    public async createBlock(block: MediaReducedDTO, files: { [fieldname: string]: Express.Multer.File[] }): Promise<MediaBlock> {
        const mediaBlockData: MediaDTO = {
            type: block.type,
            contentType: block.type === "text" ? undefined : block.contentType,
        };

        if (block.type === "text") {
            mediaBlockData.text = block.text;
        } else {
            const file = files[block.fileFieldName!]?.[0];
            if (!file) {
                throw new Error(i18n.t("media.missingFile", { field: block.fileFieldName }));
            }

            const storageResult = await storeMedia(file);

            if (storageResult.gridFsId) {
                mediaBlockData.gridFsId = storageResult.gridFsId;
            } else {
                mediaBlockData.data = storageResult.data;
            }

            mediaBlockData.size = file.size;
            mediaBlockData.contentType = file.mimetype;
        }

        return await this.mediaRepository.createMedia(mediaBlockData);
    }

    public async getById(id: string, res: Response): Promise<void> {
        this.validateId(id);
        const mediaBlock = await this.getValidMediaBlock(id, res);

        switch (mediaBlock.type) {
            case "text":
                this.handleTextMedia(mediaBlock, res);
                break;
            case "image":
            case "audio":
                this.handleBinaryMedia(mediaBlock, res);
                break;
            default:
                this.sendError(res, 400, ERROR_MESSAGES.MALFORMED_MEDIA);
        }
    }

    private validateId(id: string): void {
        if (!id) {
            throw new Error(i18n.t(ERROR_MESSAGES.ID_REQUIRED));
        }
    }

    private async getValidMediaBlock(id: string, res: Response): Promise<MediaBlock> {
        const mediaBlock = await this.mediaRepository.findMediaById(id);

        if (!mediaBlock) {
            this.sendError(res, 404, ERROR_MESSAGES.MEDIA_NOT_FOUND);
        }

        return mediaBlock!;
    }

    private handleTextMedia(mediaBlock: MediaBlock, res: Response): void {
        if (!mediaBlock.text) {
            this.sendError(res, 404, ERROR_MESSAGES.TEXT_NOT_FOUND);
            return;
        }

        res.json({ type: "text", text: mediaBlock.text });
    }

    private handleBinaryMedia(mediaBlock: MediaBlock, res: Response): void {
        if (mediaBlock.data) {
            this.sendInlineData(mediaBlock, res);
        } else if (mediaBlock.gridFsId) {
            this.streamGridFsData(mediaBlock, res);
        } else {
            this.sendError(res, 400, ERROR_MESSAGES.MALFORMED_MEDIA);
        }
    }

    private sendInlineData(mediaBlock: MediaBlock, res: Response): void {
        const buffer = this.getBuffer(mediaBlock.data as Buffer);

        this.setContentHeaders(res, mediaBlock, buffer.length);
        res.send(buffer);
    }

    private async streamGridFsData(mediaBlock: MediaBlock, res: Response): Promise<void> {
        try {
            const gridFsId = new mongoose.Types.ObjectId(mediaBlock.gridFsId);
            const [file] = await gridFSBucket.find({ _id: gridFsId }).toArray();

            if (!file) {
                this.sendError(res, 404, ERROR_MESSAGES.GRIDFS_NOT_FOUND);
                return;
            }

            this.setContentHeaders(res, mediaBlock, file.length, file.metadata?.contentType);
            gridFSBucket.openDownloadStream(gridFsId).pipe(res);
        } catch (error) {
            console.log(`Error streamGridFsData ${error}`);
            this.sendError(res, 500, ERROR_MESSAGES.MALFORMED_MEDIA);
        }
    }

    private getBuffer(data: Buffer | string): Buffer {
        return Buffer.isBuffer(data) ? data : Buffer.from(data);
    }

    private setContentHeaders(
        res: Response,
        mediaBlock: MediaBlock,
        contentLength: number,
        overrideContentType?: string
    ): void {
        res.setHeader("Content-Type",
            overrideContentType ||
            mediaBlock.contentType ||
            CONTENT_HEADERS.OCTET_STREAM
        );
        res.setHeader("Content-Length", contentLength.toString());
    }

    private sendError(res: Response, statusCode: number, messageKey: string): void {
        res.status(statusCode).json({ error: i18n.t(messageKey) });
    }
}