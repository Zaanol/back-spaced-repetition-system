import { mockUserDTO } from "@mocks/userDTO.mock";
import { User } from "../../../src/domain/models/user";

export const mockUser = {
    id: '1',
    ...mockUserDTO,
    password: 'hashedPassword'
} as User;