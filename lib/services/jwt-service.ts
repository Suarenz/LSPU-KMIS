// This service is now primarily for handling custom JWT tokens when needed
// For Supabase authentication, use the built-in session management instead
import { SignOptions, verify, sign } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

class JWTService {
  private readonly secret: string;
  private readonly options: SignOptions;

  constructor() {
    this.secret = process.env.JWT_SECRET || '6dFk5d0vbyLnZC0Amy83LtI47DsNr/KB4M+FgbUc6njd4cjk7XB2/8nTuhQDWW8OOgQ6fI74huxJE3a/RP2giw==';
    this.options = {
      expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : '24h',
    };
  }

 generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return sign(payload, this.secret, this.options);
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
}

export default new JWTService();