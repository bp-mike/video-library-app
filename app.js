const express = require('express');
const cors = require('cors');
const createError = require('http-errors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.get('/', async (req, res, next) => {
  res.send({ message: 'Awesome 🐻' });
});

app.use('/users', require('./v1/routes/users.route'));
app.use('/login', require('./v1/routes/auth.route'))
app.use('/movies', require('./v1/routes/movies.route'))

app.use((req, res, next) => {
  // const error = new Error('Not Found')
  // error.status = 404
  // next(error)
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
