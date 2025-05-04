export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  tags: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface UserContext {
  isFirstTime?: boolean;
  [key: string]: any;
}

export interface BaseDiscountRule {
  id: string;
  name: string;
  type: "percentage" | "buy_x_get_y_free" | "cart_threshold";
  priority: number;
  applies_to: "product" | "category" | "cart";
  target?: string;
  start_date?: string;
  end_date?: string;
  condition?: {
    user_attribute: string;
    operator: "equals" | "not_equals" | "greater_than" | "less_than";
    value: any;
  };
}

export interface PercentageDiscountRule extends BaseDiscountRule {
  type: "percentage";
  value: number;
}

export interface BuyXGetYFreeDiscountRule extends BaseDiscountRule {
  type: "buy_x_get_y_free";
  x_quantity: number;
  y_quantity: number;
}

export interface CartThresholdDiscountRule extends BaseDiscountRule {
  type: "cart_threshold";
  threshold: number;
  value: number;
}

export type DiscountRule =
  | PercentageDiscountRule
  | BuyXGetYFreeDiscountRule
  | CartThresholdDiscountRule;

export interface AppliedDiscount {
  ruleId: string;
  ruleName: string;
  discountAmount: number;
  appliedTo: string;
  type: string;
  value: number;
}

export interface CheckoutResult {
  success: boolean;
  data: CheckoutResultData;
}

export interface CheckoutResultData {
  subtotal: number;
  appliedDiscounts: AppliedDiscount[];
  total: number;
  warnings?: string[];
  value?: number;
}
