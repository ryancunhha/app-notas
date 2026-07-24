import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from "react-native";

export default function MenuSuspenso({ visivel, aoFechar, versao, acoes }) {
    if (!visivel) return null;

    return (
        <Modal transparent={true} visible={visivel} onRequestClose={aoFechar}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={aoFechar}>
                <View style={styles.container}>
                    <View style={styles.conteudo}>
                        {versao === "filtro" && (
                            <>
                                <TouchableOpacity style={styles.botao} onPress={() => { acoes.aoCompartilhar(); aoFechar(); }}>
                                    <Text style={styles.texto}>Compartilhar tabela</Text>
                                </TouchableOpacity>

                                {false && (
                                    <TouchableOpacity style={styles.botao} onPress={() => { null; aoFechar(); }}>
                                        <Text style={styles.texto}>Ampliar</Text>
                                    </TouchableOpacity>
                                )}

                                {false && (
                                    <TouchableOpacity style={{ paddingVertical: 10, paddingHorizontal: 12 }} onPress={() => { null; aoFechar(); }}>
                                        <Text style={styles.texto}>Notificação</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity style={styles.botao} onPress={() => { acoes.aoLimparTudo(); aoFechar(); }}>
                                    <Text style={[styles.texto, { color: "#FF5252" }]}>Limpar Tudo</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

const styles = StyleSheet.create({
    // Fundo
    overlay: {
        flex: 1,
    },

    // Container
    container: {
        position: "absolute",
        top: 124,
        width: Dimensions.get("window").width,
        alignItems: "center"
    },
    conteudo: {
        backgroundColor: "#1E1E1E",
        borderRadius: 8,
        paddingVertical: 5,
        minWidth: 260,
    },

    // Botão
    botao: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        paddingHorizontal: 18,
    },

    // Texto
    texto: {
        color: "#FFF",
        fontSize: 17,
        fontWeight: "600",
    },
})