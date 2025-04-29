import { UserRepository } from '../../infrastructure/repositories/userRepository';
import { UserDTO } from '../dtos/userDTO';
import { User } from '../../domain/models/user';
import { validateLogin, validateUser } from '../validators/userValidator';
import { generateToken } from '../../infrastructure/security/jwt';
import { LoginDTO } from "../dtos/loginDTO";
import { PasswordUtils } from '../../infrastructure/security/utils/password';
import { TokenDTO } from "../dtos/tokenDTO";
import i18n from '../../config/i18n';

export class UserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public async login(loginDTO: LoginDTO): Promise<TokenDTO> {
        const validationError = validateLogin(loginDTO);
        if (validationError) {
            throw new Error(i18n.t(validationError));
        }

        const { email, password } = loginDTO;

        const user = await this.userRepository.findUserByEmail(email);

        if (user && await PasswordUtils.comparePasswords(password, user.password)) {
            return generateToken({ userId: user.id });
        }

        throw new Error('Invalid email or password');
    }

    public async create(userDTO: UserDTO): Promise<User> {
        const validationError = validateUser(userDTO);
        if (validationError) {
            throw new Error(i18n.t(validationError));
        }

        return await this.userRepository.createUser({
            ...userDTO,
            password: await PasswordUtils.hashPassword(userDTO.password)
        });
    }

    public async getById(id: string): Promise<User | null> {
        return await this.userRepository.findUserById(id);
    }
}