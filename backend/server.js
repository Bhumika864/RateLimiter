require('dotenv').config();
const connectDB = require('./config/db');
const { startLogWorker } = require('./services/logQueue.service');
const app = require('./app');

// Initialize database and services
connectDB();
startLogWorker();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS allowed for: All localhost origins & ${process.env.FRONTEND_URL || 'None (production)'}`);
});
