// src/index.ts
import express from 'express';
import { Request, Response } from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('KMIS Backend is Running');
});

app.listen(PORT, () => {
  console.log(`🚀 TypeScript Server ready on Port ${PORT}`);
});