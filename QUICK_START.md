# Quick Start - Neon Database Setup

## আপনার Neon Database Connection String ব্যবহার করুন:

### Step 1: `.env` file তৈরি করুন

`backend` folder এ `.env` file তৈরি করুন এবং নিচের content টি paste করুন:

```env
DATABASE_URL=postgresql://neondb_owner:npg_FRkwUc34IYgP@ep-plain-hall-a4xrqk5t-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

PORT=5000
NODE_ENV=development

JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRES_IN=7d
```

### Step 2: Dependencies install করুন

```bash
cd backend
npm install
```

### Step 3: Server start করুন

```bash
npm run dev
```

আপনি দেখবেন:
```
✅ Database connected successfully
🚀 Server is running on http://localhost:5000
```

## Important:

- ✅ Connection string এ সব কিছু (username, password, host, database) আছে
- ✅ SSL automatically handle হবে
- ✅ `.env` file Git এ commit করবেন না (already in .gitignore)

## যদি Error আসে:

1. Connection string টি copy-paste করে আবার check করুন
2. Neon dashboard এ database active আছে কিনা verify করুন
3. Internet connection check করুন

