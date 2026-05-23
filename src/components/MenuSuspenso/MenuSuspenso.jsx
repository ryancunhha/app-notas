import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from "react-native";

const { width: LARGURA_TELA } = Dimensions.get("window");

export default function MenuSuspenso({ visivel, aoFechar, posicaoBotao, versao, acoes }) {
    if (!visivel || !posicaoBotao) return null;

    const LARGURA_MENU = 180;
    const { x, y, width, height } = posicaoBotao;

    const topoMenu = y + height + 5;

    let esquerdaMenu = x;

    if (x + LARGURA_MENU > LARGURA_TELA) {
        esquerdaMenu = x + width - LARGURA_MENU;
    }

    return (
        <Modal transparent={true} visible={visivel} animationType="fade" onRequestClose={aoFechar}>
            <TouchableOpacity activeOpacity={1} onPress={aoFechar}>
                <View style={[{ top: topoMenu, left: esquerdaMenu, width: LARGURA_MENU }]}>
                    {versao === "postIt" && (
                        <View>
                            <TouchableOpacity onPress={() => { acoes.aoEditar(); aoFechar(); }}>
                                <Text>Editar</Text>
                            </TouchableOpacity>

                            {false && (<TouchableOpacity onPress={() => { acoes.aoVerImagem(); aoFechar(); }}>
                                <Text>Ver Imagem</Text>
                            </TouchableOpacity>)}

                            <TouchableOpacity onPress={() => { acoes.aoExcluir(); aoFechar(); }}>
                                <Text>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    {versao === "filtro" && (
                        <View>
                            <TouchableOpacity onPress={() => { acoes.aoLimparTudo(); aoFechar(); }}>
                                <Text>Excluir Tudo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { acoes.aoCompartilhar(); aoFechar(); }}>
                                <Text>Compartilhar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    )
}