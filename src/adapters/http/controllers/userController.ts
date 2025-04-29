import { Request, Response } from 'express';
import { UserService } from '../../../application/services/userService';

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;

        this.login = this.login.bind(this);
        this.createUser = this.createUser.bind(this);
        this.getUser = this.getUser.bind(this);
    }

    public async login(req: Request, res: Response, next): Promise<void> {
        try {
            const token = await this.userService.login(req.body);

            res.status(201).json(token);
        } catch (error) {
            next(error);
        }
    }

    public async createUser(req: Request, res: Response, next): Promise<void> {
        try {
            const newUser = await this.userService.create(req.body);

            res.status(201).json(newUser);
        } catch (error) {
            next(error);
        }
    }

    public async getUser(req: Request, res: Response, next): Promise<void> {
        try {
            const id = (req as any).user.id;

            const user = await this.userService.getById(id);

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json(user);
        } catch (error) {
            next(error);
        }
    }
}