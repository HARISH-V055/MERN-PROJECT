# 🍎 Calorie Counter

A modern, responsive React application for tracking daily calorie intake with a beautiful UI and intuitive user experience.

## Features

- **Daily Calorie Tracking**: Add foods with their calorie content and track daily intake
- **Meal Organization**: Categorize foods by meals (Breakfast, Lunch, Dinner, Snacks)
- **Progress Visualization**: Visual progress bar showing daily goal progress
- **Customizable Goals**: Set and update your daily calorie goal
- **Data Persistence**: All data is saved locally using localStorage
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

### Building for Production

To create a production build:
```bash
npm run build
```

## How to Use

1. **Set Your Daily Goal**: Enter your target daily calorie intake and click "Update Goal"

2. **Add Food Items**: 
   - Enter the food name
   - Specify the calorie content
   - Select the meal type (Breakfast, Lunch, Dinner, or Snacks)
   - Click "Add Food"

3. **Track Progress**: 
   - View your current calorie intake vs. daily goal
   - Monitor progress with the visual progress bar
   - See breakdown by meal type

4. **Manage Your Log**:
   - Delete individual food items
   - Clear all foods for the current day
   - View daily summary

## Features in Detail

### Daily Progress Tracking
- Real-time calorie counting
- Visual progress bar
- Percentage completion display
- Goal status indicators

### Meal Organization
- Separate sections for each meal
- Individual calorie totals per meal
- Easy food categorization

### Data Management
- Automatic data persistence
- Local storage for privacy
- No external dependencies or accounts required

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interface
- Works on all screen sizes

## Technology Stack

- **React 18**: Modern React with hooks
- **CSS3**: Custom styling with gradients and animations
- **localStorage**: Client-side data persistence
- **Responsive Design**: Mobile-first CSS Grid and Flexbox

## Project Structure

```
src/
├── App.js          # Main application component
├── App.css         # Component-specific styles
├── index.js        # Application entry point
└── index.css       # Global styles
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE). 