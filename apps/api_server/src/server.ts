import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';

import authRoutes from './routes/auth';
import streamRoutes from './routes/streams';
import videoRoutes from './routes/videos';

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/streams', streamRoutes);
app.use('/videos', videoRoutes);

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
