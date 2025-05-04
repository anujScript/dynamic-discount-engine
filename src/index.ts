import app from "./express";

const PORT = process.env.PORT || 9281;

app.listen(PORT, () => {
  console.log(`Dynamic Discount Engine running on port:${PORT}`);
});
