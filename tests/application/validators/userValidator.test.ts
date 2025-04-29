import { validateUser, validateLogin } from '../../../src/application/validators/userValidator';
import { UserDTO } from '../../../src/application/dtos/userDTO';
import { LoginDTO } from '../../../src/application/dtos/loginDTO';

describe('userValidator', () => {
    describe('validateUser', () => {
        it('should return "username.nonNull" if username is empty', () => {
            const user: UserDTO = { username: '', email: 'test@example.com', password: 'password123' };
            const result = validateUser(user);
            expect(result).toBe('username.nonNull');
        });

        it('should return "email.nonNull" if email is empty', () => {
            const user: UserDTO = { username: 'testuser', email: '', password: 'password123' };
            const result = validateUser(user);
            expect(result).toBe('email.nonNull');
        });

        it('should return "email.invalid" if email is not valid', () => {
            const user: UserDTO = { username: 'testuser', email: 'invalid-email', password: 'password123' };
            const result = validateUser(user);
            expect(result).toBe('email.invalid');
        });

        it('should return "password.nonNull" if password is empty', () => {
            const user: UserDTO = { username: 'testuser', email: 'test@example.com', password: '' };
            const result = validateUser(user);
            expect(result).toBe('password.nonNull');
        });

        it('should return null for valid user input', () => {
            const user: UserDTO = { username: 'testuser', email: 'test@example.com', password: 'password123' };
            const result = validateUser(user);
            expect(result).toBeNull();
        });
    });

    describe('validateLogin', () => {
        it('should return "email.nonNull" if email is empty', () => {
            const login: LoginDTO = { email: '', password: 'password123' };
            const result = validateLogin(login);
            expect(result).toBe('email.nonNull');
        });

        it('should return "email.invalid" if email is not valid', () => {
            const login: LoginDTO = { email: 'invalid-email', password: 'password123' };
            const result = validateLogin(login);
            expect(result).toBe('email.invalid');
        });

        it('should return "password.nonNull" if password is empty', () => {
            const login: LoginDTO = { email: 'test@example.com', password: '' };
            const result = validateLogin(login);
            expect(result).toBe('password.nonNull');
        });

        it('should return null for valid login input', () => {
            const login: LoginDTO = { email: 'test@example.com', password: 'password123' };
            const result = validateLogin(login);
            expect(result).toBeNull();
        });
    });
});
