import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

/*
OK AGORA Fomulario
*/

export default function FormScreen({ route, navigation }) {
    // DEPois de tira foto ver uma preview

    // FONTE
    const { fontSize } = route.params;

    // DADOS
    const [nome, setNome] = useState("");
    const [numero, setNumero] = useState("");
    const [tipo, setTipo] = useState("");
    const [tipoPersonalizado, setTipoPersonalizado] = useState(""); // Novo estado
    const [registrosExistentes, setRegistrosExistentes] = useState([]);

    // foto Permissões e Ref
    const [foto, setFoto] = useState(null);
    const [cameraVisivel, setCameraVisivel] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    const tipos = ["Entrada", "Saída", "Produção", "Personalizado"];

    // BUSCAR DADOS PARA VALIDAR DUPLICADOS
    useEffect(() => {
        const carregarParaValidar = async () => {
            const dados = await AsyncStorage.getItem("@minha_tabela_dados");
            if (dados) setRegistrosExistentes(JSON.parse(dados));
        };
        carregarParaValidar();
    }, []);

    const tirarFoto = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();

            setFoto(photo.uri);
            setCameraVisivel(false);
        }
    };

    const validarEAvancar = () => {
        let tipoFinal = tipo === "Personalizado" ? tipoPersonalizado : tipo;
        if (!tipoFinal) tipoFinal = "Todos";

        const jaExisteNome = registrosExistentes.some(r => r.nome.toLowerCase() === nome.toLowerCase());
        const jaExisteNumero = registrosExistentes.some(r => r.numero === numero);

        if (jaExisteNome) {
            // DEIXAR TEMPORARIO
            Alert.alert("Atenção", "Este NOME já está cadastrado!");
            return;
        }
        if (jaExisteNumero) {
            // DEIXAR TEMPORARIO
            Alert.alert("Atenção", "Este NÚMERO já está cadastrado!");
            return;
        }

        navigation.navigate("Calculadora", { nome, numero, tipo: tipoFinal, foto, fontSize });
    };

    return (
        <ScrollView>
            <Text style={{ fontSize }}>Nome:</Text>
            <TextInput placeholder="Digite o nome" value={nome} onChangeText={setNome} />

            <Text style={{ fontSize }}>Número:</Text>
            <TextInput placeholder="Digite o número" value={numero} keyboardType="numeric" onChangeText={setNumero} />

            <Text style={{ fontSize }}>Selecione o Tipo:</Text>
            <View>
                {tipos.map((item) => (
                    <TouchableOpacity key={item} onPress={() => setTipo(item)} >
                        <Text style={{ fontSize }}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}

                {tipo === "Personalizado" && (
                    <TextInput placeholder="Qual o tipo personalizado?" value={tipoPersonalizado} onChangeText={setTipoPersonalizado} />
                )}
            </View>

            {/* SEÇÃO DA FOTO */}
            <View>
                <View>
                    <TouchableOpacity onPress={async () => {
                        const { granted } = await requestPermission();

                        if (granted) {
                            setCameraVisivel(true);
                        } else {
                            // DEIXAR TEMPORARIO
                            Alert.alert("Permissão", "Precisamos de acesso a camera!");
                        }
                    }} >
                        <Text style={{ fontSize }}>
                            {foto ? "📸 Trocar Foto" : "📸 Tirar Foto"}
                        </Text>
                    </TouchableOpacity>

                    {foto && (
                        <TouchableOpacity onPress={() => setFoto(null)}>
                            <Text style={{ fontSize }}>📸 Remover Foto</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {foto ? (
                    <Image source={{ uri: foto }} />
                ) : null}
            </View>

            <TouchableOpacity onPress={validarEAvancar} >
                <Text style={{ fontSize }}>PRÓXIMO</Text>
            </TouchableOpacity>

            {/* MODAL DA CÂMERA - fazer depois */}
            <Modal visible={cameraVisivel} animationType="slide">
                <CameraView ref={cameraRef}>
                    <View>
                        {/* // style={styles.containerMarcador}, style={styles.marcadorCaixa}, so para eu não esquecer
                        <View>
                            <View></View>
                        </View> 
                        */}

                        <View>
                            <TouchableOpacity onPress={() => setCameraVisivel(false)}>
                                <Text>✕</Text>
                            </TouchableOpacity>

                            <View>
                                <TouchableOpacity onPress={tirarFoto}>
                                    <View />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </CameraView>
            </Modal>

        </ScrollView >
    )
}

const styles = StyleSheet.create({
    // fazer depois o estilo
})