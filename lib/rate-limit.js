const store = new Map();

export function rateLimit({ interval = 60000, max = 10 } = {}) {
  return (key) => {
    const now = Date.now();
    const record = store.get(key);

    if (!record || now - record.start > interval) {
      store.set(key, { start: now, count: 1 });
      return { allowed: true };
    }

    if (record.count >= max) {
      return { allowed: false, retryAfter: Math.ceil((interval - (now - record.start)) / 1000) };
    }

    record.count++;
    return { allowed: true };
  };
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store) {
      if (now - record.start > 120000) store.delete(key);
    }
  }, 300000);
}
