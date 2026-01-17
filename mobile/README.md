# Academic Portal Mobile App

React Native mobile application for the Academic Portal with all the same functionalities as the web version.

## Features

- **Authentication**: Login and Signup for all roles (Student, Faculty, Admin, Faculty Advisor)
- **Student Dashboard**: Browse courses, request enrollment, view enrolled courses, submit assignments
- **Faculty Dashboard**: Create courses, manage enrollments, create announcements and assignments
- **Admin Dashboard**: Approve courses, view all courses and enrollments
- **Faculty Advisor Dashboard**: Approve enrollments and courses, view all data
- **Course Details**: View course information, announcements, assignments, enrollments
- **Dark Theme**: Modern dark aesthetic matching the web version

## Setup

1. **Install dependencies**:
```bash
cd mobile
npm install
```

2. **Configure environment variables**:
Create a `.env` file in the `mobile` directory:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_BACKEND_URL=http://your-backend-url:5050/api
```

3. **Start the development server**:
```bash
npm start
```

4. **Run on device/emulator**:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # All screen components
│   ├── components/       # Reusable components
│   ├── context/          # React Context (AuthContext)
│   ├── config/           # Configuration files
│   └── styles/           # Theme and styling
├── App.js               # Main app entry point
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Requirements

- Node.js 16+ 
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator (or physical device with Expo Go)

## API Integration

The mobile app uses the same backend APIs as the web version. Ensure your backend server is running and accessible from your device/emulator.

## Notes

- Uses Expo for easier development and deployment
- All API calls use the same endpoints as the web version
- Dark theme matches the web application
- Navigation handled by React Navigation
