# Finance API

A secure REST API for managing financial transactions built with Express.js, MongoDB, and TypeScript.

## Features

- Transaction management with filtering and pagination
- Rate limiting and bot protection using Arcjet
- CORS support
- MongoDB integration

## Prerequisites

- Node.js
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
```sh
npm install
```

3. Create a `.env` file in the root directory with the following environment variables:
```sh
HTTP_PORT=5001
MONGO_URI=mongodb://localhost:27017/your_database
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

4. Start the server:
```sh
npm run dev
```

## Credit

This project was created by [Tom Shaw](https://tomshaw.dev)