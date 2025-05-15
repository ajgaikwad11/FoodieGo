// import express from "express"
// import authMiddleware from "../middlewere/auth.js"
// import { placeOrder } from "../controllers/orderController.js"

// const orderRouter = express.Router();

// orderRouter.post("/place",authMiddleware,placeOrder);

// export default orderRouter;

import express from "express";
import authMiddleware from "../middlewere/auth.js";
import { placeOrder,verifyPayment } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", authMiddleware, verifyPayment);

export default orderRouter;