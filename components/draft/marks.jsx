import { cx } from '@/lib/draft';

/* ---------------------------------------------------------------------------
   The drawn marks of a pattern sheet. Every one of these exists on a real
   drafting table; none of them is decoration.
   --------------------------------------------------------------------------- */

/**
 * Grain line — the arrow that tells the cutter which way the cloth runs.
 * `aim` makes it single-headed, so it can point at something and mean it.
 */
export function GrainArrow({ className, vertical = false, label, aim = false }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <svg
        width={vertical ? 10 : 56}
        height={vertical ? 56 : 10}
        viewBox={vertical ? '0 0 10 56' : '0 0 56 10'}
        fill="none"
        aria-hidden="true"
        className="overflow-visible"
      >
        {vertical ? (
          <>
            <path d="M5 2 L5 54" stroke="currentColor" strokeWidth="1.5" />
            {!aim && <path d="M1.5 6 L5 1 L8.5 6" stroke="currentColor" strokeWidth="1.5" fill="none" />}
            <path d="M1.5 50 L5 55 L8.5 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </>
        ) : (
          <>
            <path d="M2 5 L54 5" stroke="currentColor" strokeWidth="1.5" />
            {!aim && <path d="M6 1.5 L1 5 L6 8.5" stroke="currentColor" strokeWidth="1.5" fill="none" />}
            <path d="M50 1.5 L55 5 L50 8.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </>
        )}
      </svg>
      {label ? <span className="annot">{label}</span> : null}
    </span>
  );
}

/**
 * The sheet reference, stamped in the drawing's margin where a real sheet
 * carries it — never stacked above the heading as a label.
 */
export function SheetStamp({ children, className, tone = 'ink' }) {
  return (
    <span
      className={cx(
        'annot inline-flex items-center gap-2.5 border-thin px-3 py-2',
        tone === 'chalk' ? 'border-chalk/40 text-chalk-dim' : 'border-ink/30 text-graphite',
        className
      )}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
        <path d="M0 0 L8 0 L4 7 Z" fill="currentColor" />
      </svg>
      {children}
    </span>
  );
}

/** Register notch — the punched triangle that aligns two pieces. */
export function Notch({ className, size = 10, dir = 'down' }) {
  const rot = { down: 0, up: 180, left: 90, right: 270 }[dir] ?? 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      aria-hidden="true"
      className={className}
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <path d="M0 0 L10 0 L5 9 Z" fill="currentColor" />
    </svg>
  );
}

/** A dimension line with its measurement, as drawn between two points. */
export function Dimension({ value, className, vertical = false }) {
  if (vertical) {
    return (
      <span className={cx('inline-flex flex-col items-center gap-1.5', className)}>
        <svg width="9" height="40" viewBox="0 0 9 40" fill="none" aria-hidden="true">
          <path d="M4.5 1 L4.5 39" stroke="currentColor" strokeWidth="1" />
          <path d="M0 1 L9 1 M0 39 L9 39" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span className="annot whitespace-nowrap">{value}</span>
      </span>
    );
  }
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <svg width="40" height="9" viewBox="0 0 40 9" fill="none" aria-hidden="true">
        <path d="M1 4.5 L39 4.5" stroke="currentColor" strokeWidth="1" />
        <path d="M1 0 L1 9 M39 0 L39 9" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="annot whitespace-nowrap">{value}</span>
    </span>
  );
}

/**
 * The title block — bottom-right corner of every technical drawing.
 * Carries who drew it, what it is, and at what scale.
 */
export function TitleBlock({ rows, className, tone = 'ink' }) {
  const onCloth = tone === 'chalk';
  return (
    <dl
      className={cx(
        'grid grid-cols-[auto_1fr] border-thin',
        onCloth ? 'border-chalk/45 text-chalk' : 'border-ink text-ink',
        className
      )}
    >
      {rows.map(([k, v], i) => (
        <div key={k} className="contents">
          <dt
            className={cx(
              'annot px-3 py-2 border-r-thin',
              onCloth ? 'border-chalk/30 text-chalk-dim' : 'border-ink/25 text-graphite',
              i > 0 && (onCloth ? 'border-t-hair border-t-chalk/20' : 'border-t-hair border-t-ink/15')
            )}
          >
            {k}
          </dt>
          <dd
            className={cx(
              'annot px-3 py-2 tnum',
              i > 0 && (onCloth ? 'border-t-hair border-t-chalk/20' : 'border-t-hair border-t-ink/15')
            )}
          >
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A leader line pointing at something, with a label at the end.
 * This is how the sheet speaks: it points, it does not caption.
 */
export function Leader({ children, className, side = 'left' }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      {side === 'left' && (
        <svg width="34" height="8" viewBox="0 0 34 8" fill="none" aria-hidden="true">
          <circle cx="2" cy="4" r="2" fill="currentColor" />
          <path d="M4 4 L34 4" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
      <span className="annot">{children}</span>
      {side === 'right' && (
        <svg width="34" height="8" viewBox="0 0 34 8" fill="none" aria-hidden="true">
          <path d="M0 4 L30 4" stroke="currentColor" strokeWidth="1" />
          <circle cx="32" cy="4" r="2" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}

/** Section rule with a label sitting on it, like a sheet's fold line. */
export function SheetRule({ label, className, tone = 'ink', action }) {
  const onCloth = tone === 'chalk';
  return (
    <div className={cx('flex items-center gap-4', className)}>
      <span className={cx('annot-lg shrink-0 font-medium', onCloth ? 'text-chalk' : 'text-ink')}>{label}</span>
      <span className={cx('h-px flex-1', onCloth ? 'bg-chalk/30' : 'bg-ink/20')} />
      {action}
    </div>
  );
}
