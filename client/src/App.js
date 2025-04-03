import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './redux/store';
import { greenBlackTheme } from './utils/theme';
import { loadUser } from './redux/actions/authActions';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Alert from './components/layout/Alert';
import PrivateRoute from './components/routing/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Notifications from './pages/Notifications';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Theme from './pages/Theme';

const App = () => {
  // Load user on app load
  useEffect(() => {
    // Check if there's a token in localStorage
    if (localStorage.getItem('token')) {
      store.dispatch(loadUser());
    }
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={greenBlackTheme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <Navbar />
            <Alert />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/expenses" element={
                <PrivateRoute>
                  <Expenses />
                </PrivateRoute>
              } />
              <Route path="/income" element={
                <PrivateRoute>
                  <Income />
                </PrivateRoute>
              } />
              <Route path="/notifications" element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              } />
              <Route path="/categories" element={
                <PrivateRoute>
                  <Categories />
                </PrivateRoute>
              } />
              <Route path="/settings" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/theme" element={
                <PrivateRoute>
                  <Theme />
                </PrivateRoute>
              } />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
