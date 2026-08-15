'use client';

import { forwardRef } from 'react';
import { cx } from '@/lib/draft';

/* ---------------------------------------------------------------------------
   Controls in the sheet's own vocabulary. Nothing here has a radius except the
   punched notch; hierarchy is carried by line weight and fill, never by hue.
   --------------------------------------------------------------------------- */

/** The primary action. A cut piece: notched corners, solid fill. */
export const CutButton = forwardRef(function CutButton(
  { as: As = 'button', className, children, tone = 'ink', size = 'md', ...rest },
  ref
) {
  const sizes = {
    sm: 'h-9 px-4 text-[10px]',
    md: 'h-12 px-7 text-[11px]',
    lg: 'h-14 px-9 text-[12px]',
  };
  const tones = {
    ink: 'bg-ink text-paper hover:bg-graphite',
    chalk: 'bg-chalk text-cloth hover:bg-chalk-dim',
  };
  return (
    <As
      ref={ref}
      className={cx(
        'notched inline-flex items-center justify-center gap-2.5 font-mono uppercase tracking-[0.18em]',
        'transition-colors duration-300 ease-draft disabled:pointer-events-none disabled:opacity-35',
        sizes[size],
        tones[tone],
        className
      )}
      {...rest}
    >
      {children}
    </As>
  );
});

/** The secondary action. Drawn, not cut: outline only. */
export const DraftButton = forwardRef(function DraftButton(
  { as: As = 'button', className, children, tone = 'ink', size = 'md', ...rest },
  ref
) {
  const sizes = {
    sm: 'h-9 px-4 text-[10px]',
    md: 'h-12 px-7 text-[11px]',
    lg: 'h-14 px-9 text-[12px]',
  };
  const tones = {
    ink: 'border-ink text-ink hover:bg-ink hover:text-paper',
    chalk: 'border-chalk/60 text-chalk hover:bg-chalk hover:text-cloth',
  };
  return (
    <As
      ref={ref}
      className={cx(
        'inline-flex items-center justify-center gap-2.5 border-thin font-mono uppercase tracking-[0.18em]',
        'transition-colors duration-300 ease-draft disabled:pointer-events-none disabled:opacity-35',
        sizes[size],
        tones[tone],
        className
      )}
      {...rest}
    >
      {children}
    </As>
  );
});

/**
 * A ruled input — the line you write a measurement on.
 * Focus thickens the rule to a cut line rather than drawing a second frame
 * around it: one control, one edge, at every state.
 */
export const RuleInput = forwardRef(function RuleInput({ className, tone = 'ink', ...rest }, ref) {
  const tones = {
    ink: 'border-ink/30 text-ink placeholder:text-graphite focus:border-ink bg-transparent',
    chalk: 'border-chalk/35 text-chalk placeholder:text-chalk-dim focus:border-chalk bg-transparent',
  };
  return (
    <input
      ref={ref}
      className={cx(
        'h-12 w-full border-b-thin px-0 font-mono text-[13px] tracking-[0.06em]',
        'outline-none transition-[border-color,border-width] duration-300 ease-draft',
        'focus:border-b-cut focus-visible:outline-none',
        tones[tone],
        className
      )}
      {...rest}
    />
  );
});

/** Quantity, stepped like a cutting count. */
export function CountStepper({ value, onChange, min = 1, max = 99, tone = 'ink' }) {
  const onCloth = tone === 'chalk';
  const btn = cx(
    'flex h-11 w-11 items-center justify-center font-mono text-lg leading-none transition-colors duration-200',
    onCloth ? 'text-chalk hover:bg-chalk hover:text-cloth' : 'text-ink hover:bg-ink hover:text-paper',
    'disabled:opacity-30 disabled:pointer-events-none'
  );
  return (
    <div className={cx('inline-flex items-center border-thin', onCloth ? 'border-chalk/50' : 'border-ink')}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        −
      </button>
      <span className={cx('w-12 text-center font-mono text-[13px] tnum', onCloth ? 'text-chalk' : 'text-ink')} aria-live="polite">
        {String(value).padStart(2, '0')}
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
