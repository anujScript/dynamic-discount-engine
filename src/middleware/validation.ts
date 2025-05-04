import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { CheckoutRequest } from "../interfaces/checkout";

const checkoutSchema = Joi.object<CheckoutRequest>({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .required(),
  userContext: Joi.object({
    is_first_time: Joi.boolean(),
  }).required(),
});

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return res.status(400).json({
        status: "error",
        message: `Validation error: ${errorMessage}`,
      });
    }

    next();
  };
};

export const validateCheckout = validate(checkoutSchema);
