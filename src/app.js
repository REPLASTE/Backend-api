const express = require('express');
const routes = require('./routes/Routes');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.use('/', routes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Terjadi kesalahan internal server'
  });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});