import jwt from 'jsonwebtoken';

export function getUserId(_token: string, secret: string) {
  let token = _token;

  if (_token.includes('Bearer')) {
    token = token.split(' ')[1];
  }

  try {
    const decoded: any = jwt.verify(token, secret);

    if (!decoded.id) {
      return undefined;
    }

    return decoded.id;
  } catch {
    return undefined;
  }
}

export function isAuthenticated(req: any, res: any, next: any) {
  try {
    const token = req.get('authorization');

    if (!token) {
      return res.status(403).json({ message: 'Token not found.' });
    }

    const userId = req.userId;

    if (!userId) {
      throw new Error('Token not valid.');
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: error.message ?? 'Nie udało się zweryfikować tokena uwierzytelnienia.' });
  }
}
