import { Request, Response } from "express";
import { CheckoutResult } from "../models/types";
import {
  CheckoutRequest,
  CheckoutResponse,
  CheckoutErrorResponse,
} from "../interfaces/checkout";
import CheckoutService from "../services/checkoutService";

export default class CheckoutController extends CheckoutService {
  public checkout = async (
    req: Request<{}, {}, CheckoutRequest>,
    res: Response<CheckoutResponse | CheckoutErrorResponse>
  ) => {
    try {
      const { items, userContext } = req.body;

      const result: CheckoutResult = await this.calculateCheckout(
        items,
        userContext
      );

      if (result.success) {
        res.status(200).json({
          success: result.success,
          data: result.data,
        });
        return;
      }
      res.status(400).json({
        success: result.success,
        data: result.data,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };
}
