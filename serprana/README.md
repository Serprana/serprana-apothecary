# 🌿 Serprana Apothecary — Setup Guide

Welcome! This is your complete apothecary web app. Follow these steps to get it live.

---

## What You'll Need (All Free)

1. **GitHub** — stores your code (github.com)
2. **Vercel** — hosts your website (vercel.com) — sign up with GitHub
3. **Neon** — your database (neon.tech) — free tier is plenty

---

## Step 1 — Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project called `serprana`
3. Copy the **Connection String** — it looks like:
   `postgresql://kate:password123@ep-xxx.us-east-2.aws.neon.tech/serprana?sslmode=require`
4. Save this — you'll need it in Step 3

---

## Step 2 — Upload to GitHub

1. Go to [github.com](https://github.com) and create a free account
2. Create a new repository called `serprana-apothecary`
3. Upload all these files to the repository

---

## Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click "Add New Project" and select your `serprana-apothecary` repo
3. In the **Environment Variables** section, add:
   - Name: `DATABASE_URL`
   - Value: (paste your Neon connection string from Step 1)
4. Click **Deploy** — Vercel will build your app!

---

## Step 4 — Seed the Database

After your first deploy, go to your Vercel project settings and run:

```
npx prisma db push
npm run db:seed
```

Or do this locally:
1. Create a `.env` file (copy from `.env.example`)
2. Paste your `DATABASE_URL` into it
3. Run: `npm install`
4. Run: `npx prisma db push`
5. Run: `npm run db:seed`

---

## Step 5 — Add Your Logo Files

Place your logo files at:
- `/public/images/logo-black.png` — black logo on transparent background
- `/public/images/logo-white.png` — white icon on transparent background

Both should be centered on their transparent backgrounds.

---

## Admin Dashboard

Access at: `yoursite.com/admin/dashboard`

Password: **Serprana1111!**

From the admin dashboard you can:
- View all orders and revenue (daily/weekly/monthly/all-time)
- See your 75% owner share vs 25% Casa Venao store share
- Edit herb prices and inventory levels
- Add new herbs
- Remove herbs from the store

---

## Your Color Palette

| Color | Hex | Used for |
|-------|-----|----------|
| Terracotta | #B85C38 | CTAs, accents, price labels |
| Dusty Blue | #8BAAB8 | Secondary elements |
| Deep Teal | #3D7A8A | Primary buttons, links, headers |
| Sage Mist | #8FAF8F | Tags, badges, soft accents |
| Forest Green | #5A7A5A | Navigation, footer, headings |
| Cream | #FAF5EB | Background throughout |

---

## Business Rules Built In

- ✅ Custom tea = **$15 flat rate**
- ✅ 1 scoop = 1 tablespoon = 0.01 oz deducted from inventory
- ✅ Max 7 herbs per custom tea
- ✅ Bulk herbs = priced by oz, minimum 0.5 oz
- ✅ Revenue split tracked automatically: **75% you / 25% store**
- ✅ Inventory auto-deducted on every order
- ✅ No payment taken online — all pay at counter
- ✅ On-screen receipt for every order

---

## Contact

serpranahealing@gmail.com | serprana.com

---

*Built with love for Serprana Apothecary 🌿*
