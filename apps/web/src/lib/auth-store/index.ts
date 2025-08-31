export const saveAuth = (token: string, user: any): void => {
  localStorage.setItem("auth-token", token);
  localStorage.setItem("auth-user", JSON.stringify(user));
};

export const getAuth = () => {
  const token = localStorage.getItem("auth-token");
  const userString = localStorage.getItem("auth-user");

  let user = null;
  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch {
      console.warn("Failed to parse auth-user from localStorage");
      user = null;
    }
  }

  return { token, user };
};

export const clearAuth = (): void => {
  localStorage.removeItem("auth-token");
  localStorage.removeItem("auth-user");
};
