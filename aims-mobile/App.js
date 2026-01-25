import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Pages (from src/)
import Login from "./src/pages/Login";
import RoleLoader from "./src/pages/RoleLoader";

import StudentDashboard from "./src/pages/student/StudentDashboard";
import FacultyDashboard from "./src/pages/faculty/FacultyDashboard";
import AdminDashboard from "./src/pages/admin/AdminDashboard";
import FacultyBulkEnroll from "./src/pages/faculty/FacultyBulkEnroll";

// Components (from src/)
import MeetingScheduler from "./src/components/MeetingScheduler";
import ProtectedRoute from "./src/components/ProtectedRoute";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* Public */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="RoleLoader" component={RoleLoader} />

        {/* Student */}
        <Stack.Screen name="Student">
          {(props) => (
            <ProtectedRoute allow={["student"]} {...props}>
              <StudentDashboard />
            </ProtectedRoute>
          )}
        </Stack.Screen>

        {/* Faculty */}
        <Stack.Screen name="Faculty">
          {(props) => (
            <ProtectedRoute allow={["faculty"]} {...props}>
              <FacultyDashboard />
            </ProtectedRoute>
          )}
        </Stack.Screen>

        <Stack.Screen name="FacultyBulkEnroll">
          {(props) => (
            <ProtectedRoute allow={["faculty"]} {...props}>
              <FacultyBulkEnroll />
            </ProtectedRoute>
          )}
        </Stack.Screen>

        <Stack.Screen name="FacultyMeetings">
          {(props) => (
            <ProtectedRoute allow={["faculty"]} {...props}>
              <MeetingScheduler userRole="faculty" />
            </ProtectedRoute>
          )}
        </Stack.Screen>

        {/* Admin */}
        <Stack.Screen name="Admin">
          {(props) => (
            <ProtectedRoute allow={["admin"]} {...props}>
              <AdminDashboard />
            </ProtectedRoute>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
