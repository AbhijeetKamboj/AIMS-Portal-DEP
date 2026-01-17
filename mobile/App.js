import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import StudentDashboard from './src/screens/StudentDashboard';
import FacultyDashboard from './src/screens/FacultyDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import FacultyAdvisorDashboard from './src/screens/FacultyAdvisorDashboard';
import CourseDetailScreen from './src/screens/CourseDetailScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#0f172a',
          },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        ) : (
          <>
            {role === 'student' && (
              <Stack.Screen 
                name="StudentDashboard" 
                component={StudentDashboard}
                options={{ title: 'Student Dashboard' }}
              />
            )}
            {(role === 'faculty' || role === 'teacher') && (
              <Stack.Screen 
                name="FacultyDashboard" 
                component={FacultyDashboard}
                options={{ title: 'Faculty Dashboard' }}
              />
            )}
            {role === 'admin' && (
              <Stack.Screen 
                name="AdminDashboard" 
                component={AdminDashboard}
                options={{ title: 'Admin Dashboard' }}
              />
            )}
            {role === 'faculty_advisor' && (
              <Stack.Screen 
                name="FacultyAdvisorDashboard" 
                component={FacultyAdvisorDashboard}
                options={{ title: 'Faculty Advisor Dashboard' }}
              />
            )}
            <Stack.Screen 
              name="CourseDetail" 
              component={CourseDetailScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
