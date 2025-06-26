import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Navbar from './Navbar.jsx';

function App() {
  const [foods, setFoods] = useState([]);
  const [newFood, setNewFood] = useState({ name: '', calories: '', meal: 'breakfast' });
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [goalInput, setGoalInput] = useState('2000');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedFoods = localStorage.getItem('calorieCounterFoods');
    const savedGoal = localStorage.getItem('calorieCounterGoal');
    
    if (savedFoods) {
      setFoods(JSON.parse(savedFoods));
    }
    if (savedGoal) {
      setDailyGoal(parseInt(savedGoal));
      setGoalInput(savedGoal);
    }
  }, []);

  // Load data from server if user is logged in
  const loadUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await fetch('/api/foods', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      
      if (res.ok) {
        const serverFoods = await res.json();
        if (serverFoods && serverFoods.length > 0) {
          // Add id field to each food for frontend use
          const foodsWithIds = serverFoods.map(food => ({
            ...food,
            id: Date.now() + Math.random()
          }));
          setFoods(foodsWithIds);
        }
      }
      
      // Load calorie goal
      const goalRes = await fetch('/api/goal', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      
      if (goalRes.ok) {
        const goalData = await goalRes.json();
        if (goalData.calorieGoal) {
          setDailyGoal(goalData.calorieGoal);
          setGoalInput(goalData.calorieGoal.toString());
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    loadUserData();
  }, []);

  // Save data to localStorage whenever foods or dailyGoal changes
  useEffect(() => {
    localStorage.setItem('calorieCounterFoods', JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem('calorieCounterGoal', dailyGoal.toString());
  }, [dailyGoal]);

  const addFood = (e) => {
    e.preventDefault();
    if (newFood.name && newFood.calories) {
      const foodToAdd = {
        ...newFood,
        id: Date.now(),
        calories: parseInt(newFood.calories),
        date: new Date().toISOString().split('T')[0]
      };
      setFoods([...foods, foodToAdd]);
      setNewFood({ name: '', calories: '', meal: 'breakfast' });
    }
  };

  const deleteFood = (id) => {
    setFoods(foods.filter(food => food.id !== id));
  };

  const updateGoal = (e) => {
    e.preventDefault();
    const goal = parseInt(goalInput);
    if (goal > 0) {
      setDailyGoal(goal);
    }
  };

  const getTodayFoods = () => {
    const today = new Date().toISOString().split('T')[0];
    return foods.filter(food => food.date === today);
  };

  const getTotalCalories = () => {
    return getTodayFoods().reduce((total, food) => total + food.calories, 0);
  };

  const getProgressPercentage = () => {
    return Math.min((getTotalCalories() / dailyGoal) * 100, 100);
  };

  const getMealFoods = (meal) => {
    return getTodayFoods().filter(food => food.meal === meal);
  };

  const getMealCalories = (meal) => {
    return getMealFoods(meal).reduce((total, food) => total + food.calories, 0);
  };

  const clearToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFoods(foods.filter(food => food.date !== today));
  };

  const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];

  const handleSaveAll = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to save your data.');
      return;
    }
    try {
      // Remove all extra fields (like id/_id) from foods before sending
      const foodsToSave = foods.map(food => ({
        name: food.name,
        calories: food.calories,
        meal: food.meal,
        date: food.date
      }));

      console.log('Sending data to server:', {
        foodsCount: foodsToSave.length,
        calorieGoal: dailyGoal,
        foods: foodsToSave
      });

      const res = await fetch('/api/saveAll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          foods: foodsToSave,
          calorieGoal: dailyGoal
        })
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (res.ok) {
        alert('All data saved successfully!');
      } else {
        alert(`Error saving data: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error in handleSaveAll:', err);
      alert('Network error: ' + err.message);
    }
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Signup />} />
        <Route path="/home" element={
          <div className="container">
            <div className="card">
              <h1 className="text-center mb-20">🍎 Calorie Counter</h1>
              
              {/* Daily Progress */}
              <div className="text-center">
                <div className="calorie-display">
                  {getTotalCalories()} / {dailyGoal} cal
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <p>{getProgressPercentage().toFixed(1)}% of daily goal</p>
              </div>

              {/* Set Daily Goal */}
              <div className="card">
                <h3>Set Daily Goal</h3>
                <form onSubmit={updateGoal} className="flex">
                  <input
                    type="number"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="Daily calorie goal"
                    min="1"
                  />
                  <button type="submit" className="btn">Update Goal</button>
                </form>
              </div>

              {/* Add Food Form */}
              <div className="card">
                <h3>Add Food Item</h3>
                <form onSubmit={addFood}>
                  <div className="grid">
                    <div className="form-group">
                      <label>Food Name</label>
                      <input
                        type="text"
                        value={newFood.name}
                        onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                        placeholder="e.g., Apple, Chicken Breast"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Calories</label>
                      <input
                        type="number"
                        value={newFood.calories}
                        onChange={(e) => setNewFood({...newFood, calories: e.target.value})}
                        placeholder="e.g., 95"
                        min="1"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Meal</label>
                      <select
                        value={newFood.meal}
                        onChange={(e) => setNewFood({...newFood, meal: e.target.value})}
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snacks">Snacks</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success">Add Food</button>
                </form>
              </div>

              {/* Today's Food Log */}
              <div className="card">
                <div className="flex-between mb-20">
                  <h3>Today's Food Log</h3>
                  <button onClick={clearToday} className="btn btn-danger">Clear Today</button>
                </div>
                
                {meals.map(meal => {
                  const mealFoods = getMealFoods(meal);
                  const mealCalories = getMealCalories(meal);
                  
                  return (
                    <div key={meal} className="mb-20">
                      <h4 style={{ textTransform: 'capitalize', color: '#667eea' }}>
                        {meal} ({mealCalories} cal)
                      </h4>
                      {mealFoods.length === 0 ? (
                        <p style={{ color: '#999', fontStyle: 'italic' }}>No foods added yet</p>
                      ) : (
                        mealFoods.map(food => (
                          <div key={food.id} className="food-item">
                            <div className="flex-between">
                              <div>
                                <h4>{food.name}</h4>
                                <p>{food.calories} calories</p>
                              </div>
                              <button 
                                onClick={() => deleteFood(food.id)}
                                className="btn btn-danger"
                                style={{ padding: '8px 16px', fontSize: '14px' }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="card">
                <h3>Daily Summary</h3>
                <div className="grid">
                  {meals.map(meal => (
                    <div key={meal} className="text-center">
                      <h4 style={{ textTransform: 'capitalize' }}>{meal}</h4>
                      <p className="calorie-display" style={{ fontSize: '1.5rem' }}>
                        {getMealCalories(meal)} cal
                      </p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-20">
                  <h3>Total: {getTotalCalories()} calories</h3>
                  <p>
                    {getTotalCalories() > dailyGoal 
                      ? `You're ${getTotalCalories() - dailyGoal} calories over your goal`
                      : `You have ${dailyGoal - getTotalCalories()} calories remaining`
                    }
                  </p>
                </div>
                <div className="text-center mt-20">
                  <button className="btn" onClick={handleSaveAll} style={{ width: '100%', marginBottom: '10px' }}>
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
