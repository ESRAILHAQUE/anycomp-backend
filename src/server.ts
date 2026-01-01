import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { AppDataSource } from './config/data-source';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const getAllowedOrigins = (): string[] => {
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://anycomp.netlify.app',
  ];
  
  // Allow additional origins from environment variable
  const envOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [];
  
  return [...defaultOrigins, ...envOrigins];
};

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = getAllowedOrigins();
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (only in development, not in serverless environments)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const path = require('path');
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Anycomp Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      specialists: '/api/specialists',
    },
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database connection (for both local and Vercel)
const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully');
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    // Don't exit in serverless - let Vercel handle it
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      process.exit(1);
    }
  }
};

// Initialize database on startup (for local development)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  initializeDatabase();

  // Start server (only for local development)
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Handle graceful shutdown (only for local)
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connection...');
    await AppDataSource.destroy();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database connection...');
    await AppDataSource.destroy();
    process.exit(0);
  });
} else {
  // For Vercel, initialize database on first request
  initializeDatabase();
}

// Export app for Vercel serverless functions
export default app;

