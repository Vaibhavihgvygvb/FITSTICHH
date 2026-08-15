'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { CART_KEY } from '@/lib/draft';

const CartCtx = createContext(null);

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* a corrupt bag is an empty bag */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((product, size, color, qty = 1) => {
    setItems((prev) => {
      const key = `${product.id}|${size}|${color?.name}`;
      const idx = prev.findIndex((i) => i.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          size,
          color,
          quantity: qty,
          slug: product.slug,
          material: product.material,
        },
      ];
    });
  }, []);

  const update = useCallback((key, qty) => {
    setItems((prev) => prev.flatMap((i) => (i.key !== key ? [i] : qty <= 0 ? [] : [{ ...i, quantity: qty }])));
  }, []);

  const remove = useCallback((key) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    return { items, add, update, remove, clear, subtotal, totalQty, ready, open, setOpen };
  }, [items, add, update, remove, clear, ready, open]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
