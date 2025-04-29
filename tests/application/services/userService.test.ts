import { UserService } from '../../../src/application/services/userService';
import { UserRepository } from '../../../src/infrastructure/repositories/userRepository';
import { validateLogin, validateUser } from '../../../src/application/validators/userValidator';
import { PasswordUtils } from '../../../src/infrastructure/security/utils/password';
import { generateToken } from '../../../src/infrastructure/security/jwt';
import { mockLoginDTO } from '@mocks/loginDTO.mock';
import { mockUserDTO } from '@mocks/userDTO.mock';
import { mockUser } from "@mocks/user.mock";

jest.mock('../../../src/infrastructure/repositories/userRepository');
jest.mock('../../../src/application/validators/userValidator');
jest.mock('../../../src/infrastructure/security/utils/password');
jest.mock('../../../src/infrastructure/security/jwt');

describe('UserService', () => {
    let userService: UserService;
    let userRepositoryMock: jest.Mocked<UserRepository>;

    beforeEach(() => {
        userRepositoryMock = {
            findUserByEmail: jest.fn(),
            createUser: jest.fn(),
            findUserById: jest.fn(),
        } as unknown as jest.Mocked<UserRepository>;

        userService = new UserService(userRepositoryMock);
    });

    describe('login', () => {
        it('should login a user successfully', async () => {
            (validateLogin as jest.Mock).mockReturnValue(null);
            userRepositoryMock.findUserByEmail.mockResolvedValue(mockUser);
            (PasswordUtils.comparePasswords as jest.Mock).mockResolvedValue(true);
            (generateToken as jest.Mock).mockReturnValue({ token: 'jwtToken' });

            const result = await userService.login(mockLoginDTO);

            expect(validateLogin).toHaveBeenCalledWith(mockLoginDTO);
            expect(userRepositoryMock.findUserByEmail).toHaveBeenCalledWith(mockLoginDTO.email);
            expect(PasswordUtils.comparePasswords).toHaveBeenCalledWith(mockLoginDTO.password, mockUser.password);
            expect(generateToken).toHaveBeenCalledWith({ userId: mockUser.id });
            expect(result).toEqual({ token: 'jwtToken' });
        });

        it('should throw an error if user not found or password is invalid', async () => {
            userRepositoryMock.findUserByEmail.mockResolvedValue(null);

            await expect(userService.login(mockLoginDTO)).rejects.toThrow('Invalid email or password');
            expect(userRepositoryMock.findUserByEmail).toHaveBeenCalledWith(mockLoginDTO.email);
        });
    });

    describe('create', () => {
        it('should create a user successfully', async () => {
            (validateUser as jest.Mock).mockReturnValue(null);
            (PasswordUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
            userRepositoryMock.createUser.mockResolvedValue(mockUser);

            const result = await userService.create(mockUserDTO);

            expect(validateUser).toHaveBeenCalledWith(mockUserDTO);
            expect(PasswordUtils.hashPassword).toHaveBeenCalledWith(mockUserDTO.password);
            expect(userRepositoryMock.createUser).toHaveBeenCalledWith({
                ...mockUserDTO,
                password: 'hashedPassword',
            });
            expect(result).toEqual(mockUser);
        });

        it('should throw an error if validation fails', async () => {
            (validateUser as jest.Mock).mockReturnValue('INVALID_USER');

            await expect(userService.create(mockUserDTO)).rejects.toThrow('INVALID_USER');
            expect(userRepositoryMock.createUser).not.toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('should retrieve a user by ID', async () => {
            userRepositoryMock.findUserById.mockResolvedValue(mockUser);

            const result = await userService.getById('1');

            expect(userRepositoryMock.findUserById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });

        it('should return null if user is not found', async () => {
            userRepositoryMock.findUserById.mockResolvedValue(null);

            const result = await userService.getById('1');

            expect(userRepositoryMock.findUserById).toHaveBeenCalledWith('1');
            expect(result).toBeNull();
        });
    });
});