# Dynamic Discount Engine

A Node.js/TypeScript backend service that calculates the total cost of a shopping cart, applying discount rules that are defined in a dynamic JSON configuration.

## Features

- Product catalog with 10 sample products
- Checkout API that calculates cart totals with discounts
- Dynamic discount rules loaded from JSON configuration
- Support for multiple discount types:
  - Percentage discounts
  - Buy X get Y free
  - Cart threshold discounts
- Rule prioritization and conflict handling
- Rule activation dates

## Project Structure

```
dynamic-discount-engine/
├── data/
│   ├── products.json           # Product catalog
│   └── discount_rules.json     # Discount rules configuration
├── src/
│   ├── controller/             # Request handlers/controllers
│   ├── middleware/             # Express middleware (e.g., auth, logging)
│   ├── models/                 # TypeScript /types_interfaces
│   ├── routes/                 # Express route definitions
│   ├── services/               # Core business logic (e.g., discount engine)
│   ├── utils/                  # Helper functions/utilities
│   ├── express.ts              # Express server setup
│   └── index.ts                # Entry point
├── package.json
└── tsconfig.json
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd dynamic-discount-engine
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Usage

### Checkout Endpoint

**POST /api/checkout**

Request body:

```json
{
  "items": [
    {
      "productId": "p001",
      "quantity": 2
    },
    {
      "productId": "p005",
      "quantity": 1
    }
  ],
  "userContext": {
    "isFirstTime": true
  }
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "subtotal": 1689.97,
    "appliedDiscounts": [
      {
        "ruleId": "rule007",
        "ruleName": "First-Time User Discount",
        "discountAmount": 337.99,
        "appliedTo": "cart",
        "value": 20,
        "type": "percentage"
      }
    ],
    "total": 1351.98,
    "warnings": []
  }
}
```

## Assumptions Made

1. Only one discount rule can be applied based on priority.
2. If multiple rules have the same priority, the first one in the configuration is applied.
3. Discount amounts are rounded to 2 decimal places.
4. The system handles missing products gracefully by adding warnings to the response.
5. Winston logger is added for logs.

## Future Improvements

With more time, the following improvements could be made:

1. Add a database for storing products and discount rules instead of JSON files.
2. Add more discount rule types (e.g., bundle discounts, tiered pricing).
3. Use Redis or in-memory caching to reduce repeated I/O operations and improve API response times.
4. Add comprehensive test coverage.
5. Add authentication and authorization for the API.

## Use of AI Tools

1. Generated boilerplate code and TypeScript interfaces.
2. Sample product and discount data generation.
3. Winston logger setup.
4. Reviewed and optimized existing code.
5. Drafted and improved documentation content.
