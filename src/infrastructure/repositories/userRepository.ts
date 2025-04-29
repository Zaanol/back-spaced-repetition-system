import { Model } from 'mongoose';
import { User } from '../../domain/models/user';
import userModel from '../../domain/models/user';
import { UserDTO } from '../../application/dtos/userDTO';
import { v4 as uuidv4 } from 'uuid';

export interface IUserRepository {
    createUser(_user: UserDTO): Promise<User>;
    findUserById(_userId: string): Promise<User | null>;
    findUserByEmail(_email: string): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
    private readonly userModel: Model<User>;

    constructor(userModel: Model<User>) {
        this.userModel = userModel;
    }

    public async createUser(userDTO: UserDTO): Promise<User> {
        const newUser = new this.userModel({
            uuid: uuidv4(),
            username: userDTO.username,
            email: userDTO.email,
            password: userDTO.password
        });

        return await newUser.save();
    }

    public async findUserByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    public async findUserById(id: string): Promise<User | null> {
        return await this.userModel.findOne({ uuid: id }).exec();
    }
}

export default new UserRepository(userModel);