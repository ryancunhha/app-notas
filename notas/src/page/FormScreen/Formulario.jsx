import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

/*
ERROS
*/

export default function FormScreen({ route, navigation }) {
    // PUXAR A FONTE SELECIONADA NA TELA INICIAL - OK
    // Não pode repitir na tebale exemplo se o usuario colocar FELIPE ou felipe e não pode salva que já exsite, tbm para numero
    // Conseguir tirar foto com visualização da foto - OK

    // FONTE
    const { fontSize } = route.params;

    // DADOS
    const [nome, setNome] = useState("");
    const [numero, setNumero] = useState("");
    const [tipo, setTipo] = useState("");

    // foto Permissões e Ref
    const [foto, setFoto] = useState(null);
    const [cameraVisivel, setCameraVisivel] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    // Lista fictícia excluir depois
    const registrosExistentes = [
        { nome: "FELIPE", numero: "10" },
        { nome: "MARIA", numero: "20" }
    ];

    const tipos = ["Entrada", "Saída", "Produção", "Personalizado"];

    const tirarFoto = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();

            setFoto(photo.uri);
            setCameraVisivel(false);
        }
    };

    const validarEAvancar = () => {
        // Validação de Duplicados
        // const jaExisteNome = registrosExistentes.some(r => r.nome.toUpperCase() === nome.toUpperCase());
        // const jaExisteNumero = registrosExistentes.some(r => r.numero === numero);

        // fazer depois
        // if (!nome || !numero || !tipo) {
        //     Alert.alert("Erro", "Preencha todos os campos!");
        //     return;
        // }
        // 
        // if (jaExisteNome || jaExisteNumero) {
        //     Alert.alert("Atenção", "Este Nome ou Número já está cadastrado na tabela!");
        //     return;
        // }

        // Não fiz ainda deixar em branco
        navigation.navigate("Calculadora", { nome, numero, tipo, foto, fontSize });
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

            {/* MODAL DA CÂMERA */}
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