const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createApp = require('./app');
const connectDB = require('./config/db');
const { startDeadlineReminders } = require('./services/notificationService');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const app = createApp();
    startDeadlineReminders();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
