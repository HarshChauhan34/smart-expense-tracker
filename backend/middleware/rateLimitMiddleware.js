const store = new Map();

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

export const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 10,
  message = "Too many requests, please try again later.",
} = {}) => {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(Math.max(1, retryAfterSeconds)));
      return res.status(429).json({ message });
    }

    entry.count += 1;
    store.set(key, entry);
    next();
  };
};

