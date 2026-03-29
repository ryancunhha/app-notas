import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen({ navigation }) {
    const [fontSize, setFontSize] = useState(16);
    const intervalRef = useRef(null);

    useEffect(() => {
        const carregarFonte = async () => {
            const salvo = await AsyncStorage.getItem("@config_font_size");
            if (salvo) setFontSize(parseInt(salvo));
        };
        carregarFonte();
    }, []);

    const aumentarFonte = () => {
        setFontSize(prev => {
            const novo = Math.min(prev + 1, 38);
            AsyncStorage.setItem("@config_font_size", novo.toString());
            return novo;
        });
    };

    const diminuirFonte = () => {
        setFontSize(prev => {
            const novo = Math.max(prev - 1, 12)
            AsyncStorage.setItem("@config_font_size", novo.toString());
            return novo;
        });
    };

    const iniciarAjuste = (tipo) => {
        if (intervalRef.current) return;
        
        const acao = tipo === "mais" ? aumentarFonte : diminuirFonte
        
        intervalRef.current = setInterval(() => {
            acao();
        }, 80); 
    };

    const pararAjuste = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

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
                    <TouchableOpacity onPress={aumentarFonte} onLongPress={() => iniciarAjuste("mais")} onPressOut={pararAjuste}>
                        <Text >A+</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={diminuirFonte} onLongPress={() => iniciarAjuste("menos")} onPressOut={pararAjuste} >
                        <Text >A-</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({})