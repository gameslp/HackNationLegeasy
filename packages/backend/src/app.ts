import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files for uploads (including diff images)
app.use('/uploads', express.static(path.join(process.cwd(), '..', '..', 'uploads')));

app.use('/api', routes);

app.use(errorHandler);

export default app;
