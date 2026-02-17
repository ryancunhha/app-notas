import { useState, useEffect, useMemo, useRef } from "react";
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Share, Image, ScrollView, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function Tabela({ navigation, route }) {
    const params = route.params || {}
    const dynamicFontSize = params.fontSize || 24 // <---- fonte  

    // camera
    const [permissao, solicitarPermissao] = useCameraPermissions() 
    const [modalCameraVisivel, setModalCameraVisivel] = useState(false)
    const cameraRef = useRef(null)

    // modal da foto
    const [fotoZoom, setFotoZoom] = useState(null)
    const [modalZoomVisivel, setModalZoomVisivel] = useState(false)

    const tirarFotoEdicao = async () => {
        if (!permissao?.granted) {
            const { granted } = await solicitarPermissao()
            if (!granted) {
                Alert.alert("Erro", "Você precisa dar permissão para usar a câmera.")
                return
            }
        }
        setModalCameraVisivel(true)
    }

    const capturarFotoReal = async () => {
        if (cameraRef.current) {
            const foto = await cameraRef.current.takePictureAsync({ quality: 0.5 })

            setItemParaEditar({ ...itemParaEditar, foto: foto.uri })
            setModalCameraVisivel(false)
        }
    }

    const [listaCompleta, setListaCompleta] = useState([])
    const [listaFiltrada, setListaFiltrada] = useState([])
    const [filtro, setFiltro] = useState("Todos")

    const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false)
    const [itemParaEditar, setItemParaEditar] = useState(null)
    const [novoValor, setNovoValor] = useState("")

    const abrirEdicao = (item) => {
        setItemParaEditar(item)
        setNovoValor(item.resultado.toString())
        setModalEdicaoVisivel(true)
    }

    const salvarEdicao = async () => {
        if (!itemParaEditar) return

        const listaAtualizada = listaCompleta.map(item => {
            if (item.id === itemParaEditar.id) {
                return {
                    ...itemParaEditar,
                    resultado: novoValor 
                }
            }
            return item
        })

        try {
            await AsyncStorage.setItem("@anotacoes", JSON.stringify(listaAtualizada))
            setListaCompleta(listaAtualizada)

            if (filtro === "Todos") {
                setListaFiltrada(listaAtualizada)
            } else {
                const busca = filtro === "Vazio" ? " " : filtro
                setListaFiltrada(listaAtualizada.filter(i => i.tipo === busca))
            }

            setModalEdicaoVisivel(false)
            Alert.alert("Sucesso", "Anotação atualizada!")
        } catch (e) {
            Alert.alert("Erro", "Falha ao salvar modificações.")
        }
    }

    // testando tempo de não exclusão 
    const [modalVisivel, setModalVisivel] = useState(false)
    const [segundosRestantes, setSegundosRestantes] = useState(5) //  <----------------  tempo de sair AQUI  o modal para não exlcuir 
    const timerRef = useRef(null)

    const abrirAvisoLimpeza = () => {
        setSegundosRestantes(5)
        setModalVisivel(true)

        timerRef.current = setInterval(() => {
            setSegundosRestantes((prev) => {
                if (prev <= 1) {
                    fecharSemApagar()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const fecharSemApagar = () => {
        clearInterval(timerRef.current)
        setModalVisivel(false)
    }

    const confirmarLimpezaReal = async () => {
        clearInterval(timerRef.current)
        await AsyncStorage.removeItem("@anotacoes")
        setListaCompleta([])
        setListaFiltrada([])
        setFiltro("Todos")
        setModalVisivel(false)
    }

    const botoesDeFiltro = useMemo(() => {
        const base = ["Todos", "Entrada", "Perda", "Produção"]
        const tiposExistentes = listaCompleta.map(item => item.tipo === " " ? "Vazio" : item.tipo)
        const unicos = [...new Set([...base, ...tiposExistentes])]
        return unicos.filter(t => (t && t.trim() !== "") || t === "Vazio")
    }, [listaCompleta])

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", carregarDados)
        return unsubscribe
    }, [navigation])

    // tem que ver a edição da calculadora
    const carregarDados = async () => {
        const dados = await AsyncStorage.getItem("@anotacoes")

        if (dados) {
            let parsed = JSON.parse(dados)

            parsed.sort((a, b) => parseInt(a.numero) - parseInt(b.numero))

            setListaCompleta(parsed)
            setListaFiltrada(parsed)
        } else {
            setListaCompleta([])
            setListaFiltrada([])
        }
    }

    const filtrar = (tipo) => {
        setFiltro(tipo)
        if (tipo === "Todos") {
            setListaFiltrada(listaCompleta)
        } else {
            const termoBusca = tipo === "Vazio" ? " " : tipo
            setListaFiltrada(listaCompleta.filter(item => item.tipo === termoBusca))
        }
    }

    // formato de exporta
    const compartilharRelatorio = async () => {
        let texto = `*RELATÓRIO - ${filtro.toUpperCase()}*\n\n`

        listaFiltrada.forEach(item => {
            texto += `📍 *${item.tipo}*\n📦 ${item.nome} (${item.numero}º)\n📊 Resultado: ${item.resultado}\n📅 ${item.data}\n-----------\n`
        })

        try {
            await Share.share({ message: texto })
        } catch (error) {
            alert("Erro ao compartilhar")
        }
    }

    const getCorPorTipo = (tipo) => {
        switch (tipo) {
            case "Entrada": return "#4CAF50"
            case "Perda": return "#F44336"
            case "Produção": return "#4c0e57"
            case "Vazio": case " ": return "#757575"
            default: return "#2196F3"
        }
    }

    return (
        <View style={styles.container}>

            {/* filtro com cores */}
            <View style={styles.headerFiltros}>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, padding: 5 }}>
                    {botoesDeFiltro.map(f => {
                        let corFiltro = "#666"
                        if (f === "Todos") corFiltro = "#2196F3"
                        if (f === "Entrada") corFiltro = "#4CAF50"
                        if (f === "Perda") corFiltro = "#F44336"
                        if (f === "Produção") corFiltro = "#4c0e57"

                        return (
                            <TouchableOpacity key={f} onPress={() => filtrar(f)}
                                style={[
                                    styles.btnFiltro,
                                    { backgroundColor: filtro === f ? "#333" : corFiltro }
                                ]}
                            >
                                <Text style={[styles.txtFiltro, { fontSize: dynamicFontSize - 8 }]}>{f}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>

            {/* anotações a tablea */}
            <FlatList data={listaFiltrada} keyExtractor={item => item.id} contentContainerStyle={{ paddingBottom: 180 }} renderItem={({ item }) => (


                <TouchableOpacity style={styles.card} onPress={() => abrirEdicao(item)}>

                    <View style={styles.cardHeader}>

                        <Text style={[
                            styles.txtTipo,
                            { fontSize: dynamicFontSize - 4, color: getCorPorTipo(item.tipo) }
                        ]}>
                            {item.tipo === " " ? "Vazio" : item.tipo}
                        </Text>

                        <Text style={styles.txtData}>{item.data}</Text>

                    </View>

                    <View style={styles.cardBody}>

                        {item.foto && (
                            <TouchableOpacity onPress={() => {
                                setFotoZoom(item.foto)
                                setModalZoomVisivel(true)
                            }}>
                                <Image source={{ uri: item.foto }} style={styles.miniFoto} />
                            </TouchableOpacity>
                        )}

                        <View style={{ flex: 1 }}>

                            <Text style={[styles.txtProduto, { fontSize: dynamicFontSize - 3 }]}>{`${item.nome} (Nº ${item.numero})`}</Text>

                            <Text style={[styles.txtResultado, { fontSize: dynamicFontSize }]}>{`${item.resultado}`}</Text>
                        </View>

                        <Text style={{ fontSize: 15 }}>✏️</Text>
                    </View>
                </TouchableOpacity>
            )} ListEmptyComponent={<Text style={styles.vazio}>Tabela vazia</Text>} />


            {/* expandi a foto */}
            <Modal visible={modalZoomVisivel} transparent={false} animationType="fade">
                <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
                    <TouchableOpacity
                        style={{ position: "absolute", top: 50, right: 30, zIndex: 10, backgroundColor: "rgba(255,255,255,0.3)", padding: 10, borderRadius: 20 }}
                        onPress={() => setModalZoomVisivel(false)}
                    >
                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 20 }}> FECHAR ✕ </Text>
                    </TouchableOpacity>

                    {fotoZoom && (
                        <Image
                            source={{ uri: fotoZoom }}
                            style={{ width: "100%", height: "80%", resizeMode: "contain" }}
                        />
                    )}
                </View>
            </Modal>

            {/* modal de edição, foto, nome, numero e etcs */}
            <Modal transparent={true} visible={modalEdicaoVisivel} animationType="slide" onRequestClose={() => setModalEdicaoVisivel(false)}>

                <View style={styles.modalOverlay}>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ width: "90%" }}>

                        <Text style={[styles.modalTitulo, { color: "#2196F3", textAlign: "center" }]}>EDITAR ANOTAÇÃO</Text>

                        {itemParaEditar?.foto ? (
                            <View style={{ position: "relative" }}>
                                <Image source={{ uri: itemParaEditar.foto }} style={styles.fotoExpandida} />
                                <TouchableOpacity
                                    style={styles.btnTrocarFoto}
                                    onPress={tirarFotoEdicao}
                                >
                                    <Text style={{ color: "white" }}>📸 TROCAR FOTO</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.btnAdicionarFotoEdicao}
                                onPress={tirarFotoEdicao}
                            >
                                <Text style={{ color: "white", fontWeight: "bold" }}>+ ADICIONAR FOTO</Text>
                            </TouchableOpacity>
                        )}

                        <Text style={styles.labelModal}>Mudar Tipo:</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
                            {["Entrada", "Perda", "Produção", " "].map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setItemParaEditar({ ...itemParaEditar, tipo: t })}
                                    style={[
                                        styles.btnFiltro,
                                        {
                                            backgroundColor: itemParaEditar?.tipo === t ? "#2196F3" : getCorPorTipo(t),
                                            paddingVertical: 8,
                                            minWidth: 70
                                        }
                                    ]}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                                        {t === " " ? "Vazio" : t}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.labelModal}>Nome do Produto:</Text>

                        <TextInput style={styles.inputPequeno} value={itemParaEditar?.nome} onChangeText={(txt) => setItemParaEditar({ ...itemParaEditar, nome: txt })} />

                        <Text style={styles.labelModal}>Número do Produto:</Text>

                        <TextInput style={styles.inputPequeno} value={itemParaEditar?.numero?.toString()} keyboardType="numeric" onChangeText={(txt) => setItemParaEditar({ ...itemParaEditar, numero: txt })} />

                        <Text style={styles.labelModal}>Quantidade / Resultado:</Text>

                        <TextInput style={styles.inputEdicao} value={novoValor} onChangeText={setNovoValor} keyboardType="numeric" />

                        <TouchableOpacity
                            style={styles.btnVoltarCalculadora}
                            onPress={() => {
                                setModalEdicaoVisivel(false)
                                navigation.navigate("Calculadora", {
                                    ...itemParaEditar,
                                    resultadoAnterior: novoValor,
                                    isEditing: true
                                })
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>🧮 AJUSTAR NA CALCULADORA</Text>
                        </TouchableOpacity>

                        <View style={styles.footerRow}>
                            <TouchableOpacity style={[styles.btnHome, { backgroundColor: '#4CAF50' }]} onPress={salvarEdicao}>
                                <Text style={styles.btnFooterTxt}>SALVAR ✅</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.btnZerar, { backgroundColor: '#999' }]} onPress={() => setModalEdicaoVisivel(false)}>
                                <Text style={styles.btnFooterTxt}>SAIR ✕</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.btnExcluirItem}
                                onPress={() => {
                                    Alert.alert("Excluir", "Deseja apagar esta anotação específica?", [
                                        { text: "Não", style: "cancel" },
                                        {
                                            text: "Sim, Excluir", style: "destructive", onPress: () => {
                                                const listaSemOItem = listaCompleta.filter(i => i.id !== itemParaEditar.id)
                                                AsyncStorage.setItem("@anotacoes", JSON.stringify(listaSemOItem))
                                                setListaCompleta(listaSemOItem)
                                                setListaFiltrada(listaSemOItem)
                                                setModalEdicaoVisivel(false)
                                            }
                                        }
                                    ])
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>🗑️ EXCLUIR ESTA ANOTAÇÃO</Text>
                            </TouchableOpacity>

                        </View>

                    </ScrollView>

                </View>
            </Modal>


            {/* footer home, excluir e exporta, com modal de exclusão */}
            <View style={styles.footer}>

                <TouchableOpacity style={styles.btnZap} onPress={compartilharRelatorio}>
                    <Text style={[styles.btnFooterTxt, { fontSize: dynamicFontSize - 4 }]}>EXPORTAR RELATÓRIO</Text>
                </TouchableOpacity>

                <View style={styles.footerRow}>

                    <Modal transparent={true} visible={modalVisivel} animationType="fade" onRequestClose={fecharSemApagar}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalConteudo}>
                                <Text style={styles.modalTitulo}>🚨 CUIDADO!</Text>

                                <Text style={styles.modalTexto}>Deseja apagar toda a tabela?</Text>

                                <View style={{ marginVertical: 20, gap: 10 }}>
                                    <TouchableOpacity style={styles.btnConfirmarLimpeza} onPress={confirmarLimpezaReal}>
                                        <Text style={styles.btnConfirmarTexto}>SIM, APAGAR TUDO</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={fecharSemApagar}>
                                        <Text style={styles.btnCancelarTexto}>{`NÃO, VOLTAR  (${segundosRestantes})`}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <TouchableOpacity style={styles.btnZerar} onPress={abrirAvisoLimpeza}>
                        <Text style={styles.btnFooterTxt}>🗑️ APAGAR TUDO</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnHome} onPress={() => navigation.navigate("Home", { fontSize: dynamicFontSize })}>
                        <Text style={styles.btnFooterTxt}>🏠 VOLTAR</Text>
                    </TouchableOpacity>

                </View>

            </View>


            {/* abre a camera */}
            <Modal visible={modalCameraVisivel} animationType="slide">
                <CameraView style={{ flex: 1 }} ref={cameraRef}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 }}>
                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <TouchableOpacity
                                style={{ backgroundColor: 'red', padding: 20, borderRadius: 50 }}
                                onPress={() => setModalCameraVisivel(false)}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>CANCELAR</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ backgroundColor: 'white', padding: 20, borderRadius: 50 }}
                                onPress={capturarFotoReal}
                            >
                                <Text style={{ color: 'black', fontWeight: 'bold' }}>📸 TIRAR FOTO</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </CameraView>
            </Modal>

        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#3c3c3c"
    },
    // a foto camera 
    btnAdicionarFotoEdicao: {
        backgroundColor: '#607D8B',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: 'white'
    },
    
    // foto expandida editar
    labelModal: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 16
    },
    inputPequeno: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 10,
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    inputEdicao: {
        backgroundColor: '#e3f2fd',
        width: '100%',
        padding: 15,
        borderRadius: 15,
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2196F3',
        marginVertical: 10,
        borderWidth: 2,
        borderColor: '#2196F3'
    },
    fotoExpandida: {
        width: '100%',
        height: 150,
        borderRadius: 15,
        marginBottom: 15,
        resizeMode: 'cover'
    },

    // filtro
    headerFiltros: {
        height: 50,
        alignItems: "center",
        justifyContent: "center"
    },
    btnFiltro: {
        backgroundColor: "#666",
        marginVertical: 0,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center"
    },
    btnFiltroAtivo: {
        backgroundColor: "#2196F3"
    },
    txtFiltro: {
        color: 'white',
        fontWeight: 'bold'
    },
    // anotações
    card: {
        backgroundColor: "white",
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 5
    },
    //titulo do card
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#777"
    },
    txtTipo: {
        fontWeight: "bold",
        color: "#2196F3"
    },
    txtData: {
        color: "#999",
        fontSize: 12
    },
    // card
    cardBody: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: "row",
        gap: 10,
        alignItems: "center"
    },
    miniFoto: {
        width: 70,
        height: 70,
        borderRadius: 5
    },
    txtProduto: {
        fontWeight: "bold",
        color: "#333"
    },
    txtResultado: {
        fontWeight: "bold",
        color: "#4CAF50",
        marginTop: 2
    },
    vazio: {
        color: "white",
        textAlign: "center",
        marginTop: 100,
        fontSize: 20
    },

    // MODAL STYLES
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalConteudo: {
        width: "85%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 25,
        alignItems: "center"
    },
    modalTitulo: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10
    },
    modalTexto: {
        fontSize: 17,
        textAlign: 'center',
        color: '#333',
        marginBottom: 5
    },
    modalAviso: { fontSize: 15, color: '#666', fontStyle: 'italic', marginBottom: 25 },
    inputEdicao: { backgroundColor: '#f0f0f0', width: '100%', padding: 20, borderRadius: 15, fontSize: 35, fontWeight: 'bold', textAlign: 'center', color: '#333', marginVertical: 20, borderWidth: 2, borderColor: '#2196F3' },

    // BUTTON STYLES
    btnConfirmarLimpeza: {
        color: "",
        alignItems: 'center',
        marginBottom: 15
    },

    btnConfirmarTexto: {
        color: "#2196F3",
        fontWeight: "bold",
        fontSize: 16
    },

    btnCancelarTexto: {
        backgroundColor: "#F44336",
        width: "100%",
        paddingHorizontal: "15%",
        paddingVertical: 10,
        color: "white",
        borderRadius: 15,
        fontWeight: "bold",
        fontSize: 18
    },

    footer: {
        position: "absolute",
        bottom: 0,
        paddingBottom: 48,
        width: "100%",
        padding: 10,
        backgroundColor: "#444"
    },
    footerRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10
    },
    btnZap: {
        backgroundColor: "#25D366",
        padding: 13,
        borderRadius: 5,
        alignItems: "center"
    },
    btnZerar: {
        backgroundColor: "#F44336",
        padding: 15,
        borderRadius: 5,
        alignItems: "center"
    },
    btnHome: {
        backgroundColor: "#607D8B",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        flex: 1
    },

    btnFooterTxt: { color: 'white', fontWeight: 'bold' }
})