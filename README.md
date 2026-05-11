This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [https://samuderathai.com](https://samuderathai.com) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on cPanel (Out Folder)

This project is configured for static export.

1. Build export files:

```bash
npm run export
```

2. After build, upload everything inside `out/` to your cPanel target directory (for example `public_html/`).
3. Confirm `.htaccess` exists in the uploaded root folder.
4. If your domain serves from a subfolder (example: `public_html/dashboard/`), set `RewriteBase` in `.htaccess` to that subfolder path.

Notes:

- `public/.htaccess` handles clean URLs for exported routes.
- `scripts/copy-htaccess.js` copies `.htaccess` to `out/.htaccess` after build.

