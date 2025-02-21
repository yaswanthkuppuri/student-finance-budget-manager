import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBudgetStore } from '../store/budgetStore';
import { Category } from '../types';
import { PiggyBank, Star, Building2, LogOut, UserCircle, Plus, Minus, Coins, ArrowRight } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const {
    budget,
    categories,
    fetchBudget,
    updateBudget,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useBudgetStore();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    current_amount: 0,
    min_amount: 0,
    max_amount: 0,
    is_fixed: false,
  });

  const [showBankModal, setShowBankModal] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    account_number: '',
    username: '',
  });

  useEffect(() => {
    if (user) {
      fetchBudget(user.id);
    }
  }, [user]);

  const handleAddCategory = async () => {
    if (!user || !newCategory.name) return;
    await addCategory({
      ...newCategory,
      user_id: user.id,
    });
    setNewCategory({
      name: '',
      current_amount: 0,
      min_amount: 0,
      max_amount: 0,
      is_fixed: false,
    });
  };

  const calculateSavings = () => {
    if (!budget) return 0;
    const totalSpent = categories.reduce(
      (sum, cat) => sum + cat.current_amount,
      0
    );
    return budget.total_amount - totalSpent;
  };

  const getSavingsStars = () => {
    const savings = calculateSavings();
    if (!budget) return 0;
    const percentage = (savings / budget.total_amount) * 100;
    return Math.min(Math.floor(percentage / 20), 5);
  };

  const handleGenerateBudget = () => {
    if (!budget || !user) return;
    
    const totalAmount = budget.total_amount;
    const updatedCategories = categories.map(category => {
      let percentage = 0;
      
      // Assign percentages based on category name (case-insensitive)
      const lowerName = category.name.toLowerCase();
      if (lowerName.includes('food')) {
        percentage = 0.4; // 40%
      } else if (lowerName.includes('fee') || lowerName.includes('college')) {
        percentage = 0.3; // 30%
      } else if (lowerName.includes('cloth')) {
        percentage = 0.2; // 20%
      } else {
        percentage = 0.1; // 10% for others
      }

      const newAmount = Math.round(totalAmount * percentage);
      
      updateCategory(category.id, {
        current_amount: newAmount,
        min_amount: Math.round(newAmount * 0.8), // Set min to 80% of allocated
        max_amount: Math.round(newAmount * 1.2), // Set max to 120% of allocated
      });

      return {
        ...category,
        current_amount: newAmount,
      };
    });
  };

  const incrementAmount = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      updateCategory(categoryId, {
        current_amount: category.current_amount + 100,
      });
    }
  };

  const decrementAmount = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.current_amount >= 100) {
      updateCategory(categoryId, {
        current_amount: category.current_amount - 100,
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e')] bg-cover">
      <div className="min-h-screen bg-black/10 backdrop-blur-sm">
        <header className="bg-white/90 shadow backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <PiggyBank className="mr-2 text-blue-500" /> Budget Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBankModal(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Building2 className="mr-2" /> Connect Bank
              </button>
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <UserCircle className="mr-2" /> Profile
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <LogOut className="mr-2" /> Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 rounded-lg shadow p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Coins className="mr-2 text-blue-500" /> Total Budget
            </h2>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={budget?.total_amount || 0}
                onChange={(e) => updateBudget(Number(e.target.value))}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your total budget"
              />
              <div className="flex items-center">
                {Array.from({ length: getSavingsStars() }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/90 rounded-lg shadow p-6 backdrop-blur-sm">
            <h2 className="text-lg font-medium mb-4">Categories</h2>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Current amount"
                value={newCategory.current_amount}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    current_amount: Number(e.target.value),
                  })
                }
                className="px-3 py-2 border rounded-lg"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newCategory.is_fixed}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, is_fixed: e.target.checked })
                  }
                  className="mr-2"
                />
                <label>Fixed Expense</label>
              </div>
              <button
                onClick={handleAddCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
                disabled={!newCategory.name}
              >
                <Plus className="mr-2" /> Add Category
              </button>
            </div>

            <div className="space-y-4">
              {categories.map((category: Category) => (
                <div
                  key={category.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Current Amount</label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => decrementAmount(category.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          value={category.current_amount}
                          onChange={(e) =>
                            updateCategory(category.id, {
                              current_amount: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                        <button
                          onClick={() => incrementAmount(category.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Min Amount</label>
                      <input
                        type="number"
                        value={category.min_amount}
                        onChange={(e) =>
                          updateCategory(category.id, {
                            min_amount: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Max Amount</label>
                      <input
                        type="number"
                        value={category.max_amount}
                        onChange={(e) =>
                          updateCategory(category.id, {
                            max_amount: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="h-2 bg-gray-200 rounded-full flex-1 mt-2">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              (category.current_amount / (category.max_amount || 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {categories.length > 0 && (
              <button
                onClick={handleGenerateBudget}
                className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 flex items-center mx-auto"
              >
                <ArrowRight className="mr-2" /> Generate Budget
              </button>
            )}
          </div>
        </main>

        {showProfileModal && user && (
          <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />
        )}

        {showBankModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Building2 className="mr-2" /> Connect Bank Account
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankDetails.account_number}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        account_number: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={bankDetails.username}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowBankModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle bank connection
                      setShowBankModal(false);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;