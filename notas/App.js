import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./src/page/Home/Home";
import Tipo from "./src/page/Tipo/Tipo";
import Tabela from "./src/page/Tabela/Tabela";
import Calculadora from "./src/page/Calculadora/calculadora";

const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
        <Stack.Screen name="Tipo" component={Tipo} options={{ title: "Configuração" }} />
        <Stack.Screen name="Calculadora" component={Calculadora} options={{ title: "Calculadora" }} />
        <Stack.Screen name="Tabela" component={Tabela} options={{ title: "Tabela" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

{/* notificação em 1 semana */ }
{/* fazer que o usuario consiga sair do aplicativo e salva de onde parou, tipo saiu, fecho ou app ele volta do ponto exato de onde parou */ }