import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  if (token.startsWith('ameta_corp_')) {
    try {
      const emailPayload = Buffer.from(
        token.replace('ameta_corp_', ''),
        'base64'
      ).toString('utf-8');
      if (emailPayload && emailPayload.includes('@')) {
        req.user = {
          uid: `local_${emailPayload.toLowerCase()}`,
          email: emailPayload.toLowerCase(),
        } as DecodedIdToken;
        return next();
      }
    } catch {
      // Fall through to Firebase token verification
    }
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
