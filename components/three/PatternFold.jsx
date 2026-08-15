'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useState } from 'react';

const Canvas3D = dynamic(() => import('./PatternFoldCanvas'), {
  ssr: false,
  loading: () => null,
});

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

/** If the fold ever throws, the drawing it lifts off is still on the table. */
class FoldBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    if (process.env.NODE_ENV !== 'production') console.error('[PatternFold]', err);
  }
  render() {
    return this.state.failed ? <FlatDrawing /> : this.props.children;
  }
}

/**
 * The fold, mounted only when it can actually run and only once it is on screen.
 * Nothing about the purchase depends on it — the sheet beneath is the real page.
 */
export default function PatternFold({ className }) {
  const [state, setState] = useState({ mount: false, reduced: false });

  useEffect(() => {
    if (!hasWebGL()) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    const handle = idle(() => setState({ mount: true, reduced: mq.matches }));
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle);
    };
  }, []);

  return (
    <div className={className} aria-hidden="true">
      {state.mount ? (
        <FoldBoundary>
          <Canvas3D reduced={state.reduced} />
        </FoldBoundary>
      ) : (
        <FlatDrawing />
      )}
    </div>
  );
}

/** The pieces as drawn, before they are lifted. Ships to anything without WebGL. */
function FlatDrawing() {
  return (
    <svg viewBox="0 0 520 320" className="h-full w-full" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <g stroke="#0b0b0b" strokeWidth="1.5" fill="#ffffff">
        <path d="M186 286 L186 130 L165 92 L240 62 L260 76 L280 62 L355 92 L334 130 L334 286 Z" />
        <path d="M42 250 L104 250 L92 150 L60 138 Z" />
        <path d="M416 250 L478 250 L466 138 L434 150 Z" />
      </g>
      <g stroke="#0b0b0b" strokeWidth="1" strokeDasharray="5 5" opacity="0.45" fill="none">
        <path d="M240 62 Q260 88 280 62" />
      </g>
    </svg>
  );
}
