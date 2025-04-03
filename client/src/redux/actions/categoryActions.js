import {
  GET_CATEGORIES_REQUEST,
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAIL,
  ADD_CATEGORY_REQUEST,
  ADD_CATEGORY_SUCCESS,
  ADD_CATEGORY_FAIL,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAIL,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAIL
} from './types';
import { api } from '../../utils/api';

// Get all categories
export const fetchCategories = () => async (dispatch) => {
  try {
    dispatch({ type: 'GET_CATEGORIES_REQUEST' });
    
    const res = await api.get('/categories');
    
    dispatch({
      type: 'GET_CATEGORIES',
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: 'CATEGORY_ERROR',
      payload: err.response?.data?.msg || 'Failed to load categories'
    });
    
    throw err;
  }
};

// Add new category
export const addCategory = (category) => async (dispatch) => {
  try {
    const res = await api.post('/categories', category);
    
    dispatch({
      type: 'ADD_CATEGORY',
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: 'CATEGORY_ERROR',
      payload: err.response?.data?.msg || 'Failed to add category'
    });
    
    throw err;
  }
};

// Update category
export const updateCategory = (id, category) => async (dispatch) => {
  try {
    const res = await api.put(`/categories/${id}`, category);
    
    dispatch({
      type: 'UPDATE_CATEGORY',
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: 'CATEGORY_ERROR',
      payload: err.response?.data?.msg || 'Failed to update category'
    });
    
    throw err;
  }
};

// Delete category
export const deleteCategory = (id) => async (dispatch) => {
  try {
    await api.delete(`/categories/${id}`);
    
    dispatch({
      type: 'DELETE_CATEGORY',
      payload: id
    });
  } catch (err) {
    dispatch({
      type: 'CATEGORY_ERROR',
      payload: err.response?.data?.msg || 'Failed to delete category'
    });
    
    throw err;
  }
};

// Set current category
export const setCurrentCategory = (category) => {
  return {
    type: 'SET_CURRENT_CATEGORY',
    payload: category
  };
};

// Clear current category
export const clearCurrentCategory = () => {
  return {
    type: 'CLEAR_CURRENT_CATEGORY'
  };
}; 