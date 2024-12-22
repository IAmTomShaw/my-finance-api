import express from 'express';
import dotenv from 'dotenv';
import { connectToDatabase } from './lib/dbConnection.ts';
const transactionsRouter = await import('./routes/transactions.ts')
import bodyParser from 'body-parser';
import cors from 'cors';
import { ajMiddleware } from './middleware/arcjet.ts';

async function start() {

  // Load environment variables

  dotenv.config({
    path: "./.env",
  });

  // Connect to Database

  await connectToDatabase();

  // Create a new express application

  const app = express();

  app.use(bodyParser.json({
    limit: "10kb"
  }));

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN as string,
      credentials: true
    })
  )

  // Routes

  app.use('/transactions', ajMiddleware, transactionsRouter.default);

  app.listen(process.env.HTTP_PORT, () => {
    console.log('Server is running on port ' + process.env.HTTP_PORT);
  });
}

start();