import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
    const [fontSize, setFontSize] = useState(16);
    const aumentarFonte = () => setFontSize(prev => Math.min(prev + 2, 30));
    const diminuirFonte = () => setFontSize(prev => Math.max(prev - 2, 12));

    return (
        <View>
            <Text style={[{ fontSize }]}>Anotações</Text>

            <View>
                <TouchableOpacity onPress={() => navigation.navigate("Formulario", { fontSize: fontSize })} >
                    <Text style={[{ fontSize }]}>📝 ANOTAR</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Tabela")} >
                    <Text style={[{ fontSize }]}>📋 VER ANOTAÇÕES</Text>
                </TouchableOpacity>
            </View>

            <View>
                <Text style={[{ fontSize }]}>Segure para ajustar tamanho da letra:</Text>

                <View>
                    <TouchableOpacity onPress={aumentarFonte}>
                        <Text style={styles.accButtonText}>A+</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={diminuirFonte}>
                        <Text style={styles.accButtonText}>A-</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({})