/**
 * Mock Database Service
 * This provides in-memory storage for development when MongoDB is not available
 */

class MockDb {
  constructor() {
    this.users = [];
    this.expenses = [];
    this.income = [];
    this.investments = [];
    this.categories = [];
    this.notifications = [];
    this.nextId = 1;
  }

  // Generate a unique ID
  generateId() {
    return (this.nextId++).toString();
  }

  // User methods
  async findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  async findUserById(id) {
    return this.users.find(user => user._id === id);
  }

  async createUser(userData) {
    const newUser = {
      _id: this.generateId(),
      ...userData,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Category methods
  async findCategories() {
    return this.categories;
  }

  async createCategory(categoryData) {
    const newCategory = {
      _id: this.generateId(),
      ...categoryData,
      createdAt: new Date()
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  // Initialize with default categories
  async seedDefaultCategories() {
    if (this.categories.length === 0) {
      const defaultCategories = [
        { name: 'Food & Dining', type: 'expense', icon: 'restaurant' },
        { name: 'Transportation', type: 'expense', icon: 'directions_car' },
        { name: 'Housing', type: 'expense', icon: 'home' },
        { name: 'Utilities', type: 'expense', icon: 'power' },
        { name: 'Entertainment', type: 'expense', icon: 'movie' },
        { name: 'Shopping', type: 'expense', icon: 'shopping_cart' },
        { name: 'Health', type: 'expense', icon: 'local_hospital' },
        { name: 'Education', type: 'expense', icon: 'school' },
        { name: 'Personal Care', type: 'expense', icon: 'spa' },
        { name: 'Travel', type: 'expense', icon: 'flight' },
        { name: 'Salary', type: 'income', icon: 'work' },
        { name: 'Freelance', type: 'income', icon: 'laptop' },
        { name: 'Investments', type: 'income', icon: 'trending_up' },
        { name: 'Gifts', type: 'income', icon: 'card_giftcard' },
        { name: 'Other Income', type: 'income', icon: 'attach_money' }
      ];

      for (const category of defaultCategories) {
        await this.createCategory(category);
      }
      
      console.log('Default categories seeded in mock database');
    }
  }
}

// Create a singleton instance
const mockDb = new MockDb();

module.exports = mockDb; 