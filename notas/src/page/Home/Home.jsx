import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function HomeScreen({ navigation, route }) {
    const [fontSize, setFontSize] = useState(24)

    useEffect(() => {
        if (route.params?.fontSize) {
            setFontSize(route.params.fontSize)
        }
    }, [route.params?.fontSize])

    return (
        <View style={styles.container}>

            <Text style={[styles.title, { fontSize: fontSize + 8 }]}>Anotações</Text>

            <View style={styles.menuContainer}>

                <TouchableOpacity style={[styles.button, styles.btnAnotar]} onPress={() => navigation.navigate("Tipo", { fontSize: fontSize })}>
                    <Text style={[styles.buttonText, { fontSize: fontSize }]}>📝 ANOTAR</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.btnVer]} onPress={() => navigation.navigate("Tabela", { fontSize: fontSize })}>
                    <Text style={[styles.buttonText, { fontSize: fontSize }]}>📋 VER ANOTAÇÕES</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.accessibilityControll}>
                <Text style={{ fontSize: 16, color: "white" }}>Ajustar tamanho da letra:</Text>

                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => setFontSize(fontSize - 2)} style={styles.smallBtn}>
                        <Text>-</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setFontSize(fontSize + 2)} style={styles.smallBtn}>
                        <Text>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#3c3c3c",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontWeight: "bold",
        marginBottom: 40,
        color: "white",
        textAlign: "center",
    },
    menuContainer: {
        width: "90%",
        gap: 20,
    },
    button: {
        paddingVertical: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    btnAnotar: {
        backgroundColor: "#4CAF50",
    },
    btnVer: {
        backgroundColor: "#2196F3",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    accessibilityControll: {
        marginTop: 30,
        alignItems: "center",
    },
    smallBtn: {
        backgroundColor: "white",
        padding: 15,
        marginHorizontal: 10,
        borderRadius: 10,
        width: 50,
        alignItems: "center"
    }
})