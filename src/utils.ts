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
