import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function Tipo({ route, navigation }) {
    const params = route.params || {}
    const dynamicFontSize = params.fontSize || 24

    const [tipoSelecionado, setTipoSelecionado] = useState(params.tipo || "")
    const [numero, setNumero] = useState("")
    const [nome, setNome] = useState("")

    //camera
    const [cameraVisivel, setCameraVisivel] = useState(false)
    const [foto, setFoto] = useState(null)
    
    // testando a camera ta acho que estar dando err o no expo aqui corrigir depois
    const [permission, requestPermission] = useCameraPermissions()
    const cameraRef = useRef(null)

    const tirarFoto = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync()

            setFoto(photo.uri)
            setCameraVisivel(false)
        }
    }

    const opcoes = ["Vazio", "Entrada", "Perda", "Produção"]

    const getCorTipo = (tipo, active) => {
        if (!active) return "#555"

        switch (tipo) {
            case "Entrada": return "#4CAF50"
            case "Perda": return "#F44336"
            case "Produção": return "#4c0e57"
            default: return "#757575"
        }
    }

    const avancar = () => {
        if (!tipoSelecionado || !numero || !nome) {
            alert("Preencha os campos: Tipo, Número e Nome!")
            return
        }

        navigation.navigate("Calculadora", { tipo: tipoSelecionado, numero, nome, foto, fontSize: dynamicFontSize })
    }

    return (
        <ScrollView style={styles.container}>

            <Text style={[styles.label, { fontSize: dynamicFontSize }]}>Selecione o Tipo:</Text>
            
            {/* tipo de coisa predefinica */}
            <View style={styles.rowWrap}>
                {opcoes.map((op) => {
                    const isActive = op === "Vazio" ? tipoSelecionado === "" : tipoSelecionado === op
                    const corBotao = getCorTipo(op, isActive)

                    return (
                        <TouchableOpacity key={op} style={[styles.btnRedondo, { backgroundColor: corBotao, borderColor: isActive ? "white" : "#777" }]} onPress={() => { if (op === "Vazio") { setTipoSelecionado("") } else { setTipoSelecionado(op) } }}>
                            <Text style={[styles.btnText, { fontSize: dynamicFontSize - 6 }]}>
                                {op}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            <TextInput style={[styles.inputCustom, { fontSize: dynamicFontSize - 4 }]} value={tipoSelecionado} onChangeText={setTipoSelecionado} placeholder="Personalizar tipo..." placeholderTextColor="#999" />

            <View style={styles.divisor} /> {/* hr */}

            <Text style={[styles.label, { fontSize: dynamicFontSize }]}>Dados do Produto:</Text>

            <Text style={[styles.label, { fontSize: dynamicFontSize }]}>Numero:</Text>
            <TextInput style={[styles.input, { fontSize: dynamicFontSize }]} keyboardType="numeric" value={numero} onChangeText={setNumero} placeholder="Número (ex: 123)" />
            
            <Text style={[styles.label, { fontSize: dynamicFontSize }]}>Nome:</Text>
            <TextInput style={[styles.input, { fontSize: dynamicFontSize }]} value={nome} onChangeText={setNome} placeholder="Nome (ex: Arroz)" />

            {/* tirar foto */}
            <TouchableOpacity style={styles.btnCamera} onPress={async () => {
                const { granted } = await requestPermission()
                if (granted) setCameraVisivel(true)
                else alert("Permissão de câmera negada!")
            }}>
                <Text style={[styles.btnCameraText, { fontSize: dynamicFontSize - 4 }]}>
                    📸 {foto ? "TROCAR FOTO" : "TIRAR FOTO DA ETIQUETA"}
                </Text>
            </TouchableOpacity>

            {/* como ficou preview */}
            {foto && <Image source={{ uri: foto }} style={styles.previewFoto} />}

            {/* tirar foto */}
            <Modal visible={cameraVisivel} animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'black' }}>
                    <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} />
                    <View style={styles.overlayCamera}>
                        <TouchableOpacity style={styles.btnFechar} onPress={() => setCameraVisivel(false)}>
                            <Text style={styles.btnFecharTxt}>✕</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.areaBotaoCaptura}>
                            <TouchableOpacity style={styles.btnCapturar} onPress={tirarFoto}>
                                <View style={styles.circuloInterno} />
                            </TouchableOpacity>
                            <Text style={{ color: "white", marginTop: 10, fontWeight: "bold" }}>TIRAR FOTO</Text>
                        </View>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={styles.btnAvancar} onPress={avancar}>
                <Text style={[styles.btnAvancarText, { fontSize: dynamicFontSize }]}>AVANÇAR</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    previewFoto: {
        width: "100%",
        height: 200,
        borderRadius: 15,
        marginBottom: 5
    },
    overlayCamera: {
        flex: 1,
        backgroundColor: "transparent",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 50
    },
    areaBotaoCaptura: {
        alignItems: "center",
        justifyContent: "center",
    },
    btnCapturar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 5,
        borderColor: "white"
    },
    circuloInterno: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "white"
    },
    btnFechar: {
        position: "absolute",
        top: 50,
        right: 30,
        backgroundColor: "rgba(255, 0, 0, 0.7)",
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10
    },
    btnFecharTxt: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold"
    },
    btnCamera: {
        backgroundColor: "#607D8B",
        padding: 20,
        borderRadius: 15,
        alignItems: "center",
        marginBottom: 25,
        borderWidth: 1,
        borderColor: "#90A4AE"
    },
    btnCameraText: {
        color: "white",
        fontWeight: "bold"
    },
    container: {
        flex: 1,
        padding: 20,
        paddingVertical: 15,
        backgroundColor: "#3c3c3c"
    },
    label: {
        fontWeight: "bold",
        color: "white",
        marginBottom: 15
    },
    rowWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 15
    },
    btnRedondo: {
        paddingVertical: 8,
        borderRadius: 50,
        width: "47%",
        alignItems: "center",
        borderWidth: 2,
        elevation: 3,
    },
    btnText: {
        color: "white",
        fontWeight: "bold"
    },
    inputCustom: {
        backgroundColor: "#444",
        color: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#666"
    },
    divisor: {
        height: 2,
        backgroundColor: "#555",
        marginVertical: 20
    },
    input: {
        backgroundColor: "white",
        padding: 18,
        borderRadius: 15,
        marginBottom: 20,
        color: "black"
    },
    btnAvancar: {
        backgroundColor: "#2196F3",
        padding: 25,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 60,
        elevation: 5
    },
    btnAvancarText: {
        color: "white",
        fontWeight: "bold"
    }
})