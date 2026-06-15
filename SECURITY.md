# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in FrameFinder, please report it by email rather than opening a public issue.

**Contact**: Replace with your email before publishing.

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact

You can expect an acknowledgment within 72 hours.

## Security notes for contributors

- The Supabase **service role key** must never appear in client-side code or `NEXT_PUBLIC_*` variables. It is imported only in server files that begin with `import "server-only"`.
- The Stripe **secret key** is similarly server-only.
- Clerk's `auth()` function must only be called from server components or API routes — never from `"use client"` files.
- Webhook endpoints verify the Stripe signature before processing any event payload.
- Never commit `.env.local` or any file containing real API keys. The `.gitignore` excludes all `.env*` files except `.env.example`.
