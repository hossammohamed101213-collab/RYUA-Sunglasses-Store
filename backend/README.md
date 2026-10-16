# RYUA backend handoff

The public build is intentionally standalone for now. A separate Supabase sandbox was prepared for the final handoff phase, but the storefront does not depend on it yet.

`supabase-schema.sql` is the production schema for products, orders, and order items. Apply it only after selecting the real RYUA Supabase project. The storefront should use a Supabase publishable key; `service_role` must remain inside an Edge Function and must never be placed in `dist` or committed to Git.

Implemented:

- Products, orders, and order items tables with RLS.
- Three active RYUA sunglasses seeded in `products`.
- Protected `create-order` Edge Function with JWT verification.
- The future storefront order form is staged in `frontend-order-form.pending.js` and is not loaded by the current standalone build.

Final handoff phase, after the site is sold:

1. Create a new Supabase project under the buyer's account and apply the schema.
2. Enable Anonymous Sign-Ins or use the buyer's chosen checkout/auth flow; add CAPTCHA/rate limiting.
3. Deploy the pending order function against the buyer's project and test a real order.
4. Replace the demo admin unlock with Supabase Auth and authenticated staff policies.

The publishable key is safe for the browser. The service key is server-side only and is not committed.

Until these steps are done, WhatsApp remains the real contact channel and browser storage is only a local convenience—not order storage.
