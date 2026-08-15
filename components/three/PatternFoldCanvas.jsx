'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ---------------------------------------------------------------------------
   The fold: four flat pattern pieces lift off the drafting sheet, assemble into
   a garment, hold, and settle back down flat. This is what cut-and-sew is.

   Driven straight against three.js — no reconciler — so it stays independent of
   the React version and ships without the fiber/drei runtime.
   --------------------------------------------------------------------------- */

const EXTRUDE = { depth: 0.035, bevelEnabled: false, curveSegments: 24 };

function bodyShape() {
  const s = new THREE.Shape();
  s.moveTo(-1.1, -1.42);
  s.lineTo(-1.1, 0.5);
  s.lineTo(-1.36, 0.96);
  s.lineTo(-0.44, 1.34);
  s.quadraticCurveTo(0, 1.04, 0.44, 1.34);
  s.lineTo(1.36, 0.96);
  s.lineTo(1.1, 0.5);
  s.lineTo(1.1, -1.42);
  s.closePath();
  return s;
}

function sleeveShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.64, -0.78);
  s.lineTo(0.64, -0.78);
  s.lineTo(0.44, 0.5);
  s.quadraticCurveTo(0, 0.78, -0.44, 0.5);
  s.closePath();
  return s;
}

const lerp = (a, b, t) => a + (b - a) * t;
// exponential ease-out — a piece dropped onto the table, settling
const ease = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -9 * x));

export default function PatternFoldCanvas({ reduced = false }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // caller keeps the drawn fallback
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearAlpha(0);
    host.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      touchAction: 'pan-y',
    });

    // Bright enough that cloth stays white; directional only to model the fold.
    scene.add(new THREE.AmbientLight(0xffffff, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(3.5, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-4, 1.5, 2);
    scene.add(fill);

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape(), EXTRUDE);
    const sleeveGeo = new THREE.ExtrudeGeometry(sleeveShape(), EXTRUDE);
    bodyGeo.center();
    sleeveGeo.center();
    const bodyEdges = new THREE.EdgesGeometry(bodyGeo, 25);
    const sleeveEdges = new THREE.EdgesGeometry(sleeveGeo, 25);

    const faceMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.86,
      metalness: 0,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0b0b0b });
    // A drawn cut line, thick enough to read at any size: a black shell sitting
    // just behind each piece, which WebGL's 1px line width cannot give us.
    const cutMat = new THREE.MeshBasicMaterial({ color: 0x0b0b0b, side: THREE.BackSide });

    // flat = laid out as a cutting marker; folded = the garment
    const layout = [
      { geo: bodyGeo, edg: bodyEdges, flat: { p: [-1.55, 0.12, 0], r: [0, 0, 0] }, folded: { p: [0, 0, 0.3], r: [0, 0, 0] } },
      { geo: bodyGeo, edg: bodyEdges, flat: { p: [1.55, 0.12, 0], r: [0, 0, 0] }, folded: { p: [0, 0, -0.3], r: [0, 0, 0] } },
      { geo: sleeveGeo, edg: sleeveEdges, flat: { p: [-3.35, -0.5, 0], r: [0, 0, 0] }, folded: { p: [-1.42, 0.52, 0], r: [0, 0.55, 1.24] } },
      { geo: sleeveGeo, edg: sleeveEdges, flat: { p: [3.35, -0.5, 0], r: [0, 0, 0] }, folded: { p: [1.42, 0.52, 0], r: [0, -0.55, -1.24] } },
    ];

    const root = new THREE.Group();
    root.position.y = 0.05;
    scene.add(root);

    const pieces = layout.map((l) => {
      const g = new THREE.Group();
      const outline = new THREE.Mesh(l.geo, cutMat);
      outline.scale.set(1.028, 1.028, 1.0);
      g.add(outline);
      g.add(new THREE.Mesh(l.geo, faceMat));
      g.add(new THREE.LineSegments(l.edg, lineMat));
      root.add(g);
      return { g, ...l };
    });

    /* The flat marker is far wider than the assembled garment, so one fixed
       camera distance either crops the spread or shrinks the tee. Solve the
       distance for each state and travel between them with the fold. */
    const TAN_HALF_FOV = Math.tan((40 / 2) * (Math.PI / 180));
    const FLAT_EXTENT = { w: 4.35, h: 1.85 };
    const FOLDED_EXTENT = { w: 2.5, h: 1.85 };

    let aspect = 1;
    const fitZ = (ext) => Math.max(ext.w / (TAN_HALF_FOV * aspect), ext.h / TAN_HALF_FOV);

    function resize() {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const pointer = { x: 0, y: 0 };
    const onPointer = (e) => {
      const r = host.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    // Only run while the sheet is actually on screen.
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(host);

    const clock = new THREE.Clock();
    let raf = 0;
    let progress = reduced ? 1 : 0;

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      const t0 = clock.getElapsedTime();

      if (!reduced) {
        // 14s cycle: lie flat, fold up, be worn, lie back down
        const c = (t0 % 14) / 14;
        if (c < 0.18) progress = 0;
        else if (c < 0.42) progress = ease((c - 0.18) / 0.24);
        else if (c < 0.72) progress = 1;
        else if (c < 0.92) progress = 1 - ease((c - 0.72) / 0.2);
        else progress = 0;
      }

      for (const pc of pieces) {
        pc.g.position.set(
          lerp(pc.flat.p[0], pc.folded.p[0], progress),
          lerp(pc.flat.p[1], pc.folded.p[1], progress),
          lerp(pc.flat.p[2], pc.folded.p[2], progress)
        );
        pc.g.rotation.set(
          lerp(pc.flat.r[0], pc.folded.r[0], progress),
          lerp(pc.flat.r[1], pc.folded.r[1], progress),
          lerp(pc.flat.r[2], pc.folded.r[2], progress)
        );
      }

      // Come in as the pieces gather, pull back as they lay out flat.
      camera.position.z = lerp(fitZ(FLAT_EXTENT), fitZ(FOLDED_EXTENT), progress);

      // The sheet only turns to show depth once the garment exists.
      const targetY = pointer.x * 0.34 + progress * 0.28;
      const targetX = -pointer.y * 0.2 + progress * 0.06;
      root.rotation.y += (targetY - root.rotation.y) * 0.045;
      root.rotation.x += (targetX - root.rotation.x) * 0.045;

      renderer.render(scene, camera);
    }

    frame();
    if (reduced) {
      cancelAnimationFrame(raf);
      // one settled frame, no loop
      for (const pc of pieces) {
        pc.g.position.set(...pc.folded.p);
        pc.g.rotation.set(...pc.folded.r);
      }
      root.rotation.set(0.06, 0.28, 0);
      camera.position.z = fitZ(FOLDED_EXTENT);
      renderer.render(scene, camera);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      bodyGeo.dispose();
      sleeveGeo.dispose();
      bodyEdges.dispose();
      sleeveEdges.dispose();
      faceMat.dispose();
      lineMat.dispose();
      cutMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [reduced]);

  return <div ref={hostRef} className="h-full w-full" />;
}
