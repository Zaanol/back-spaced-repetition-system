import { AsyncLocalStorage } from "async_hooks";
import { AuthUser } from "../../../types/express";

const userContext = new AsyncLocalStorage<{ user: AuthUser }>();

export function setUserContext(authUser: AuthUser, callBack: () => void) {
    userContext.run(
        { user: authUser }, callBack
    );
}

export function getContextUserId(): string {
    const userId = userContext.getStore()?.user.id;

    if (!userId) {
        throw new Error("Context without User");
    }

    return userId;
}