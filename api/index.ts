// Vercel serverless function handler
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppDataSource } from '../src/config/data-source';
import routes from '../src/routes';
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler';

const app = express();

// CORS configuration
const getAllowedOrigins = (): string[] => {
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://anycomp.netlify.app',
  ];
  
  const envOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [];
  
  return [...defaultOrigins, ...envOrigins];
};

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
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

// Initialize database connection
let dbInitialized = false;
const initializeDatabase = async () => {
  if (dbInitialized) return;
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully');
      dbInitialized = true;
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  }
};

// Export Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize database on first request
  await initializeDatabase();
  
  // Handle the request with Express app
  return app(req, res);
}

