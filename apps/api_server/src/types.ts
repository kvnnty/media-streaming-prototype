export interface JWTPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}
