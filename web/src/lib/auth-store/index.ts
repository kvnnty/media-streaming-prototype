export const saveToken = (token: string) => localStorage.setItem("auth-token", token);
export const getToken = () => localStorage.getItem("auth-token");
export const clearToken = () => localStorage.removeItem("auth-token");
