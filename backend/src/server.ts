import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'pump-monitoring' }));
app.use('/api', routes);

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));
