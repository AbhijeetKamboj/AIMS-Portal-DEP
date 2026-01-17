# Mobile App Setup Guide

This guide will help you set up and complete the React Native mobile application for the Academic Portal.

## 📱 Project Structure

The mobile app uses React Native with Expo for easier development and deployment. The structure mirrors the web version with mobile-optimized components.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `mobile` directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_BACKEND_URL=http://your-backend-url:5050/api
```

**Note**: For local development, if running on Android emulator, use `http://10.0.2.2:5050/api` instead of `localhost`.

### 3. Start Development Server

```bash
npm start
```

### 4. Run on Device/Emulator

- **iOS**: Press `i` in terminal or scan QR code with Expo Go app
- **Android**: Press `a` in terminal or scan QR code with Expo Go app
- **Web**: Press `w` in terminal (limited functionality)

## 📂 Core Files Created

### ✅ Configuration Files
- `package.json` - Dependencies and scripts
- `app.json` - Expo configuration
- `babel.config.js` - Babel configuration
- `App.js` - Main app entry point with navigation

### ✅ Core Components
- `src/components/Card.js` - Card component
- `src/components/Button.js` - Button component with variants
- `src/components/Input.js` - Input component with labels and errors

### ✅ Context & Config
- `src/context/AuthContext.js` - Authentication context (same as web)
- `src/config/supabase.js` - Supabase client configuration
- `src/config/api.js` - API base URL configuration
- `src/styles/theme.js` - Dark theme colors and styling

### ✅ Screens Created
- `src/screens/LoginScreen.js` - Login screen

## 🔨 Next Steps - Screens to Complete

Based on the web version, you need to create the following screens:

### 1. Signup Screen (`src/screens/SignupScreen.js`)
- Name, email, password, confirm password fields
- Role selector (Student, Faculty, Admin, Faculty Advisor)
- Form validation
- Navigate to appropriate dashboard after signup

### 2. Student Dashboard (`src/screens/StudentDashboard.js`)
- Tabs: Browse Courses, My Courses, My Requests
- Course search functionality
- Request enrollment button
- Drop/Withdraw course functionality
- Navigate to CourseDetail

### 3. Faculty Dashboard (`src/screens/FacultyDashboard.js`)
- Tabs: My Courses, Enrollment Requests, Course Approvals
- Create course form
- Enroll student by email
- Approve/reject enrollment requests
- View course approval status
- Navigate to CourseDetail

### 4. Admin Dashboard (`src/screens/AdminDashboard.js`)
- Tabs: Pending Approvals, All Courses, All Enrollments
- Approve/reject courses
- View all courses and enrollments
- Navigate to CourseDetail

### 5. Faculty Advisor Dashboard (`src/screens/FacultyAdvisorDashboard.js`)
- Tabs: Enrollment Requests, Course Approvals, All Courses, All Enrollments
- Approve/reject enrollment requests (final approval)
- Approve/reject courses (final approval)
- View all data
- Navigate to CourseDetail

### 6. Course Detail Screen (`src/screens/CourseDetailScreen.js`)
- Course information header
- Enrolled students list (all stakeholders)
- Tabs: Announcements, Assignments
- Create announcements (Faculty only)
- Create assignments (Faculty only)
- Submit assignments (Students)
- View submissions and grade (Faculty)

## 📝 Implementation Notes

### Navigation
The app uses React Navigation's native stack navigator. Navigation is handled in `App.js` based on authentication state and user role.

### API Calls
All API calls should use the same endpoints as the web version:
- Use `getToken()` from AuthContext for authentication
- Use `API_BASE` from `src/config/api.js` for base URL
- Handle errors appropriately

### File Uploads
For assignment submissions, use `expo-document-picker` to select files:
```javascript
import * as DocumentPicker from 'expo-document-picker';

const result = await DocumentPicker.getDocumentAsync({
  type: '*/*',
});
```

### Styling
Use the theme from `src/styles/theme.js`:
- Colors: `colors.primary`, `colors.bgPrimary`, etc.
- Spacing: `spacing.md`, `spacing.lg`, etc.
- Typography: `typography.h1`, `typography.body`, etc.

### Key Differences from Web

1. **ScrollView**: Use `ScrollView` for scrollable content
2. **FlatList**: Use `FlatList` for lists (courses, enrollments, etc.)
3. **KeyboardAvoidingView**: Wrap forms in `KeyboardAvoidingView`
4. **TouchableOpacity**: Use for touch interactions
5. **Alert**: Use React Native's `Alert` instead of browser `alert()`
6. **Navigation**: Use `navigation.navigate()` instead of `useNavigate()`

## 🎨 Dark Theme

The app uses the same dark theme as the web version:
- Primary background: `#0f172a`
- Secondary background: `#1e293b`
- Primary color: `#818cf8`
- All components are styled to match the web version

## 🔍 Testing

1. **Test Authentication**: Login and Signup flows
2. **Test Dashboards**: All role-based dashboards
3. **Test Course Features**: Create, view, enroll, submit assignments
4. **Test Approval Workflows**: Course and enrollment approvals
5. **Test File Uploads**: Assignment submissions

## 📱 Platform-Specific Notes

### iOS
- Test on iOS simulator or physical device
- May need to configure URL scheme for deep linking

### Android
- Use `10.0.2.2` instead of `localhost` for backend URL
- May need to configure network security config for HTTP

## 🚨 Common Issues

1. **Backend not accessible**: Update `EXPO_PUBLIC_BACKEND_URL` in `.env`
2. **Authentication errors**: Check Supabase credentials
3. **Navigation issues**: Ensure all screens are registered in `App.js`
4. **File upload errors**: Check file picker permissions

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Documentation](https://reactnative.dev/)

## ✅ Completion Checklist

- [x] Project structure and configuration
- [x] Core components (Card, Button, Input)
- [x] AuthContext and configuration
- [x] Login screen
- [ ] Signup screen
- [ ] Student Dashboard
- [ ] Faculty Dashboard
- [ ] Admin Dashboard
- [ ] Faculty Advisor Dashboard
- [ ] Course Detail Screen
- [ ] File upload for assignments
- [ ] Testing and bug fixes

The foundation is complete! Continue implementing the remaining screens following the same patterns as the Login screen and web version.
