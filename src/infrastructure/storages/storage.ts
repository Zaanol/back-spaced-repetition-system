import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";

let gridFSBucket: GridFSBucket;

mongoose.connection.once("open", () => {
    gridFSBucket = new GridFSBucket(mongoose.connection.db!, {
        bucketName: "media",
        chunkSizeBytes: 255 * 1024
    });
});

interface StoredMediaResult {
    data?: Buffer;
    gridFsId?: mongoose.Types.ObjectId;
    size: number;
    contentType: string;
}

const storeMedia = async (file: Express.Multer.File): Promise<StoredMediaResult> => {
    if (file.size < 16 * 1024 * 1024) {
        return {
            data: file.buffer,
            size: file.size,
            contentType: file.mimetype
        };
    }

    return new Promise((resolve, reject) => {
        const uploadStream = gridFSBucket.openUploadStream(file.originalname, {
            metadata: {
                contentType: file.mimetype,
                originalName: file.originalname,
                uploadedAt: new Date()
            }
        });

        uploadStream.end(file.buffer);

        uploadStream.on("finish", () => {
            let gridFSFile = uploadStream.gridFSFile;

            resolve({
                gridFsId: gridFSFile!._id,
                size: gridFSFile!.length,
                contentType: gridFSFile!.metadata!.contentType
            });
        });

        uploadStream.on("error", reject);
    });
};

export { gridFSBucket, storeMedia, StoredMediaResult };