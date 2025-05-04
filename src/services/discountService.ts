import {
  DiscountRule,
  Product,
  PercentageDiscountRule,
  BuyXGetYFreeDiscountRule,
  CartThresholdDiscountRule,
  UserContext,
} from "../models/types";

export class DiscountService {
  isRuleActive = (rule: DiscountRule): boolean => {
    const now = Date.now();
    const start = rule.start_date ? new Date(rule.start_date).getTime() : null;
    const end = rule.end_date ? new Date(rule.end_date).getTime() : null;

    if ((start && now < start) || (end && now > end)) return false;
    return true;
  };

  isConditionSatisfied = (
    rule: DiscountRule,
    userContext: UserContext
  ): boolean => {
    const condition = rule.condition;
    if (!condition) return true;
    const rawKey = condition.user_attribute;
    const camelKey = rawKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

    const userValue =
      userContext[rawKey as keyof UserContext] ??
      userContext[camelKey as keyof UserContext];

    if (userValue === undefined) return false;

    switch (condition.operator) {
      case "equals":
        return userValue === condition.value;
      case "not_equals":
        return userValue !== condition.value;
      case "greater_than":
        return userValue > condition.value;
      case "less_than":
        return userValue < condition.value;
      default:
        return false;
    }
  };

  applyPercentageDiscount = (
    rule: PercentageDiscountRule,
    product: Product,
    quantity: number
  ): number => {
    return product.price * quantity * (rule.value / 100);
  };

  applyBuyXGetYFreeDiscount = (
    rule: BuyXGetYFreeDiscountRule,
    product: Product,
    quantity: number
  ): number => {
    const { x_quantity, y_quantity } = rule;
    if (x_quantity <= 0 || y_quantity <= 0 || quantity < x_quantity) return 0;

    const setSize = x_quantity + y_quantity;
    const sets = Math.floor(quantity / setSize);
    const remaining = quantity % setSize;

    const extraFree = Math.max(0, remaining - x_quantity);
    const freeItems = sets * y_quantity + extraFree;

    return freeItems * product.price;
  };

  applyCartThresholdDiscount = (
    rule: CartThresholdDiscountRule,
    subtotal: number
  ): number => {
    return subtotal >= rule.threshold ? rule.value : 0;
  };

  getApplicableRulesForProduct = (
    product: Product,
    rules: DiscountRule[],
    userContext: UserContext
  ): DiscountRule[] => {
    return rules.filter((rule) => {
      if (!this.isRuleActive(rule)) return false;
      if (!this.isConditionSatisfied(rule, userContext)) return false;

      if (rule.applies_to === "product" && rule.target === product.id)
        return true;
      if (rule.applies_to === "category" && rule.target === product.category)
        return true;

      return false;
    });
  };

  getApplicableCartRules = (
    rules: DiscountRule[],
    userContext: UserContext
  ): DiscountRule[] => {
    return rules.filter(
      (rule) =>
        rule.applies_to === "cart" &&
        this.isRuleActive(rule) &&
        this.isConditionSatisfied(rule, userContext)
    );
  };

  sortRulesByPriority = (rules: DiscountRule[]): DiscountRule[] => {
    return [...rules].sort((a, b) => b.priority - a.priority);
  };
}
