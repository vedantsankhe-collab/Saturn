const Category = require('../models/Category');

// Default expense categories
const defaultExpenseCategories = [
  {
    name: 'Food & Dining',
    type: 'expense',
    icon: 'restaurant',
    color: '#00A86B',
    isDefault: true
  },
  {
    name: 'Shopping',
    type: 'expense',
    icon: 'shopping_bag',
    color: '#4CAF50',
    isDefault: true
  },
  {
    name: 'Travel',
    type: 'expense',
    icon: 'flight',
    color: '#2E7D32',
    isDefault: true
  },
  {
    name: 'Fuel',
    type: 'expense',
    icon: 'local_gas_station',
    color: '#1B5E20',
    isDefault: true
  },
  {
    name: 'Health',
    type: 'expense',
    icon: 'medical_services',
    color: '#388E3C',
    isDefault: true
  },
  {
    name: 'Subscriptions',
    type: 'expense',
    icon: 'subscriptions',
    color: '#43A047',
    isDefault: true
  },
  {
    name: 'Entertainment',
    type: 'expense',
    icon: 'movie',
    color: '#66BB6A',
    isDefault: true
  },
  {
    name: 'Utilities',
    type: 'expense',
    icon: 'power',
    color: '#81C784',
    isDefault: true
  },
  {
    name: 'Housing',
    type: 'expense',
    icon: 'home',
    color: '#A5D6A7',
    isDefault: true
  },
  {
    name: 'Education',
    type: 'expense',
    icon: 'school',
    color: '#C8E6C9',
    isDefault: true
  }
];

// Default income categories
const defaultIncomeCategories = [
  {
    name: 'Salary',
    type: 'income',
    icon: 'work',
    color: '#00A86B',
    isDefault: true
  },
  {
    name: 'Business',
    type: 'income',
    icon: 'business',
    color: '#4CAF50',
    isDefault: true
  },
  {
    name: 'Investment',
    type: 'income',
    icon: 'trending_up',
    color: '#2E7D32',
    isDefault: true
  },
  {
    name: 'Gift',
    type: 'income',
    icon: 'card_giftcard',
    color: '#1B5E20',
    isDefault: true
  },
  {
    name: 'Other',
    type: 'income',
    icon: 'attach_money',
    color: '#388E3C',
    isDefault: true
  }
];

// Seed default categories
const seedCategories = async () => {
  try {
    // Check if categories already exist
    const existingCategories = await Category.find({ isDefault: true });
    
    if (existingCategories.length > 0) {
      console.log('Default categories already exist');
      return;
    }
    
    // Insert default categories
    await Category.insertMany([...defaultExpenseCategories, ...defaultIncomeCategories]);
    
    console.log('Default categories seeded successfully');
  } catch (err) {
    console.error('Error seeding categories:', err);
  }
};

module.exports = seedCategories; 