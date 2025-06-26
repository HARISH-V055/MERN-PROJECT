const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/mern_auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  calorieGoal: { type: Number, default: 2000 },
  foods: [
    {
      name: String,
      calories: Number,
      meal: String,
      date: String
    }
  ]
});
const User = mongoose.model('User', userSchema);

const JWT_SECRET = 'your_jwt_secret'; // Change this in production

app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// JWT auth middleware
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
}

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Get user profile (for debugging)
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error getting profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user foods
app.get('/api/foods', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.foods);
});

// Add food for user
app.post('/api/foods', auth, async (req, res) => {
  const { name, calories, meal, date } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.foods.push({ name, calories, meal, date });
  await user.save();
  res.status(201).json({ message: 'Food added' });
});

// Get calorie goal
app.get('/api/goal', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ calorieGoal: user.calorieGoal });
});

// Set calorie goal
app.post('/api/goal', auth, async (req, res) => {
  const { calorieGoal } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.calorieGoal = calorieGoal;
  await user.save();
  res.json({ message: 'Goal updated' });
});

// Save all foods and calorie goal for the user
app.post('/api/saveAll', auth, async (req, res) => {
  let { foods, calorieGoal, date } = req.body;
  try {
    console.log('Received saveAll request:', { foods: foods?.length, calorieGoal, date });
    
    // Validate required fields
    if (!foods || !Array.isArray(foods)) {
      return res.status(400).json({ message: 'Foods array is required' });
    }
    
    if (typeof calorieGoal !== 'number' || calorieGoal <= 0) {
      return res.status(400).json({ message: 'Valid calorieGoal is required' });
    }

    // Remove any id/_id fields from foods before saving and ensure all required fields
    foods = foods.map(food => ({
      name: food.name || '',
      calories: Number(food.calories) || 0,
      meal: food.meal || 'breakfast',
      date: food.date || new Date().toISOString().split('T')[0]
    }));

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.foods = foods;
    user.calorieGoal = calorieGoal;
    await user.save();
    
    console.log('Data saved successfully for user:', req.userId);
    res.json({ message: 'All data saved successfully' });
  } catch (err) {
    console.error('Error in saveAll:', err);
    res.status(500).json({ message: 'Error saving data: ' + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 