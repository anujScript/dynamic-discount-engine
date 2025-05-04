import { Router } from "express";
import { validateCheckout } from "../middleware/validation";
import CheckoutController from "../controller/checkout.controller";

export const checkoutRouter: Router = Router();

const { checkout } = new CheckoutController();

checkoutRouter.post("/cart", validateCheckout, checkout);

checkoutRouter.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});
