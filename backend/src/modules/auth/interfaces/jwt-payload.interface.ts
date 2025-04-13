export interface JwtPayload {
  sub: string;      // user id
  email: string;
  isAdmin: boolean;
  iat?: number;     // issued at
  exp?: number;     // expiration time
} 