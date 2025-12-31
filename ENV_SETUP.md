# Environment Setup Guide

## Neon Database Configuration

আপনার Neon database connection string ব্যবহার করার জন্য:

### Method 1: Connection String (সরলতম)

`backend/.env` ফাইলে এইভাবে রাখুন:

```env
DATABASE_URL=postgresql://neondb_owner:npg_FRkwUc34IYgP@ep-plain-hall-a4xrqk5t-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### Method 2: Individual Parameters

যদি আলাদা আলাদা parameter ব্যবহার করতে চান:

```env
DB_HOST=ep-plain-hall-a4xrqk5t-pooler.us-east-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_FRkwUc34IYgP
DB_NAME=neondb

PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

## Steps:

1. `backend` folder এ যান:
   ```bash
   cd backend
   ```

2. `.env` file তৈরি করুন (যদি না থাকে):
   ```bash
   # Windows
   type nul > .env
   
   # Mac/Linux
   touch .env
   ```

3. `.env` file এ উপরের connection string টি paste করুন

4. Server start করুন:
   ```bash
   npm install
   npm run dev
   ```

## Important Notes:

- ✅ Connection string এ password সহ সব কিছু আছে
- ✅ SSL mode automatically handle হবে
- ✅ `.env` file কখনো Git এ commit করবেন না
- ✅ Production এ strong JWT_SECRET ব্যবহার করুন

## Troubleshooting:

যদি connection error আসে:
1. Connection string টি double-check করুন
2. Neon dashboard এ database active আছে কিনা দেখুন
3. Password এ special characters escape করা আছে কিনা দেখুন

