import { AsyncResource } from "async_hooks";

export function ensureAsyncContext(middleware) {
    return (req, res, next) => middleware(req, res, AsyncResource.bind(next));
}