import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

import { mongoConnection } from './mongodb';
import { DataSource } from './data-source';

import UserRouter from './modules/users/routes';
import GamesRouter from './modules/games/routes';
import { getUserId } from './utils';

mongoConnection();

const dataSource = new DataSource();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.dataSource = dataSource;

  const token = req.get('authorization');
  if (token) {
    const userId = getUserId(
      token,
      '53fb785304e35f23666a0e467220c87b10780c413a059ddc73135b56e34f191cbf895b8a9199d8e7d13cdf30d28097e3b1d360b069bf34960ccfbc94b9cf1c99'
    );

    if (userId) {
      req.userId = userId;
    }
  }

  next();
});

app.use('/ping', (req, res) => {
  res.send('OK');
});

app.use('/users', UserRouter);
app.use('/games', GamesRouter);

app.listen(5000);
// export const handler = serverless(app);
