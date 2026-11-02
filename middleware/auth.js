import jwt from 'jsonwebtoken';

// Пропускает дальше только запросы с действительным токеном
export function requireAuth(req, res, next) {
  // Заголовок выглядит так:  Authorization: Bearer eyJhbGciOi...
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Требуется вход в систему' });
  }

  let payload;
  try {
    // verify проверяет подпись и срок действия; при ошибке — исключение
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const error = err.name === 'TokenExpiredError'
      ? 'Срок действия токена истёк, войдите снова'
      : 'Недействительный токен';
    return res.status(401).json({ error });
  }

  req.user = { id: Number(payload.sub), role: payload.role };
  next();
}

// Пропускает дальше только пользователей с нужной ролью.
// Используется ПОСЛЕ requireAuth: requireRole('admin')
export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
  };
}
