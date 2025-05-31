import { Model, FilterQuery, Document } from "mongoose";

export interface PaginationOptions {
    page?: number;
    pageSize?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    pages: number;
}

export interface IBaseRepository<T extends Document> {
    findAllPaginated(filters: FilterQuery<T>): Promise<PaginatedResult<T>>;
}

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
    constructor(private model: Model<T>) {
    }

    async findAllPaginated(
        filter: FilterQuery<T> = {},
        { page = 1, pageSize = 10 }: PaginationOptions = {}
    ): Promise<PaginatedResult<T>> {
        const skip = (page - 1) * pageSize;
        const query = this.model.find(filter)
            .skip(skip)
            .limit(pageSize);

        const [data, total] = await Promise.all([
            query.exec(),
            this.model.countDocuments(filter)
        ]);

        return {
            data,
            total,
            page,
            pageSize,
            pages: Math.ceil(total / pageSize)
        };
    }
}