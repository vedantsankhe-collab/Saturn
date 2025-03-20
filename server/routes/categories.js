const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Category = require('../models/Category');

// @route   GET api/categories
// @desc    Get all user categories
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [
        { user: req.user.id },
        { isDefault: true }
      ]
    }).sort({ name: 1 });
    
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/categories
// @desc    Add new category
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('type', 'Type is required').isIn(['expense', 'income'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, icon, color, budget, description } = req.body;

    try {
      // Check if category already exists for this user
      const existingCategory = await Category.findOne({
        name,
        user: req.user.id
      });

      if (existingCategory) {
        return res.status(400).json({ msg: 'Category already exists' });
      }

      // Create new category
      const newCategory = new Category({
        name,
        type,
        icon,
        color,
        user: req.user.id,
        budget,
        description
      });

      const category = await newCategory.save();
      res.json(category);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/categories/:id
// @desc    Get category by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Make sure user owns category or it's a default category
    if (category.user && category.user.toString() !== req.user.id && !category.isDefault) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(category);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, icon, color, budget, description } = req.body;

  // Build category object
  const categoryFields = {};
  if (name) categoryFields.name = name;
  if (icon) categoryFields.icon = icon;
  if (color) categoryFields.color = color;
  if (budget !== undefined) categoryFields.budget = budget;
  if (description) categoryFields.description = description;

  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Make sure user owns category
    if (category.user && category.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Don't allow updating default categories
    if (category.isDefault) {
      return res.status(401).json({ msg: 'Cannot modify default categories' });
    }

    // Update
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: categoryFields },
      { new: true }
    );

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Make sure user owns category
    if (category.user && category.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Don't allow deleting default categories
    if (category.isDefault) {
      return res.status(401).json({ msg: 'Cannot delete default categories' });
    }

    await category.deleteOne();

    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/categories/type/:type
// @desc    Get categories by type
// @access  Private
router.get('/type/:type', auth, async (req, res) => {
  try {
    const type = req.params.type;
    
    if (!['expense', 'income'].includes(type)) {
      return res.status(400).json({ msg: 'Invalid category type' });
    }
    
    const categories = await Category.find({
      type,
      $or: [
        { user: req.user.id },
        { isDefault: true }
      ]
    }).sort({ name: 1 });
    
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 