const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { initPool } = require('./config/db');

dotenv.config();

async function bootstrap() {
  try {
    await initPool();
  } catch (err) {
    // Log but continue; controllers will surface DB errors per-request
    console.error('DB pool init failed:', err.message);
  }

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // Serve static uploads files
  app.use('/uploads', express.static(path.join(__dirname, '../../demo1/public/uploads')));

  const apiRouter = require('./routes');
  app.use('/api', apiRouter);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5051;
  app.listen(port, () => {
    console.log(`Node API server listening on http://localhost:${port}/api`);
  });
}

bootstrap();