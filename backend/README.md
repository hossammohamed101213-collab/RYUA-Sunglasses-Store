# RYUA backend handoff

The current public build is a static GitHub Pages site. It does not have a connected database yet.

`supabase-schema.sql` is the production schema for products, orders, and order items. Apply it only after selecting the real RYUA Supabase project. The storefront should use a Supabase publishable key; `service_role` must remain inside an Edge Function and must never be placed in `dist` or committed to Git.

Required next connection steps:

1. Create or connect the RYUA Supabase project.
2. Apply `supabase-schema.sql`.
3. Seed the three RYUA sunglasses products.
4. Deploy a validated `create-order` Edge Function with rate limiting/CAPTCHA before accepting public orders.
5. Replace the demo admin unlock with Supabase Auth and authenticated staff policies.
6. Add the project URL and publishable key through deployment secrets/config; never hardcode a service key.

Until these steps are done, WhatsApp remains the real contact channel and browser storage is only a local convenience—not order storage.
