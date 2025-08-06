import { useState, useEffect } from 'react';
import { User } from '@/types/pos';
import { getFromLocalStorage, saveToLocalStorage } from '@/utils/pos';

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    fullName: 'Store Administrator',
    createdAt: new Date(),
    isActive: true,
  },
  {
    id: '2',
    username: 'cashier',
    password: 'cashier123',
    role: 'cashier',
    fullName: 'Store Cashier',
    createdAt: new Date(),
    isActive: true,
  },
];

export const usePosAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize users if not exists
    const savedUsers = getFromLocalStorage('pos_users', DEFAULT_USERS);
    setUsers(savedUsers);
    
    // Check for existing session
    const savedSession = getFromLocalStorage('pos_current_user', null);
    if (savedSession) {
      setCurrentUser(savedSession);
    }
    
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): { success: boolean; error?: string; user?: User } => {
    const user = users.find(u => u.username === username && u.password === password && u.isActive);
    
    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    setCurrentUser(user);
    saveToLocalStorage('pos_current_user', user);
    
    return { success: true, user };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pos_current_user');
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveToLocalStorage('pos_users', updatedUsers);
    
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<User>): void => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    );
    setUsers(updatedUsers);
    saveToLocalStorage('pos_users', updatedUsers);
    
    // Update current user if it's the one being updated
    if (currentUser?.id === userId) {
      const updatedCurrentUser = { ...currentUser, ...updates };
      setCurrentUser(updatedCurrentUser);
      saveToLocalStorage('pos_current_user', updatedCurrentUser);
    }
  };

  const deleteUser = (userId: string): void => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    saveToLocalStorage('pos_users', updatedUsers);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isCashier = currentUser?.role === 'cashier';

  return {
    currentUser,
    users,
    isLoading,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    isAdmin,
    isCashier,
    isAuthenticated: !!currentUser,
  };
};