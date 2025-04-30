import { UserDTO } from '../dtos/userDTO';
import { LoginDTO } from "../dtos/loginDTO";
import { isEmpty, isValidEmail } from "./utils/utilsValidator";

//TODO This code must to be improved
export const validateUser = (user: UserDTO): string | null => {
    const { username, email, password } = user;

    if (isEmpty(username)) {
        return 'username.nonNull';
    }

    if (isEmpty(email)) {
        return 'email.nonNull';
    }

    if (!isValidEmail(user.email)) {
        return 'email.invalid';
    }

    if (isEmpty(password)) {
        return 'password.nonNull';
    }

    return null;
};

export const validateLogin = (login: LoginDTO): string | null => {
    const { email, password } = login;

    if (isEmpty(email)) {
        return 'email.nonNull';
    }

    if (!isValidEmail(login.email)) {
        return 'email.invalid';
    }

    if (isEmpty(password)) {
        return 'password.nonNull';
    }

    return null;
};