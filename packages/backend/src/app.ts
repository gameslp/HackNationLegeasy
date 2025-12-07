import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { securityHeaders } from './middleware/securityHeaders';

const app = express();

// Security headers (KRI compliance)
app.use(securityHeaders);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files for uploads (including diff images)
app.use('/uploads', express.static(path.join(process.cwd(), '..', '..', 'uploads')));

app.use('/api', routes);

app.use(errorHandler);

export default app;
