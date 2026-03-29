import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./src/page/Home/Home";
import FormScreen from "./src/page/FormScreen/Formulario";
import Calculadora from "./src/page/Calculadora/calculadora";
import Tabela from "./src/page/Tabela/tabela";

const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Formulario" component={FormScreen} />
        <Stack.Screen name="Calculadora" component={Calculadora} />
        <Stack.Screen name="Tabela" component={Tabela} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}