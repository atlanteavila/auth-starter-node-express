import express from 'express';
// import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import dbManager from './database/index.js';

dotenv.config()

const app = express();

var corsOptions = {
  origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept",
    "x-access-refreshToken, Origin, Content-Type, Accept",
  );
  next();
});

dbManager.initDb().then((dbs) => {
  app.get('/', (req, res) => {
    res.json({ message: `API is up and running!` });
  });

  authRoutes.authRoutes(app, dbs);
  userRoutes.userRoutes(app, dbs);

}).catch(console.dir);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
