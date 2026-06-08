# Supplier Portal

Trade supplier portal for Focuspilot — manage catalog products and track incoming orders from design studios.

## Supplier onboarding

1. Visit `/register` to submit a trade supplier application
2. Sign in at `/login` while verification is pending — you can build your catalog immediately
3. In Django admin, use **Approve selected suppliers and send verification email** on `Supplier Accounts`
4. Once verified, published products appear in the studio catalog browse experience

## Order notifications

When a studio adds your catalog product to a project, Focuspilot emails the supplier contact with order details and a link to the supplier portal orders page.

## Local dev

```bash
# From repo root
pnpm install

# Create a demo supplier account (Django)
cd server && .venv/bin/python manage.py create_supplier_account

# Start API + supplier portal
pnpm -C suppliers_portal dev
```

Open [http://localhost:3003](http://localhost:3003)

Default credentials (after running `create_supplier_account`):

- Email: `supplier@test.com`
- Password: `supplier123`

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env` (see `.env.example`).
