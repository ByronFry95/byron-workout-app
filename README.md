# Training App

A functional strength training web app built with Next.js and React for tracking workouts and body composition metrics.

## Features

### Workout Tracker (Page 1)
- **Workout Days**: Pre-configured with Chest & Back, Arms & Shoulders, and Legs. Edit day names directly.
- **Exercises**: Add exercises to each day. Each exercise can have up to 5 (or more) sets.
- **Set Tracking**: 
  - View previous week's weight and reps
  - Input current week's weight and reps
  - Base of 3 sets, add more with the + button
  - Remove individual sets as needed
- **Easy Editing**: Click on any name to edit it

### Body Composition Tracker (Page 2)
- **Measurements Input**: Height, Weight, Waist, Neck, and Hip (for females)
- **Navy Body Fat Formula**: Calculates body fat percentage using the official Navy formula
- **Body Fat Categories**: Displays fitness category (Essential Fat, Athletes, Fitness, Average, Obese)
- **Measurement History**: Track measurements over time with dates and calculated body fat %
- **Gender Support**: Separate formulas for male and female calculations

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
npm run build
npm start
```

## Data Storage

Currently uses **localStorage** for storing:
- Workout data (days, exercises, sets)
- Measurement history and body composition data

This works great for personal use. When ready, you can integrate Firebase:
- Firestore for storing workouts and measurements
- Firebase Authentication for user login
- Real-time sync across devices

## Deployment

The app is ready to deploy to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel auto-detects Next.js and deploys automatically

## Future Enhancements

- Firebase integration for cloud sync
- Mobile app responsiveness improvements
- Export workout data to CSV
- Progress charts and analytics
- Ability to copy previous week's workouts
- Exercise library with descriptions
- Rest day tracking
- Nutrition tracker
