import { configDotenv } from "dotenv";
import express from "express";
import { connectToDatabase, sql } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";

configDotenv();

const app = express();
const port = process.env.PORT || 5001;

// Middleware to parse JSON bodies
app.use(rateLimiter);
app.use(express.json());

app.use("/api/transactions", transactionsRoute);

app.use("/", (req, res) => {
  res.send("Welcome to the Balans | Expense Tracker API");
});

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
