import { sql } from "../config/db.js";

export async function createTransaction(req, res) {
  try {
    const { user_id, title, amount, category } = req.body;

    if (!user_id || !title || amount === undefined || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction = await sql`
            INSERT INTO transactions (user_id, title, amount, category)
            VALUES (${user_id}, ${title}, ${amount}, ${category})
            RETURNING *
        `;

    res.status(201).json(transaction[0]);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;

    const transactions = await sql`
                SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
            `;

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for this user" });
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTransactionSummary(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const summary = await sql`
            SELECT category, COALESCE(SUM(amount), 0) AS balance, COUNT(*) AS count
            FROM transactions
            WHERE user_id = ${userId}
            GROUP BY category
            ORDER BY balance, count DESC
        `;

    if (summary.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for this user" });
    }

    res.status(200).json({
      balance: summary.reduce((acc, curr) => acc + parseFloat(curr.balance), 0),
      income: summary[1].balance || 0,
      expenses: summary[0].balance || 0,
    });
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const result = await sql`
            DELETE FROM transactions WHERE id = ${id} RETURNING *
        `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
