import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./src/page/Home/Home";
import FormScreen from "./src/page/FormScreen/Formulario";

const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Bloco De Notas">
        <Stack.Screen name="Bloco De Notas" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FormScreen" component={FormScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}