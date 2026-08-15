---
name: FITSTICH
description: A pattern drafting sheet you can buy the garment off — ink on paper, chalk on cloth, no radius but the punched notch.
colors:
  paper: "#ffffff"
  paper-2: "#f4f4f2"
  cloth: "#0b0b0b"
  cloth-2: "#171717"
  ink: "#0b0b0b"
  graphite: "#626262"
  chalk: "#ffffff"
  chalk-dim: "#a6a6a6"
  rule-hair: "#e2e2df"
  rule-thin: "#cfcfcb"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.6rem, 8.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.4rem, 6vw, 4.2rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Spline Sans Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.16em"
    fontFeature: "tnum 1"
  label-lg:
    fontFamily: "Spline Sans Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.14em"
    fontFeature: "tnum 1"
rounded:
  none: "0px"
  notch: "12px"
spacing:
  minor: "8px"
  major: "48px"
  gutter: "20px"
  gutter-lg: "40px"
  section: "64px"
  section-lg: "96px"
  container-max: "1440px"
components:
  button-cut:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.notch}"
    padding: "0 28px"
    height: "48px"
  button-cut-hover:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper}"
  button-cut-chalk:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.cloth}"
    typography: "{typography.label}"
    rounded: "{rounded.notch}"
    padding: "0 28px"
    height: "48px"
  button-draft:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 28px"
    height: "48px"
  button-draft-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  input-rule:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0"
    height: "48px"
  chip-size:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  chip-size-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  card-piece:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0"
  stamp:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
---

# Design System: FITSTICH

## Overview

**Creative North Star: "The Drafting Table"**

The site is the pattern the garment is cut from. FITSTICH manufactures its own knitwear, so the blueprint is the proof of it — the interface is a ruled drafting sheet with pieces laid out on it, not a photo-led storefront with specs hidden in a caption. Every surface behaves like paper on a cutting table: a fixed rule underneath, hairlines drawn on top, marks that a cutter would recognise (grain lines, register notches, dimension lines, leaders, a title block), and every measurement set in mono where a draughtsman would letter it.

There are two grounds and both are earned. **Ink on paper** is the drafting ground and carries the great majority of the site. **Chalk on cloth** is the cutting ground — near-black bands used where the work moves from drawing to cutting: the Blocks section, the cart rail, the footer. This is a two-ground material system, not a light/dark theme; there is no dark mode and no toggle. A cloth band opts in explicitly (`.cloth .on-cloth`) and every component takes a `tone` of `ink` or `chalk` accordingly.

The palette is strictly monochrome, and that is a hard constraint rather than a stylistic lean: with no hue available, hierarchy and state have to be carried by **line form and line weight**. A stocked piece is framed by a solid rule, made-to-order by a dashed one, low stock by a graphite rule plus a 2.5px cut frame, and a sold-out piece by a hairline with its name struck through. The build refuses the D2C default it was drawn against: no full-bleed model hero, no rounded product cards, no colour-coded badges.

**Key Characteristics:**
- Fixed 48px major / 8px minor drafting rule under every ground; it never scales with content
- Zero corner radius anywhere; the punched 12px notch is the only corner the system owns
- Strictly monochrome — ink, graphite, chalk, and two rule greys
- State and rank are line form and cell size, never hue and never bigger type
- Engineering-gothic display (Archivo 800/900, tight negative tracking) against mono annotation (Spline Sans Mono, 10px, 0.16em, uppercase)
- Flat by default: one sanctioned shadow in the whole system
- Photography is a slot in a punched window, monochrome and top-cropped, never the foundation

## Colors

A monochrome drafting palette: black ink and white paper, with a single mid-grey for secondary voice and two near-white greys reserved for drawn rules.

### Primary
- **Ink** (`{colors.ink}`): The drawn mark. All primary text on paper, every solid fill (primary buttons, the ticker bar, the discount stamp), every heavy border and cut line. Doubles as the cloth ground's background value.
- **Chalk** (`{colors.chalk}`): The ink of the cloth ground. All primary text, marks, and solid fills inside a `.cloth` band. Same value as paper, opposite role.

### Neutral
- **Paper** (`{colors.paper}`): The primary ground. Page background, the sheet's base colour, and the text colour inside solid ink fills.
- **Paper Sub** (`{colors.paper-2}`): The stock one shade down. Image-window ground before a photograph loads, scrollbar track, and the ground for quiet ancillary bands.
- **Cloth** (`{colors.cloth}`): The cutting ground. Background of the Blocks band, cart rail, and footer.
- **Cloth Sub** (`{colors.cloth-2}`): The raised panel inside a cloth band.
- **Graphite** (`{colors.graphite}`): The secondary voice on paper — body copy, annotation, inactive nav, low-stock rules, scrollbar thumb. Verified at 6.4:1 on paper.
- **Chalk Dim** (`{colors.chalk-dim}`): Graphite's counterpart on cloth. Verified at 7.3:1 on cloth.
- **Rule Hair** (`{colors.rule-hair}`): The ruling of the sheet itself — the 48px/8px grid lines, drawn and never interactive.
- **Rule Thin** (`{colors.rule-thin}`): The global default border colour, and the frame of a piece that is cut out.

### Named Rules

**The Two Grounds Rule.** Ink-on-paper and chalk-on-cloth are two materials, not two themes. A cloth ground is opted into per section (`.cloth .on-cloth`) and everything inside it — buttons, inputs, rules, marks — switches to its `chalk` tone. Never invert the page, never ship a theme toggle, and never place a paper-toned control on cloth.

**The No Hue Rule.** No colour enters this system. Not for a sale badge, not for an error, not for a stock warning, not for a brand accent. If something must escalate, it escalates by line weight, fill, or frame.

## Typography

**Display Font:** Archivo (with Helvetica Neue, Arial, sans-serif)
**Body Font:** Archivo — the same family, at reading weights
**Label/Mono Font:** Spline Sans Mono (with ui-monospace, monospace)

**Character:** Engineering gothic against a draughtsman's lettering pen. Archivo at 800–900 with tight negative tracking (`-0.035em` to `-0.05em`) and a sub-1 line height gives the display the compressed, stamped quality of a title stencilled on a technical drawing. Spline Sans Mono at 10–13px with wide 0.14–0.18em tracking, uppercase and tabular, is the annotation voice — it never argues with the display, it labels it.

### Hierarchy
- **Display** (800, `clamp(2.6rem, 8.4vw, 6rem)`, 0.88, `-0.035em`, balanced wrap): The hero statement only — one per page, on the sheet.
- **Headline** (900, `clamp(2.4rem, 6vw, 4.2rem)`, 1, `-0.045em`): Large numerals and short marks on the cloth ground; the wordmark (26–30px on desktop, 900, `-0.05em`).
- **Title** (700, 19px / 17px, `-0.025em`): Section subheads and column heads. Product names run one step down (15px, 600, `-0.02em`) and stay there regardless of rank.
- **Body** (400, 15.5–17px, 1.6–1.75, graphite): Reading copy, capped at 68ch (`.measure` / `.doc`).
- **Label** (400, 10px, `0.16em`, uppercase, tabular): The drafting annotation — every spec, category, state, unit, and stamp. 12px / `0.14em` / 500 for section rules and marks that sit on a line.

### Named Rules

**The Everything-Is-A-Measurement Rule.** Every number rendered on this site — price, GSM, chest, length, quantity, order count — is set in Spline Sans Mono with `font-variant-numeric: tabular-nums`. Numbers line up in columns even when they aren't in a table. Counts pad to two digits (`04`, not `4`).

**The Annotation-Points Rule.** Labels annotate; they do not caption. A spec reference belongs in the margin, on a leader line, or inside a title block — the way a real sheet carries it. Never stack a small uppercase label directly above a heading as an eyebrow.

**The Rank-Is-Not-Size Rule.** A promoted product does not get bigger type. Product names are one size everywhere on the site; promotion is expressed in the layout (see Layout).

## Layout

**Container.** A single `1440px` max width, centred, with `20px` gutters that open to `40px` from `lg` up. Sections are separated by their own rhythm rather than by cards: `64px` vertical padding, opening to `80–96px` from `lg` up.

**The sheet.** Every ground is ruled. `.sheet` draws 1px hairlines at a `48px` major pitch; `.sheet-fine` adds an `8px` minor pitch beneath it; `.cloth` draws the same 48px major pitch in 6% white. `.tooth` overlays a fixed 3px repeating grain so paper reads as stock rather than as a filter over the content. All of these are drawn at fixed pixel pitch and are unaffected by container width, zoom of content, or breakpoint.

**Product grid.** 2 columns on mobile, 3 at `sm`, 4 at `lg`, with `20px` column gutters (`32px` at `lg`) and a deliberately larger `48px` row gutter so pieces read as nested on a sheet rather than as a tiled card wall. Rows are equal-height (`auto-rows-fr`) from `sm` up so a promoted cell can span cleanly.

**Rhythm.** Spacing steps come off the sheet's own pitch: `8px` minor, `48px` major, and multiples of them (`20 / 40 / 56 / 64 / 96`). Sections open with a labelled rule (`SheetRule`) and set their content `40px` below it.

### Named Rules

**The Fixed Pitch Rule.** The drafting rule is `48px` major / `8px` minor and never changes. It does not scale with the container, the viewport, the font size, or the section. It is the paper, not a decoration on the paper.

**The Cell-Size Rank Rule.** A promoted piece takes `2 columns × 2 rows` of the grid and nothing else changes — same type sizes, same weights, same frame. Rank is how much of the sheet a piece is given, never a larger heading or a louder colour.

### Judged Exemptions

Two mechanical findings were raised against this build and deliberately kept, with reasoning; they are recorded here so they are not re-flagged and not mistaken for system rules.

- **Grid background on `app/globals.css`.** The generic prohibition on decorative grid backgrounds exempts actual canvas, map, blueprint, and measurement surfaces. A pattern drafting sheet is precisely such a surface — the rule is the product's own metaphor, not texture applied to an unrelated page.
- **`stroke-width` transition in `SizeNest.jsx`.** Flagged as a layout transition by substring match. `stroke-width` is an SVG paint property, not a CSS layout box property; the transition is on the drawn line's weight and animates no layout.

## Elevation & Depth

This system is flat. Depth is not simulated with shadow; it is drawn — by line weight (`1px` hair, `1.5px` thin, `2.5px` cut), by tonal ground changes between paper, paper-sub, and cloth, and by real 3D in the one place where the garment actually leaves the page (the WebGL pattern fold).

There is exactly one shadow in the entire system, and it exists to separate the sticky header from content passing under it once the page has scrolled.

### Shadow Vocabulary
- **Sheet Lift** (`box-shadow: 0 1px 0 0 rgba(11,11,11,0.14), 0 10px 28px -18px rgba(11,11,11,0.3)`): The sticky header only, applied above 24px of scroll, faded in over 500ms. The 1px hairline carries the separation; the diffuse half is barely visible and exists to keep the hairline from reading as a stray rule.

### Named Rules

**The Flat Sheet Rule.** Nothing on this site is lifted off the sheet by shadow. No card shadows, no hover elevation, no drop shadows on type, no hard offset shadows. If an element needs to separate, it gets a rule, a heavier border, or a different ground.

## Shapes

**No radius.** `--radius` is `0px` and every corner in the system is square — buttons, inputs, chips, image windows, panels, toasts, modals. The one exception is the **punched notch**: a `clip-path` octagon that cuts `12px` off all four corners at 45°, exactly as a die-cut register mark on a pattern piece. It is applied through `.notched` and reserved for the primary action, so the button reads as a piece that has been cut out of the sheet rather than as a rounded control.

**Borders carry the hierarchy.** Three weights, no more: `hair` (1px) for the sheet's own ruling and quiet dividers, `thin` (1.5px) for a drawn edge on a real element (buttons, inputs, chips, title blocks, piece frames), and `cut` (2.5px) for a cut line — section boundaries between grounds, the escalated low-stock frame, the focused input's rule.

**The drawn vocabulary.** A fixed set of marks recurs across the site and constitutes its geometry: the grain arrow (double-headed, or single-headed to aim at an action), the register notch triangle, the dimension line with its terminators, the leader line with its dot, the labelled section rule, the margin stamp, and the title block (a two-column definition grid of annotation rows). Each exists on a real drafting table; none is decoration.

## Components

### Buttons
- **Shape:** Square, except the primary, which is punched at all four corners (12px notch).
- **Cut Button (primary):** A cut piece — solid ink fill, paper text, notched corners. Mono, uppercase, `0.18em` tracking. Three sizes: 36px / 48px / 56px tall at 16 / 28 / 36px horizontal padding. On cloth, the fill flips to chalk with cloth text.
- **Draft Button (secondary):** Drawn, not cut — 1.5px ink rule, transparent ground, square corners, same mono label.
- **Hover / Focus:** Colour only, 300ms on the draft easing. Cut fills to graphite; Draft inverts to a solid ink fill. Nothing moves, scales, or lifts. Focus is a global 1.5px ink outline at 3px offset (chalk on cloth).
- **Disabled:** 35% opacity, pointer events off. No greyed-out colour variant exists.

### Chips
- **Size chips:** 44px tall, minimum 56px wide, 1.5px rule at 30% ink, mono 12px at `0.12em`.
- **State:** Selected inverts to a solid ink fill with paper text. Unavailable sizes take a dashed border, 35% opacity, and a struck-through label — the same line-form vocabulary the product grid uses.

### Cards / Containers
- **Corner Style:** Square (0px). No card ever gets a radius.
- **Background:** The page's own ground; a product cell's image window sits on paper-sub.
- **Shadow Strategy:** None — see Elevation & Depth.
- **Border:** A 1.5px frame around the image window whose *style* encodes stock state: solid (stocked), dashed (made to order), graphite solid (low), hairline rule-thin with a struck name (cut out).
- **Internal Padding:** Product cells are borderless below the window; text sits 16px under it with 8px between rows and a hairline divider above the spec row.

### Inputs / Fields
- **Style:** A ruled line, not a box — 48px tall, bottom border only at 1.5px / 30% ink, transparent ground, zero horizontal padding, mono 13px.
- **Focus:** The rule thickens from `thin` to `cut` (1.5px → 2.5px) and goes full ink over 300ms. The default focus outline is suppressed on this control.

### Navigation
- **Ticker:** A solid ink bar above the header scrolling manufacturing facts in 10px mono at 85% opacity, 46s linear loop, halted entirely under reduced motion.
- **Header:** Sticky on paper, 68px tall (76px at `lg`), wordmark centre-left in Archivo 900. Nav links are mono annotation in graphite, going ink on hover and for the active route — no underline, no pill, no highlight bar. The header closes on a **measuring rule**: a 8px strip of 41 tick marks, every fifth full-height, which registers the whole sheet below it.
- **Mobile:** A full-height ruled sheet panel sliding from the left behind a 45% ink scrim, bounded by a 2.5px cut border, with categories listed against their two-letter pattern codes.

### Signature Components

**The Size Nest.** The size selector is drawn as the pattern nest it actually is: one tee block drawn six times, graded outward at 8.8% per step, each size a concentric outline on a single figure. Available sizes are solid, unavailable dashed. Selecting a size promotes its line to 2.8px at full opacity; before selection the middle available size stands as a reference line at 1.9px / 0.8 opacity so the nest still reads. A dashed seam allowance is drawn 7% inside the standing line. Only stroke-width and opacity animate, over 400ms.

**The Punched Window.** Product photography lives in a bordered window with register notches punched top and bottom centre. The drawn block — a dashed tee outline at 40% — is the window's ground and is painted first; the photograph cross-fades over it in 500ms only once it has actually decoded, and a dead or stalled URL (9s) leaves the drawing standing rather than an empty grey rectangle. Photographs are rendered `grayscale contrast-[1.06]` and cropped `object-[50%_22%]` — top-biased, because garment photography puts the piece in the upper-middle and a centre crop of a tall shot lands on flat cloth. Requests go through `sizedSrc()`, which asks the host for a width-limited rendition.

**The Pattern Fold.** The hero is real WebGL (plain three.js driven in an effect — not a React renderer), showing four white pattern pieces with black edge lines on a 14-second cycle: lie flat (18%), fold up (24%, exponential ease-out), be worn (30%), lie back down (20%). The camera pulls in as the pieces gather and back out as they lay flat; pointer position turns the group by at most 0.34rad, damped at 0.045 per frame. The canvas pauses entirely when off-screen, caps device pixel ratio at 1.75, and under `prefers-reduced-motion` renders exactly one settled frame with no loop.

**The Title Block.** A two-column definition grid, 1.5px framed, with hairline rows — key in graphite annotation, value in tabular mono. It carries what a real drawing's title block carries (piece, reference, scale, date) and is the system's canonical way to present a set of specifications.

### Motion

Two easings only: `draft` (`cubic-bezier(0.16, 1, 0.3, 1)`) for anything that settles like a piece dropped on a table, and `snap` (`cubic-bezier(0.32, 0.72, 0, 1)`) for anything that engages. State transitions run 200–300ms; image fades 500ms; the image zoom-on-hover is a slow 1100ms scale to 1.04 inside its window. The single authored entrance, `.draft-in`, wipes a piece in from the left over 900ms with a clip-path inset — a line being drawn. Cut lines crawl their dash at 1.6s linear. A global reduced-motion block collapses every animation and transition to 0.01ms and kills the marquee and the cut-line crawl outright.

## Do's and Don'ts

### Do:
- **Do** rule every new ground with the sheet at fixed 48px major / 8px minor pitch, and paint paper with `.tooth` so it reads as stock.
- **Do** carry state in line form — solid stocked, dashed made-to-order, graphite low, hairline plus strike-through cut out — and escalate by changing the frame (a 2.5px cut border), never by changing colour.
- **Do** set every number in Spline Sans Mono with tabular numerals, and pad counts to two digits.
- **Do** give each surface exactly one ground and switch every component on it to the matching `ink` or `chalk` tone.
- **Do** express rank in the grid as cell span (2×2), keeping type sizes identical across all cells.
- **Do** annotate with the drawn marks the system already owns — grain arrow, notch, dimension line, leader, section rule, title block, margin stamp.
- **Do** paint a drawn fallback block behind every image window and cross-fade the photograph in only after it decodes.
- **Do** treat photography as monochrome, top-cropped (`50% 22%`), width-limited, and framed by a punched window.
- **Do** keep body copy at or under 68ch.

### Don't:
- **Don't** introduce a hue. Not for sale badges, errors, stock states, or brand accent.
- **Don't** round a corner. The only corner in this system is the 12px punched notch on the primary action.
- **Don't** add a shadow. One exists (the scrolled header) and it is the whole vocabulary; separate with a rule instead.
- **Don't** build a dark mode or a theme toggle. Cloth is a material used in specific bands, not an inverted copy of the site.
- **Don't** scale the sheet's grid with content, container, or breakpoint.
- **Don't** stack a small uppercase label above a heading as an eyebrow; annotation points at things from the margin or a leader line.
- **Don't** make a promoted product's heading bigger — promote it with grid span.
- **Don't** draw a second frame on focus. A focused input thickens its existing rule; one control, one edge, at every state.
- **Don't** animate a layout box. Motion here is paint — opacity, colour, stroke weight, transform — never width, height, or position in flow.
- **Don't** put a glyph icon where a drawn mark belongs; the drafting vocabulary is the icon set.
