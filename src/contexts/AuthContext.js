import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Mock authentication - replace with actual API call
    const mockUsers = [
      { id: 1, username: 'ceo', password: 'password', role: 'CEO', fullName: 'John Doe' },
      { id: 2, username: 'manager', password: 'password', role: 'General Manager', fullName: 'Jane Smith' },
      { id: 3, username: 'supplier', password: 'password', role: 'Supplier', fullName: 'Bob Johnson' },
      { id: 4, username: 'storekeeper', password: 'password', role: 'Storekeeper', fullName: 'Alice Brown' },
      { id: 5, username: 'customer', password: 'password', role: 'Customer', fullName: 'Charlie Wilson' },
    ];

    const foundUser = mockUsers.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const userData = { ...foundUser };
      delete userData.password;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const signup = async (userData) => {
    // Mock signup - replace with actual API call
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'Customer'
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const value = {
    user,
    login,
    logout,
    signup,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};