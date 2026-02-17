import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, FlatList, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Calculadora({ route, navigation }) {
    const { tipo, numero, nome, foto, fontSize, resultadoAnterior, isEditing, id } = route.params || {} // <--- tem trazer a fonte e esatr puxadno tudo ok

    const [valorAtual, setValorAtual] = useState("0")
    const [valorAnterior, setValorAnterior] = useState(null)
    const [operacao, setOperacao] = useState(null)
    
    // aarmazenda historico de calculos
    const [contaTexto, setContaTexto] = useState("")
    const [historicoSessao, setHistoricoSessao] = useState("")

    const [historicoProduto, setHistoricoProduto] = useState([])
    const [modalHistorico, setModalHistorico] = useState(false)

    const abrirHistoricoCompleto = () => {
        setModalHistorico(true)
    }

    useEffect(() => {
        const buscarHistorico = async () => {
            const storage = await AsyncStorage.getItem("@anotacoes")
            if (storage) {
                const lista = JSON.parse(storage)

                const filtrado = lista
                    .filter(item => item.nome === nome && item.tipo === tipo).reverse()
                    .slice(0, 3)
                setHistoricoProduto(filtrado)
            }
        }
        buscarHistorico()
    }, [nome, tipo])

    useEffect(() => {
        if (resultadoAnterior) {
            const valorTratado = resultadoAnterior.toString().replace(",", ".")
            setValorAtual(valorTratado)
        }
    }, [resultadoAnterior])

    const formatarMilhar = (num) => {
        if (num === undefined || num === null) return "0"
        let [inteiro, decimal] = num.split(".")

        inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        return decimal !== undefined ? `${inteiro},${decimal}` : inteiro
    }

    const digitarNumero = (num) => {
        if (valorAtual.replace(".", "").length >= 15) return
        setValorAtual(prev => (prev === "0" && num !== "." ? String(num) : prev + num))
    }

    {/* colocar depois o clique para selecionar 100,00 invez de apagar tudo so clica onde que editar  */}
    const selecionarOperacao = (op) => {
        setOperacao(op)
        setValorAnterior(valorAtual)
        setContaTexto(`${valorAtual} ${op}`) // formato da exibição dos calculsos passado  AQUI ------
        setValorAtual("0")
    }
    
    {/* apagar 1 por 1 */}
    const apagarUm = () => {
        if (valorAtual.length === 1) {
            setValorAtual("0")
        } else {
            setValorAtual(valorAtual.slice(0, -1))
        }
    }

    // teste
    const calcular = () => {
        if (!operacao || valorAnterior === null) return

        const atual = parseFloat(valorAtual)
        const anterior = parseFloat(valorAnterior)
        let resultado = 0

        switch (operacao) {
            case "+": resultado = anterior + atual; break;
            case "-": resultado = anterior - atual; break;
            case "×": resultado = anterior * atual; break;
            case "÷": resultado = atual === 0 ? 0 : anterior / atual; break;
        }

        const formatado = Number(resultado.toFixed(3)).toString()
        const contaFinalizada = `${valorAnterior} ${operacao} ${valorAtual} = ${formatado}`

        setHistoricoSessao(prev => [contaFinalizada, ...prev])
        setContaTexto("")
        setValorAtual(formatado)
        setOperacao(null)
        setValorAnterior(null)
    }
    
    {/* limpar tudo */}
    const limpar = () => {
        setValorAtual("0")
        setValorAnterior(null)
        setOperacao(null)
        setContaTexto("")
        setHistoricoSessao([])
    }

    {/* salvar o historico inteiro */}
    const finalizarAnotacao = async () => {
        try {
            const storage = await AsyncStorage.getItem("@anotacoes")
            
            let lista = storage ? JSON.parse(storage) : []

            const valorParaSalvar = parseFloat(valorAtual).toFixed(3).replace(".", ",")

            // adição no storage AQUI -------------- 
            const itemEditado = {
                id: id || Date.now().toString(),
                tipo, numero, nome, foto, 
                resultado: valorParaSalvar,
                contaFeita: historicoSessao,
                data: new Date().toLocaleDateString("pt-BR")
            }

            if (isEditing && id) {
                lista = lista.map(item => item.id === id ? itemEditado : item)
            } else {
                lista.push(itemEditado)
            }

            await AsyncStorage.setItem("@anotacoes", JSON.stringify(lista))
            navigation.navigate("Tabela")
        } catch (e) {
            Alert.alert("Erro", "Falha ao salvar.")
        }
    }


    return (
        <View style={styles.container}>
            {/* informacao do que esat editando */}
            <View style={styles.header}>
                <Text style={[styles.headerTxt, { fontSize: fontSize - 6 }]}>
                    {isEditing ? (
                        <Text style={{ color: "#FF9800" }}>
                            📝 EDITANDO: {tipo} {nome} (Nº {numero})
                        </Text>
                    ) : (
                        <Text>
                            + ADIÇÃO: {tipo} {nome} (Nº {numero})
                        </Text>
                    )}
                </Text>

            </View>

            {/* o visor dos calculos */}
            <View style={styles.visor}>
                <TouchableOpacity style={styles.btnAbrirHistorico} onPress={abrirHistoricoCompleto}>
                    <Text style={{ fontSize: 24 }}>📜</Text>
                </TouchableOpacity>

                <Text style={styles.historicoTextoSuperior}>{contaTexto}</Text>

                <TextInput
                    style={[styles.visorText, { fontSize: fontSize * 1.5 }]}
                    value={formatarMilhar(valorAtual)}
                    showSoftInputOnFocus={false}
                    textAlign="right"
                    onChangeText={(t) => setValorAtual(t.replace(/\./g, "").replace(",", "."))}
                />
            </View>

            {/* etcaldos masi e menos  */}
            <View style={styles.teclado}>
                <View style={styles.numerosGrid}>
                    {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, "."].map((n) => (
                        <TouchableOpacity
                            key={n}
                            style={[styles.btn, { width: n === 0 ? "64%" : "30%" }]}
                            onPress={() => digitarNumero(n)}
                        >
                            <Text style={[styles.btnTxt, { fontSize: fontSize }]}>{n === "." ? "," : n}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={[styles.btn, styles.btnC, { width: "30%" }]} onPress={limpar}>
                        <Text style={[styles.btnTxt, { fontSize: fontSize }]}>C</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btn, styles.btnApagar, { width: "64%" }]} onPress={apagarUm}>
                        <Text style={[styles.btnTxt, { fontSize: fontSize }]}>⌫</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.operacoesGrid}>
                    {["÷", "×", "-", "+"].map((op) => (
                        <TouchableOpacity
                            key={op}
                            style={[styles.btnOp, op === "+" && { backgroundColor: "#FF9800" }]}
                            onPress={() => selecionarOperacao(op)}
                        >
                            <Text style={styles.btnTxtOp}>{op}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.btnIgual} onPress={calcular}>
                        <Text style={styles.btnTxtOp}>=</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* confrimar tem que deixar no final depois  */}
            <TouchableOpacity style={styles.btnFinalizar} onPress={finalizarAnotacao}>
                <Text style={[styles.finalizarTxt, { fontSize: fontSize }]}>
                    {isEditing ? "CONFIRMAR EDIÇÃO ✅" : "FINALIZAR ✅"}
                </Text>
            </TouchableOpacity>



            {/*coreção no historico   */}

            {/* MODAL DO HISTORICO AQUI  */}
            <Modal visible={modalHistorico} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalConteudo}>
                        <Text style={styles.modalTitulo}>Histórico de {nome}</Text>
                        <FlatList
                            data={[...historicoSessao, ...historicoProduto.map(p => p.contaFeita)]}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => {
                                if (!item) return null
                                return (
                                    <TouchableOpacity
                                        style={styles.itemHistorico}
                                        onPress={() => {
                                            const partes = String(item).split("=")
                                            if (partes[1]) {
                                                setValorAtual(partes[1].trim().replace(",", "."))
                                                setModalHistorico(false)
                                            }
                                        }}
                                    >
                                        <Text style={styles.txtItemConta}>{String(item).replace(/\|/g, "\n")}</Text>
                                        <Text style={styles.txtDica}>📥 Tocar para carregar</Text>
                                    </TouchableOpacity>
                                )
                            }}
                            ListEmptyComponent={<Text style={{ textAlign: "center", color: "#999" }}>Sem histórico</Text>}
                        />
                        <TouchableOpacity style={styles.btnFechar} onPress={() => setModalHistorico(false)}>
                            <Text style={{ color: "white", fontWeight: "bold" }}>FECHAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>







        </View>
    )
}

// fazer desing da calculadora samung
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#3c3c3c",
        padding: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // Fundo escurecido
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalConteudo: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 10,
    },
    modalTitulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    itemHistoricoDetalhado: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3', // Cor azul para destacar
    },
    dataHistorico: {
        fontSize: 12,
        color: '#999',
    },
    contaHistorico: {
        fontSize: 16,
        color: '#444',
        marginVertical: 4,
        fontFamily: 'monospace', // Dá cara de calculadora
    },
    resultadoHistorico: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    btnFecharModal: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 15,
    },
    header: {
        padding: 5,
        alignItems: "center"
    },
    headerTxt: {
        color: "#4CAF50",
        fontWeight: "bold"
    },
    visor: {
        backgroundColor: "white",
        marginVertical: 15,
        padding: 15,
        borderRadius: 15,
        alignItems: "flex-end",
        minHeight: 100,
        elevation: 5
    },
    historico: {
        color: "#888",
        fontSize: 20
    },
    visorText: {
        fontWeight: "bold",
        color: "black"
    },
    teclado: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    numerosGrid: {
        width: "72%",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10
    },
    operacoesGrid: {
        width: "25%",
        gap: 10
    },
    btn: {
        backgroundColor: "#555",
        height: 75,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#777"
    },
    btnOp: {
        backgroundColor: "#607D8B",
        height: 68,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center"
    },
    btnIgual: {
        backgroundColor: "#4CAF50",
        height: 100,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center"
    },
    btnC: {
        backgroundColor: "#F44336"
    },
    btnTxt: {
        color: "white",
        fontWeight: "bold"
    },
    btnTxtOp: {
        color: "white",
        fontWeight: "bold",
        fontSize: 35
    },
    btnFinalizar: {
        backgroundColor: "#2196F3",
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
        marginTop: "auto",
        marginBottom: 10
    },
    finalizarTxt: {
        color: "white",
        fontWeight: "bold"
    }
});