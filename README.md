# Anycomp Backend API

A production-grade RESTful API backend for the Anycomp Company Registration and Management Platform, built with Node.js, Express.js, TypeScript, and PostgreSQL.

## 🚀 Features

- **RESTful API Architecture** - Clean, well-structured API endpoints
- **TypeORM Integration** - Type-safe database operations with PostgreSQL
- **TypeScript** - Full type safety and modern JavaScript features
- **Request Validation** - Input validation using express-validator
- **Error Handling** - Centralized error handling middleware
- **CORS Configuration** - Secure cross-origin resource sharing
- **Security** - Helmet.js for security headers
- **Logging** - Morgan for HTTP request logging
- **Soft Delete** - Soft delete functionality for data integrity
- **Pagination** - Efficient data pagination support
- **Search & Filtering** - Advanced search and filtering capabilities

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **PostgreSQL** (v14.0 or higher) or **Neon PostgreSQL** (cloud database)
- **TypeScript** (v5.0.0 or higher)

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL (Neon)
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Logging**: Morgan

## 📦 Installation

1. **Clone the repository** (if applicable) or navigate to the backend directory:

```bash
cd backend
```

2. **Install dependencies**:

```bash
npm install
```

3. **Create environment file**:

Create a `.env` file in the root of the backend directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (if using authentication)
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=https://your-frontend-domain.com,https://another-domain.com
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `PORT` | Server port number | No | 5000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `JWT_SECRET` | Secret key for JWT tokens | Optional | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | Optional | 7d |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | Optional | localhost:3000, localhost:3001 |

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

### Production Mode

1. **Build the project**:

```bash
npm run build
```

2. **Start the server**:

```bash
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── data-source.ts          # TypeORM data source configuration
│   ├── controllers/
│   │   └── specialist.controller.ts # Specialist business logic
│   ├── entities/
│   │   ├── Media.entity.ts         # Media entity model
│   │   ├── PlatformFee.entity.ts   # Platform fee entity model
│   │   ├── ServiceOffering.entity.ts # Service offering entity model
│   │   └── Specialist.entity.ts    # Specialist entity model
│   ├── middleware/
│   │   ├── errorHandler.ts         # Error handling middleware
│   │   └── validation.ts           # Request validation middleware
│   ├── routes/
│   │   ├── index.ts                # Main routes file
│   │   └── specialist.routes.ts    # Specialist routes
│   └── server.ts                   # Application entry point
├── .env                            # Environment variables (not in git)
├── .gitignore                      # Git ignore file
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## 🔌 API Endpoints

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-backend-domain.com/api
```

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "success",
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Specialists

#### Get All Specialists

```http
GET /api/specialists
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status - `all`, `draft`, `published` (default: `all`)
- `search` (optional): Search query string

**Example:**
```http
GET /api/specialists?page=1&limit=10&status=published&search=company
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "specialists": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### Get Specialist by ID

```http
GET /api/specialists/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "specialist": {...}
  }
}
```

#### Create Specialist

```http
POST /api/specialists
```

**Request Body:**
```json
{
  "title": "Company Registration Service",
  "description": "Professional company registration service",
  "base_price": 1000.00,
  "platform_fee": 100.00,
  "duration_days": 7,
  "is_draft": true
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "specialist": {...}
  }
}
```

#### Update Specialist

```http
PUT /api/specialists/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "base_price": 1200.00,
  "platform_fee": 120.00,
  "duration_days": 10,
  "is_draft": false
}
```

#### Delete Specialist

```http
DELETE /api/specialists/:id
```

**Response:**
```json
{
  "status": "success",
  "message": "Specialist deleted successfully"
}
```

#### Toggle Publish Status

```http
PATCH /api/specialists/:id/publish
```

**Request Body:**
```json
{
  "is_draft": false
}
```

## 🗄️ Database Schema

### Specialists Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | VARCHAR(255) | Specialist service title |
| `slug` | VARCHAR(255) | URL-friendly identifier |
| `description` | TEXT | Service description |
| `base_price` | DECIMAL(10,2) | Base price |
| `platform_fee` | DECIMAL(10,2) | Platform fee |
| `final_price` | DECIMAL(10,2) | Final calculated price |
| `verification_status` | ENUM | pending, approved, under_review, rejected |
| `is_verified` | BOOLEAN | Verification status |
| `duration_days` | INT | Service duration in days |
| `average_rating` | DECIMAL(3,2) | Average rating |
| `total_number_of_ratings` | INT | Total number of ratings |
| `is_draft` | BOOLEAN | Draft status |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `deleted_at` | TIMESTAMP | Soft delete timestamp |

### Related Tables

- **service_offerings**: Additional service offerings
- **media**: Images and documents
- **platform_fee**: Platform fee tiers

## 🔒 Security Features

- **Helmet.js**: Sets various HTTP headers for security
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Request body validation using express-validator
- **SQL Injection Protection**: TypeORM parameterized queries
- **Error Handling**: Secure error messages (no sensitive data exposure)

## 🧪 Development

### TypeScript Compilation

```bash
npm run build
```

### Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting (if configured)
- **Prettier**: Code formatting (if configured)

## 🚢 Deployment

### Environment Setup

1. Set `NODE_ENV=production` in your production environment
2. Configure production database URL
3. Set secure `JWT_SECRET`
4. Configure `CORS_ORIGINS` with production frontend URLs

### Recommended Platforms

- **Vercel**: Serverless deployment
- **Railway**: Full-stack deployment
- **Heroku**: Traditional hosting
- **AWS/GCP/Azure**: Cloud infrastructure

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check SSL mode requirements (Neon requires `sslmode=require`)
- Ensure database is accessible from your network

### CORS Errors

- Add your frontend URL to `CORS_ORIGINS` environment variable
- Check that credentials are properly configured

### Port Already in Use

- Change `PORT` in `.env` file
- Or kill the process using the port: `lsof -ti:5000 | xargs kill`

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for ST Comp Holdings**
