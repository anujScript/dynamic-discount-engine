import fs from "fs";
import path from "path";
import { Product, DiscountRule } from "../models/types";

class DataService {
  private productsCache: Product[] | null = null;
  private discountRulesCache: DiscountRule[] | null = null;

  async getProducts(): Promise<Product[]> {
    if (this.productsCache) {
      return this.productsCache;
    }

    try {
      const productsPath = path.join(__dirname, "../../data/products.json");
      const productsData = await fs.promises.readFile(productsPath, "utf8");
      this.productsCache = JSON.parse(productsData) as Product[];
      return this.productsCache;
    } catch (error) {
      console.error("Error loading products:", error);
      throw new Error("Failed to load products");
    }
  }

  async getProductById(productId: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((product) => product.id === productId) || null;
  }

  async getDiscountRules(): Promise<DiscountRule[]> {
    if (this.discountRulesCache) {
      return this.discountRulesCache;
    }

    try {
      const rulesPath = path.join(__dirname, "../../data/discount_rules.json");
      const rulesData = await fs.promises.readFile(rulesPath, "utf8");
      this.discountRulesCache = JSON.parse(rulesData) as DiscountRule[];
      return this.discountRulesCache;
    } catch (error) {
      console.error("Error loading discount rules:", error);
      throw new Error("Failed to load discount rules");
    }
  }
}

export const dataService = new DataService();
