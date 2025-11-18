// This service is for handling custom JWT tokens for database authentication

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

class JWTService {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || '6dFk5d0vbyLnZC0Amy83LtI47DsNr/KB4M+FgbUc6njd4cjk7XB2/8nTuhQDWW8OOgQ6fI74huxJE3a/RP2giw==';
  }

  /**
   * Convert a string to a Uint8Array (which can be used with Web Crypto API)
   */
 private stringToUint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str);
 }

 /**
  * Convert a Uint8Array to a base64url encoded string
  */
 private uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
   let binary = '';
   for (let i = 0; i < uint8Array.byteLength; i++) {
     binary += String.fromCharCode(uint8Array[i]);
   }
   return btoa(binary)
     .replace(/\+/g, '-')
     .replace(/\//g, '_')
     .replace(/=/g, '');
 }

  /**
   * Import the secret as a CryptoKey for use with Web Crypto API
   */
  private async importSecret(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(this.secret);
    
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }

 /**
   * Generate a JWT token using Web Crypto API
   */
  async generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
    try {
      // Create the header
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      };

      // Add timestamp and expiration (1 hour from now)
      const timestamp = Math.floor(Date.now() / 1000);
      const expiration = timestamp + 3600; // 1 hour in seconds

      // Create the payload with the provided data and timestamps
      const fullPayload = {
        ...payload,
        iat: timestamp,
        exp: expiration
      };

      // Encode header and payload to base64url
      const encodedHeader = this.uint8ArrayToBase64Url(
        this.stringToUint8Array(JSON.stringify(header))
      );
      const encodedPayload = this.uint8ArrayToBase64Url(
        this.stringToUint8Array(JSON.stringify(fullPayload))
      );

      // Create the signing input
      const signingInput = `${encodedHeader}.${encodedPayload}`;

      // Import the secret as a crypto key
      const key = await this.importSecret();

      // Create signing input buffer in the proper format for Web Crypto API
      const encoder = new TextEncoder();
      const signingInputBuffer = encoder.encode(signingInput);
      
      // Sign the token - use type assertion to handle TypeScript compatibility issues
      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        signingInputBuffer as BufferSource
      );

      // Encode the signature - signatureBuffer is an ArrayBuffer, convert to base64url
      const signatureUint8Array = new Uint8Array(signatureBuffer);
      const encodedSignature = this.uint8ArrayToBase64Url(signatureUint8Array);

      // Return the complete JWT token
      return `${signingInput}.${encodedSignature}`;
    } catch (error) {
      console.error('JWT token generation failed:', error);
      throw new Error('Failed to generate JWT token');
    }
  }

  /**
   * Verify a JWT token using Web Crypto API
   */
  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      // Check if token is valid before attempting to verify
      if (!token || typeof token !== 'string' || token.trim() === '') {
        console.error('Invalid token provided for verification');
        return null;
      }
      
      // Check if token has proper format (3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Token format is invalid');
        return null;
      }

      const [encodedHeader, encodedPayload, encodedSignature] = tokenParts;

      // Decode header
      const decodedHeader = this.base64UrlDecode(encodedHeader);
      if (!decodedHeader) {
        console.error('Failed to decode token header');
        return null;
      }

      // Decode payload
      const decodedPayloadStr = this.base64UrlDecode(encodedPayload);
      if (!decodedPayloadStr) {
        console.error('Failed to decode token payload');
        return null;
      }

      // Parse payload
      const payloadObj = JSON.parse(decodedPayloadStr) as TokenPayload;
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payloadObj.exp && payloadObj.exp < currentTime) {
        console.error('Token has expired');
        return null;
      }

      // Import the secret as a crypto key
      const key = await this.importSecret();

      // Verify the signature
      const isValid = await this.verifySignature(
        `${encodedHeader}.${encodedPayload}`,
        encodedSignature,
        key
      );

      if (!isValid) {
        console.error('Token signature verification failed');
        return null;
      }

      return payloadObj;
    } catch (error: any) {
      console.error('Token verification failed:', error?.message || error);
      return null;
    }
  }

  /**
   * Verify the JWT signature using Web Crypto API
   */
  private async verifySignature(
    signingInput: string,
    signature: string,
    key: CryptoKey
  ): Promise<boolean> {
    try {
      // Decode the signature from base64url to Uint8Array
      const signatureBytes = this.base64UrlDecodeToUint8Array(signature);
      if (!signatureBytes) {
        return false;
      }

      // Create proper buffers for Web Crypto API
      const encoder = new TextEncoder();
      const verificationInputBuffer = encoder.encode(signingInput);
      
      // Use ArrayBufferView for signatureBytes and input buffer
      // Cast to appropriate types to handle TypeScript issues
      const signatureView = new Uint8Array(signatureBytes.buffer, signatureBytes.byteOffset, signatureBytes.byteLength);
      const inputView = new Uint8Array(verificationInputBuffer.buffer, verificationInputBuffer.byteOffset, verificationInputBuffer.byteLength);
      
      // Verify the signature - use type assertion to handle TypeScript compatibility issues
      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        signatureView as BufferSource,
        inputView as BufferSource
      );

      return isValid;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

 /**
   * Decode a JWT token without verification (for edge runtime compatibility)
   * This only extracts the payload without validating the signature
   * Use carefully - only for non-sensitive operations like checking expiration
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      if (!token || typeof token !== 'string' || token.trim() === '') {
        return null;
      }
      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Token format is invalid');
        return null;
      }

      const payload = tokenParts[1];
      const decodedPayload = this.base64UrlDecode(payload);
      if (!decodedPayload) {
        return null;
      }
      
      return JSON.parse(decodedPayload) as TokenPayload;
    } catch (error: any) {
      console.error('Token decoding failed:', error?.message || error);
      return null;
    }
  }

  /**
   * Check if a token is expired without full verification
   * This uses the decode method which doesn't require the secret
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true; // If we can't decode or there's no expiration, consider it expired
      }
      // Compare expiration timestamp with current time (in seconds)
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If there's an error, assume token is expired
    }
  }

  /**
   * Helper function to decode base64url encoded strings
   */
  private base64UrlDecode(str: string): string | null {
    try {
      // Add padding if needed
      const padding = '='.repeat((4 - (str.length % 4)) % 4);
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
      const rawData = atob(base64);
      return decodeURIComponent(escape(rawData));
    } catch (error) {
      console.error('Base64 URL decode error:', error);
      return null;
    }
  }

  /**
   * Helper function to decode base64url string to Uint8Array
   */
  private base64UrlDecodeToUint8Array(str: string): Uint8Array | null {
    try {
      // Add padding if needed
      const padding = '='.repeat((4 - (str.length % 4)) % 4);
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
      const rawData = atob(base64);
      
      const buffer = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        buffer[i] = rawData.charCodeAt(i);
      }
      
      return buffer;
    } catch (error) {
      console.error('Base64 URL decode to Uint8Array error:', error);
      return null;
    }
  }
}

export default new JWTService();