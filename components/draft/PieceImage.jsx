'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cx, sizedSrc } from '@/lib/draft';

/** A hotlinked image that never settles is a dead image; say so rather than wait forever. */
const STALL_MS = 9000;

/**
 * A garment photograph in its punched window.
 *
 * Photography is a slot on this sheet, not its foundation. The drawn block is
 * the cell's ground and is painted first; the photograph fades in over it only
 * once it has actually decoded. A slow, hanging, or dead URL therefore shows
 * the drawing — never an empty grey rectangle.
 */
export default function PieceImage({ src: rawSrc, alt = '', className, eager = false, width = 900, label = 'No sheet on file' }) {
  const src = sizedSrc(rawSrc, width);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef(null);

  const settle = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    if (!src) return undefined;

    /* An image that decoded before React attached these handlers never fires
       onLoad, which would strand the cell on its placeholder forever. Ask the
       element directly on mount instead of waiting to be told. */
    const el = imgRef.current;
    if (el?.complete) {
      if (el.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
      return undefined;
    }

    const stall = setTimeout(() => {
      const node = imgRef.current;
      if (node?.complete && node.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }, STALL_MS);
    return () => clearTimeout(stall);
  }, [src]);

  const showDrawing = !src || failed || !loaded;

  return (
    <span className="relative block h-full w-full overflow-hidden bg-paper-2">
      {showDrawing && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <svg viewBox="0 0 100 120" className="h-1/2 w-auto max-w-[58%]" fill="none" aria-hidden="true">
            <path
              d="M30 18 L42 18 C45 24 55 24 58 18 L70 18 L92 34 L82 48 L74 42 L74 112 L26 112 L26 42 L18 48 L8 34 Z"
              stroke="#0b0b0b"
              strokeWidth="1.25"
              strokeDasharray="4 5"
              opacity="0.4"
            />
          </svg>
          {(!src || failed) && <span className="annot text-graphite">{label}</span>}
        </span>
      )}

      {src && !failed && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={settle}
          onError={() => setFailed(true)}
          /* Garment photography puts the piece in the upper-middle of the frame,
             so a dead-centre crop of a tall shot lands on a flat expanse of
             cloth and the cell reads as empty. Bias the crop toward the top. */
          className={cx(
            'relative h-full w-full object-cover object-[50%_22%]',
            'grayscale contrast-[1.06]',
            'transition-opacity duration-500 ease-draft',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
    </span>
  );
}
