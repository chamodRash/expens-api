import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionsByUserId,
  getTransactionSummary,
} from "../controllers/transactionsController.js";

const router = express.Router();

router.post("/", createTransaction);

router.get("/:userId", getTransactionsByUserId);

router.get("/summary/:userId", getTransactionSummary);

router.delete("/:id", deleteTransaction);

export default router;
