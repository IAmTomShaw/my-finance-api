import express, { Request, Response } from 'express';
import { httpResponse } from '../lib/httpResponse.ts';
import User from '../models/user.ts'
import Transaction from '../models/transaction.ts';

const router = express.Router();

router.get('/', async(req: Request & {
  // Query Params
  query: {
    page: number | null;
    user: string | null;
    dateFrom: Date | null;
    dateTo: Date | null;
    totalFrom: number | null;
    totalTo: number | null;
  }
}, res: Response) => {
  try {
	  
	  let { page = 1, user = null, dateFrom = null, dateTo = null, totalFrom = null, totalTo = null } = req.query;

    let query: {
      user?: string;
      date?: {
        $gte?: Date;
        $lte?: Date;
      };
      total?: {
        $gte?: number;
        $lte?: number;
      }
    } = {};

    if (user) {
      query.user = user;
    }

    if (dateFrom || dateTo) {
      query.date = {};

      if (dateFrom) {
        query.date.$gte = dateFrom;
      }

      if (dateTo) {
        query.date.$lte = dateTo;
      }
    }

    if (totalFrom || totalTo) {
      query.total = {};

      if (totalFrom) {
        query.total.$gte = Number(totalFrom);
      }

      if (totalTo) {
        query.total.$lte = Number(totalTo);
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1 }).skip(((Number(page) || 1) - 1) * 10).limit(10);

    // Return the transactions

    return httpResponse(200, "Transactions retreived successfully", {
      transactions: transactions.map((transactionDoc) => {
        return {
          id: transactionDoc._id,
          user: transactionDoc.user,
          total: transactionDoc.total,
          description: transactionDoc.description,
          date: transactionDoc.date,
          business: transactionDoc.business,
          items: transactionDoc.items
        }
      })
    }, res);
    
   
  } catch (error) {
    console.error("Error getting transactions", error);
    return httpResponse(500, "Internal server error", {}, res);
  }
});

router.post('/', async(req: Request & {
  body: {
    user: string;
    total: number;
    description: string;
    date: Date;
    business: string;
    items: {
      title: string;
      quantity: number;
      price: number;
    }[]
  }
}, res: Response) => {
  try {

    const { user, total, description, date, business, items } = req.body;

    if (!user || !total || !description || !date || !business) {
      return httpResponse(400, "Missing required fields", {}, res);
    }

    // Check that total is a whole number

    if (!Number.isInteger(total)) {
      return httpResponse(400, "Total must be a whole number", {}, res);
    }

    // Check if items is an array and matches the required format

    if (!Array.isArray(items)) {
      return httpResponse(400, "Items must be an array", {}, res);
    }

    // If there are items, check if they match the required format

    if (items.length > 0) {
      const invalidItem = items.find((item) => {
        return !item.title || !item.quantity || !item.price;
      });

      if (invalidItem) {
        return httpResponse(400, "Items must have a title, quantity, and price", {}, res);
      }
    }

    // Check if user exists

    const userDoc = await User.findById(user);

    if (!userDoc) {
      return httpResponse(400, "User not found", {}, res);
    }

    // Create transaction

    const transactionDoc = new Transaction({
      user,
      total,
      description,
      date,
      business,
      items
    })

    await transactionDoc.save();

    // Update user balance

    userDoc.balance += total;

    await userDoc.save();

    // Return the transaction

    return httpResponse(201, "Transaction created successfully", {
      transaction: {
        id: transactionDoc._id,
        user: transactionDoc.user,
        total: transactionDoc.total,
        description: transactionDoc.description,
        date: transactionDoc.date,
        business: transactionDoc.business,
        items: transactionDoc.items
      }
    }, res)
    

  } catch(error) {
    return httpResponse(500, "Internal server error", {}, res);
  }
})

export default router;