import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { checkoutRouter } from "./routes/checkoutroute";
import { requestLogger, errorLogger } from "./middleware/logging";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("files"));

app.use("/checkout", checkoutRouter);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Service is running" });
});

// Error handling middleware
app.use(errorLogger);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    status: "error",
    message: err.message || "Something went wrong!",
  });
});

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res
      .status(400)
      .json({ success: false, message: "Bad JSON payload" });
  }
  next();
});

export default app;
