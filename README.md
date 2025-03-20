# Personal Finance Tracker

A comprehensive personal finance tracking application with advanced features for managing expenses, income, investments, and more.

## Features

- **User Authentication**: Secure login and registration system
- **Expense Tracking**: Add, edit, and categorize expenses
- **Income Management**: Track various income sources
- **Customizable Categories**: Create and manage expense and income categories
- **Dashboard**: Visual representation of financial data with charts and graphs
- **Investment Tracking**: Monitor investments and get AI-powered investment strategies
- **Notification Processing**: Automatically process device notifications to add expenses and income
- **Customizable Theme**: Green and black theme with options to customize
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- OpenAI API for investment strategies

### Frontend
- React.js
- Redux for state management
- Chart.js for data visualization
- Material-UI with custom theming
- Responsive design

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker
```

2. Install server dependencies:
```
cd server
npm install
```

3. Install client dependencies:
```
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

## Running the Application

1. Start the server:
```
cd server
npm run dev
```

2. Start the client:
```
cd client
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Default Categories

The application comes with default expense categories:
- Food & Dining
- Shopping
- Travel
- Fuel
- Health
- Subscriptions
- Entertainment
- Utilities
- Housing
- Education

And default income categories:
- Salary
- Business
- Investment
- Gift
- Other

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for AI-powered investment strategies
- Material-UI for the component library
- Chart.js for data visualization 