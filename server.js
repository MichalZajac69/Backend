const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
const { authenticateJWT } = require('./middleware/auth');
const sequelize = require('./db');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.LOG_LEVEL || 'dev'));

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');

sequelize.sync({ force: false }).then(() => {
  console.log('Baza danych zsynchronizowana');
}).catch(err => {
  console.error('Błąd podczas synchronizacji bazy danych:', err);
});

app.use('/api/auth', authRoutes);
app.use('/api', authenticateJWT);
app.use('/api/products', productRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  res.status(404).json({ message: 'Nie znaleziono takiej trasy!' });
});

app.use((err, req, res, next) => {
  console.error('Błąd serwera:', err.stack);
  res.status(500).json({ message: 'Wystąpił błąd serwera' });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
  console.log(`Dokumentacja API: http://localhost:${PORT}/api-docs`);
});
