import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminDir = path.resolve(__dirname, '../../admin/dist');

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:4000'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

if (fs.existsSync(adminDir)) {
  app.use('/admin', express.static(adminDir));
  app.use('/admin', (_req, res) => {
    res.sendFile(path.join(adminDir, 'index.html'));
  });
  app.get('/', (_req, res) => {
    res.redirect('/admin/');
  });
}

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Archura Blog API running on http://localhost:${port}`);
  if (fs.existsSync(adminDir)) {
    console.log(`Admin panel at http://localhost:${port}/admin/`);
  }
});
