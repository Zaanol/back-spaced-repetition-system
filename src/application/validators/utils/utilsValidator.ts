export const isEmpty = (text: string): boolean => {
    return !text || text.trim() === '';
}

export const isValidEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
};