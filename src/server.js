import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 8001;

// let isConnected = false;

// async function connectToDB() {
//   try {
//     await connectDB();
//     isConnected = true;
//     console.log('Connected to MongoDB');
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//   }
// }

// // add middleware
// app.use((req, res, next) => {
//   if (!isConnected) {
//     connectToDB();
//   }
//   next();
// });

const startServer = async () => {
  await connectDB();

  // app.listen(PORT, () => {
  //   console.log(`Server running on http://localhost:${PORT}`);
  // });
};

startServer();
