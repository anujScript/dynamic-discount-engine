import { CartItem, UserContext, CheckoutResultData } from "../models/types";

export interface CheckoutRequest {
  items: CartItem[];
  userContext: UserContext;
}

export interface CheckoutResponse {
  success: true | false;
  data?: CheckoutResultData;
  message?: string;
}

export interface CheckoutErrorResponse {
  success: false;
  message: string;
}
