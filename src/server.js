import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed.js';

const PORT = process.env.PORT || 5000;

// Connect to Database & Auto Seed if empty
connectDB().then(() => {
  seedDatabase();
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Video App Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📌 API Endpoint: http://localhost:${PORT}/api/v1`);
  console.log(`=================================================`);
});
