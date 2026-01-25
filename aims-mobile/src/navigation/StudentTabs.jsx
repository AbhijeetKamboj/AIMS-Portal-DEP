import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import StudentAcademics from "../pages/student/StudentAcademics";
import Offerings from "../pages/student/Offerings";
import GPAView from "../pages/student/GPAView";
import Transcript from "../pages/student/Transcript";

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "Academics":
              return <Ionicons name="school" size={size} color={color} />;
            case "Register":
              return <Ionicons name="add-circle" size={size} color={color} />;
            case "GPA":
              return <MaterialIcons name="grade" size={size} color={color} />;
            case "Transcript":
              return (
                <Ionicons name="document-text" size={size} color={color} />
              );
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Academics" component={StudentAcademics} />
      <Tab.Screen name="Register" component={Offerings} />
      <Tab.Screen name="GPA" component={GPAView} />
      <Tab.Screen name="Transcript" component={Transcript} />
    </Tab.Navigator>
  );
}
