import {
  CartItem,
  UserContext,
  CheckoutResult,
  AppliedDiscount,
} from "../models/types";
import { dataService } from "./dataService";
import { DiscountService } from "./discountService";

const discountService = new DiscountService();

export default class CheckoutService {
  public calculateCheckout = async (
    items: CartItem[],
    userContext: UserContext
  ): Promise<CheckoutResult> => {
    const result: CheckoutResult = this.initResult();

    if (items.length === 0) {
      result.data.warnings?.push("No items");
      return result;
    }
    const merged = this.mergeDuplicates(items);
    const discountRules = await dataService.getDiscountRules();

    type Candidate = { rule: any; amount: number; appliedTo: string };
    const candidates: Candidate[] = [];

    for (const item of merged) {
      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        result.data.warnings?.push(
          `Invalid quantity (${item.quantity}) for product ${item.productId}; skipping.`
        );
        continue;
      }

      const product = await dataService.getProductById(item.productId);
      if (!product) {
        result.data.warnings?.push(
          `Product with ID ${item.productId} not found; aborting checkout.`
        );
        return result;
      }

      if (product.price < 0 || product.price == null) {
        result.data.warnings?.push(
          `Negative price (${product.price}) for product ${product.id}; skipping.`
        );
        continue;
      }

      result.data.subtotal += product.price * item.quantity;

      const productRules = discountService.getApplicableRulesForProduct(
        product,
        discountRules,
        userContext
      );
      const sortedProduct = discountService.sortRulesByPriority(productRules);

      for (const rule of sortedProduct) {
        let amount = 0;
        if (rule.type === "percentage") {
          const pct = Math.max(0, Math.min(rule.value, 100));
          amount = product.price * item.quantity * (pct / 100);
        } else if (rule.type === "buy_x_get_y_free") {
          amount = discountService.applyBuyXGetYFreeDiscount(
            rule as any,
            product as any,
            item.quantity
          );
        } else {
          continue;
        }
        if (amount > 0)
          candidates.push({ rule, amount, appliedTo: item.productId });
      }
    }
    const cartRules = discountService.getApplicableCartRules(
      discountRules,
      userContext
    );

    const sortedCart = discountService.sortRulesByPriority(cartRules);
    for (const rule of sortedCart) {
      let amount = 0;
      if (rule.type === "percentage") {
        const pct = Math.max(0, Math.min(rule.value, 100));
        amount = result.data.subtotal * (pct / 100);
      } else if (rule.type === "cart_threshold") {
        amount = discountService.applyCartThresholdDiscount(
          rule as any,
          result.data.subtotal
        );
      } else {
        continue;
      }
      if (amount > 0) candidates.push({ rule, amount, appliedTo: "cart" });
    }
    // only the highest-priority discount
    if (candidates.length) {
      candidates.sort((a, b) => b.rule.priority - a.rule.priority);
      const best = candidates[0];
      if (
        candidates.slice(1).some((c) => c.rule.priority === best.rule.priority)
      ) {
        result.data.warnings?.push(
          `Multiple rules at priority ${best.rule.priority}; applied: ${best.rule.name}`
        );
      }
      result.data.appliedDiscounts.push(
        this.makeDiscount(
          best.rule,
          best.appliedTo,
          best.amount,
          best.rule.value
        )
      );
    }

    this.finalizeTotals(result);
    result.success = true;
    return result;
  };

  private initResult = (): CheckoutResult => ({
    success: false,
    data: { subtotal: 0, appliedDiscounts: [], total: 0, warnings: [] },
  });

  private mergeDuplicates = (items: CartItem[]): CartItem[] => {
    const map = new Map<string, number>();
    for (const { productId, quantity } of items) {
      map.set(productId, (map.get(productId) || 0) + quantity);
    }
    return Array.from(map.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  };

  private makeDiscount = (
    rule: any,
    appliedTo: string,
    amount: number,
    value: number
  ): AppliedDiscount => ({
    ruleId: rule.id,
    ruleName: rule.name,
    appliedTo,
    value: value,
    type: rule.type,
    discountAmount: amount,
  });

  private finalizeTotals = (result: CheckoutResult) => {
    const totalDisc = result.data.appliedDiscounts.reduce(
      (sum, d) => sum + d.discountAmount,
      0
    );
    result.data.total = Math.max(0, result.data.subtotal - totalDisc);

    result.data.subtotal = +result.data.subtotal.toFixed(2);
    result.data.total = +result.data.total.toFixed(2);
    result.data.appliedDiscounts = result.data.appliedDiscounts.map((d) => ({
      ...d,
      discountAmount: +d.discountAmount.toFixed(2),
    }));
  };
}
