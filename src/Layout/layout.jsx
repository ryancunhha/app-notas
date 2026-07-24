import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

export default function Layout({ children }) {
    return (
        <SafeAreaView edges={["top", "bottom"]}
            style={{
                flex: 1,
                backgroundColor: "#fff",
            }}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {children}
        </SafeAreaView>
    )
}