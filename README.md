# SATURN - Personal Finance Tracker

SATURN is a comprehensive personal finance tracking application that helps users manage their expenses, income, and savings goals.

## Features

- Dashboard with financial overview and visualizations
- Expense tracking with categorization
- Income management
- Notification system for subscription reminders and milestones
- Theme customization
- User authentication and profile management
- Responsive UI built with Material-UI

## Tech Stack

- **Frontend**: React, Redux, Material-UI
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/saturn.git
   cd saturn
   ```

2. Install dependencies
   ```bash
   npm run install-all
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5001
   ```

4. Start the application in development mode
   ```bash
   npm run dev
   ```

## Project Structure

```
saturn/
├── client/           # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── redux/
│       └── utils/
├── server/           # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
└── api/              # Vercel serverless functions
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## License

MIT 