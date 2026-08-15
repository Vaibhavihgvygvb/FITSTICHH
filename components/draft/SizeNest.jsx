'use client';

import { ALL_SIZES, GRADE_TABLE, cx } from '@/lib/draft';

/** One tee block, drawn once and graded outward by scale — a real nest. */
const TEE =
  'M30 18 L42 18 C45 24 55 24 58 18 L70 18 L92 34 L82 48 L74 42 L74 112 L26 112 L26 42 L18 48 L8 34 Z';

/**
 * The size selector as the pattern nest it actually is: every size drawn as a
 * concentric graded outline on one block. Picking a size promotes its line.
 */
export default function SizeNest({ available = [], value, onChange, tone = 'ink', id = 'nest' }) {
  const onCloth = tone === 'chalk';
  const stroke = onCloth ? '#ffffff' : '#0b0b0b';
  const activeIdx = ALL_SIZES.indexOf(value);

  /* Before a size is picked the nest still has to read as a nest: the middle
     available block stands as the reference line, drawn but not asserted. */
  const referenceIdx =
    activeIdx >= 0
      ? activeIdx
      : (() => {
          const availIdx = ALL_SIZES.map((s, i) => (available.includes(s) ? i : -1)).filter((i) => i >= 0);
          return availIdx.length ? availIdx[Math.floor((availIdx.length - 1) / 2)] : -1;
        })();
  const shown = referenceIdx >= 0;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
      <svg
        viewBox="0 0 150 172"
        className="h-[168px] w-[147px] shrink-0 overflow-visible"
        aria-hidden="true"
      >
        <g transform="translate(25 26)">
          {ALL_SIZES.map((s, i) => {
            const k = 1 + (i - 2.5) * 0.088;
            const isActive = s === value;
            const isAvail = available.includes(s);
            const isReference = activeIdx < 0 && i === referenceIdx;
            return (
              <path
                key={s}
                d={TEE}
                transform={`translate(50 65) scale(${k}) translate(-50 -65)`}
                fill="none"
                stroke={stroke}
                strokeWidth={isActive ? 2.8 : isReference ? 1.9 : 1.15}
                strokeDasharray={isAvail ? undefined : '3 4'}
                opacity={isActive ? 1 : isReference ? 0.8 : isAvail ? 0.58 : 0.2}
                style={{ transition: 'stroke-width 400ms cubic-bezier(0.16,1,0.3,1), opacity 400ms' }}
              />
            );
          })}

          {/* Seam allowance, offset inside the standing line — as every piece carries. */}
          {shown && (
            <path
              d={TEE}
              transform={`translate(50 65) scale(${(1 + (referenceIdx - 2.5) * 0.088) * 0.93}) translate(-50 -65)`}
              fill="none"
              stroke={stroke}
              strokeWidth="0.9"
              strokeDasharray="3.5 4.5"
              opacity={activeIdx >= 0 ? 0.62 : 0.34}
              style={{ transition: 'opacity 400ms' }}
            />
          )}

          {shown && (
            <text
              x="50"
              y="70"
              textAnchor="middle"
              fill={stroke}
              className="font-mono"
              opacity={activeIdx >= 0 ? 1 : 0.4}
              style={{ fontSize: 16, letterSpacing: '0.12em', fontWeight: 500, transition: 'opacity 400ms' }}
            >
              {ALL_SIZES[referenceIdx]}
            </text>
          )}
        </g>
      </svg>

      <div className="flex-1">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
          {ALL_SIZES.map((s) => {
            const avail = available.includes(s);
            const active = s === value;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={!avail}
                onClick={() => onChange(s)}
                className={cx(
                  'h-11 min-w-[56px] border-thin px-3 font-mono text-[12px] tracking-[0.12em]',
                  'transition-colors duration-250 ease-draft',
                  !avail && 'cursor-not-allowed border-dashed opacity-35 line-through',
                  active
                    ? onCloth
                      ? 'border-chalk bg-chalk text-cloth'
                      : 'border-ink bg-ink text-paper'
                    : onCloth
                      ? 'border-chalk/35 text-chalk hover:border-chalk'
                      : 'border-ink/30 text-ink hover:border-ink'
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        <p className={cx('annot mt-4', onCloth ? 'text-chalk-dim' : 'text-graphite')}>
          {value && GRADE_TABLE[value]
            ? `Chest ${GRADE_TABLE[value].chest}in · Length ${GRADE_TABLE[value].length}in`
            : 'Pick a size to read its block'}
        </p>
      </div>
    </div>
  );
}
