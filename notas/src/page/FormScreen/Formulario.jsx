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
    const { fontSize, editando } = route.params;

    // DADOS
    const [nome, setNome] = useState(editando ? editando.nome : "");
    const [numero, setNumero] = useState(editando ? editando.numero : "");
    const [tipo, setTipo] = useState(editando ? editando.tipo : "");
    const [tipoPersonalizado, setTipoPersonalizado] = useState(
        editando && !["Entrada", "Saída", "Produção"].includes(editando.tipo) ? editando.tipo : ""
    );
    const [registrosExistentes, setRegistrosExistentes] = useState([]);

    // foto Permissões e Ref
    const [foto, setFoto] = useState(editando ? editando.foto : null);
    const [cameraVisivel, setCameraVisivel] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    const tipos = ["Entrada", "Saída", "Produção", "Personalizado"];

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

    // pode inves de ir para calculadora ir direto pra tabela ser for editação?
    const validarEAvancar = async () => {
        let tipoFinal = tipo === "Personalizado" ? tipoPersonalizado : tipo;
        if (!tipoFinal) tipoFinal = "Todos";

        const jaExisteNome = registrosExistentes.some(r =>
            r.nome.toLowerCase() === nome.toLowerCase() && r.id !== editando?.id
        );
        const jaExisteNumero = registrosExistentes.some(r =>
            r.numero === numero && r.id !== editando?.id
        );

        if (jaExisteNome || jaExisteNumero) {
            Alert.alert("Atenção", "Nome ou Número já está cadastrado!");
            return;
        }

        // --- LÓGICA DE SALVAR DIRETO SE FOR EDIÇÃO ---
        if (editando) {
            // ainda estar trocando todos da tabela, 
            try {
                const dados = await AsyncStorage.getItem("@minha_tabela_dados");
                let lista = dados ? JSON.parse(dados) : [];

                // Atualizamos o item na lista mantendo o cálculo antigo
                const listaAtualizada = lista.map(item => {
                    if (item.id === editando.id) {
                        return {
                            ...item, // mantém o que já tinha (inclusive o cálculo)
                            nome: nome,
                            numero: numero,
                            tipo: tipoFinal,
                            foto: foto,
                        };
                    }

                    return item;
                });

                await AsyncStorage.setItem("@minha_tabela_dados", JSON.stringify(listaAtualizada));

                // Volta direto para a Tabela limpando o rastro do formulário
                navigation.reset({
                    index: 1,
                    routes: [{ name: "Home" }, { name: "Tabela" }],
                });
                return; // Para não executar o código da calculadora abaixo
            } catch (e) {
                Alert.alert("Erro", "Não foi possível atualizar os dados.");
                return;
            }
        }

        // Se NÃO for edição, segue o fluxo normal para a calculadora
        navigation.navigate("Calculadora", { nome, numero, tipo: tipoFinal, foto, fontSize, editandoId: editando ? editando.id : null, calculoAntigo: editando ? editando.calculoFinal : "" });
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