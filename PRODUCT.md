# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Indian direct-to-consumer apparel shoppers buying everyday knitwear — oversized and regular tees, joggers, and pyjamas — for themselves, in two segments (men, women). They shop on mobile, pay in INR, and decide on fit, fabric weight, and price against a visible compare-at anchor. A second internal user runs the store through the admin panel: adding and editing products, moving orders through fulfilment, and exporting the newsletter list.

## Product Purpose

FITSTICH sells its own in-house manufactured clothing directly to customers in India. Success is a completed order: the shopper finds a garment, trusts the fit and fabric enough to commit, and pays by Razorpay, Stripe, or cash on delivery.

## Positioning

In-house manufacturing, shipped from India. The catalogue competes on specified fabric rather than brand markup — every product carries an explicit material and weight (e.g. "100% Combed Cotton, 240 GSM"), a named fit, and care instructions. That specificity is the claim a reseller could not truthfully copy.

## Operating Context

- Shoppers browse by gender first, then by one of four categories: oversized tees, regular tees, joggers, pyjamas. Cross-cutting tags `new` and `best-seller` act as additional entry points.
- Cart persists in `localStorage` under `fitstich_cart`; items key on product + size + colour.
- Checkout supports Razorpay, Stripe, and COD. Order confirmation and shipping updates go out over SMTP via nodemailer.
- **Shipping is free at or above ₹1,499 and ₹99 below it.** This is implemented in the checkout total, not a marketing line, and may be stated on the site.
- **Returns are open for 7 days from delivery** on unworn, unwashed pieces with tags attached, per `app/returns/page.js`. Also real, also statable.
- There is **no live pincode serviceability feed**. The delivery check on a product page validates the pincode's format and quotes the standard 3–5 business day dispatch window; it must not claim to have confirmed coverage.
- There is **no prepaid discount** implemented. The `discount` and `couponCode` fields exist on the order record but nothing computes them, so no prepaid or coupon offer may be advertised until one is built.
- Guests can look up an order without an account via order lookup; registered users see order history under their account.
- Auth is NextAuth with credentials and Google providers. Admin is a separate password + token scheme, not NextAuth.

## Capabilities and Constraints

- Next.js 15 App Router, JavaScript (not TypeScript), React 18, Tailwind 3, shadcn/ui primitives, framer-motion. MongoDB accessed directly via the `mongodb` driver — no ORM.
- The entire API is one catch-all route at `app/api/[[...path]]/route.js` plus a few dedicated routes (auth, signup, checkout, email, orders lookup/user, payment verify, upload).
- 3D is delivered with three.js (`three`) driven directly, no React reconciler. @react-three/fiber v8 was tried first and removed: its reconciler throws against this Next 15 / React 18.3 app-router build (`ReactCurrentOwner` of undefined), which left the hero empty on any machine that *could* run WebGL. Upgrading to R3F v9 would have required React 19 and rippled into next-auth v4 and checkout, so the scene is built against three.js directly. It must stay lazy-loaded, must never block first paint, and must never block purchase on a device that cannot run WebGL.
- Product record fields: `gender, id, name, slug, category, price, compareAt, rating, reviewCount, sizes[], colors[{name,hex}], fit, material, fabricCare, description, images[], tags[], stock`.
- Live catalogue is 20 products, ₹684–₹2,499. Sizes XS–XXL. Colour names in use are Black, White, Bone, Stone, Charcoal, Slate, Ivory, Midnight, Grey.
- Uploads are written to `public/uploads` on the local filesystem by `app/api/upload/route.js`.

## Brand Commitments

- Name renders as `FITSTICH` (repo and DB are spelled FITSTICHH/fitstich; the customer-facing wordmark is FITSTICH).
- Black and white is confirmed binding by the user for this redesign.
- Currency is INR, formatted `en-IN`.

## Evidence on Hand

- 20 real product records in MongoDB with genuine copy, materials, and pricing — this is real content, not placeholder.
- **No real product photography exists.** Every image currently points at Pexels stock URLs. One uploaded image is live in `public/uploads/6c4fab01.jpeg`. Confirmed by the user: design must not depend on photography it does not have, and must accept real photography later without a redesign.
- **No logo, brand kit, or typeface has been supplied.** The current wordmark is Inter set in black.
- No testimonials, press, customer counts, or sales figures exist. Future work must not fabricate them. The `rating` and `reviewCount` fields hold seeded values, not collected reviews.

## Product Principles

1. **Fabric is the argument.** Material, weight, and fit are the reasons to buy; surface them wherever a decision is made, not only on the product page.
2. **The purchase never waits on spectacle.** Motion and 3D are atmosphere; add-to-cart, size choice, and checkout stay immediate and reachable without them.
3. **Design for absent photography.** The layout must hold up with imperfect images and improve — not break — when real photography replaces them.
4. **Mobile is the real device.** Indian D2C traffic is phone-first; every decision is judged on a small screen before a large one.
5. **Two audiences, one system.** Men and women are equal entry points, not a default plus an alternate.

## Accessibility & Inclusion

No formal standard was established by the user. The 3D and motion layer must respect `prefers-reduced-motion` and degrade to a static composition, since it is decorative and the store must remain fully shoppable without it.
