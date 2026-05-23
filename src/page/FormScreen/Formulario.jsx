import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Calculadora from "../../components/Calculadora/Calculadora";

export default function FormScreen({ route, navigation }) {
    // ESTADOS
    const produtoParaEditar = route?.params?.produto || null;

    // ESTADOS DO FORMULÁRIO
    const [nome, setNome] = useState(produtoParaEditar ? produtoParaEditar.nome : "");
    const [numeroProduto, setNumeroProduto] = useState(produtoParaEditar ? produtoParaEditar.numeroProduto : "");
    const [tipo, setTipo] = useState(produtoParaEditar ? (["Entrada", "Perda"].includes(produtoParaEditar.tipo) ? produtoParaEditar.tipo : "Personalizado") : "Entrada");
    const [tipoPersonalizado, setTipoPersonalizado] = useState(produtoParaEditar && !["Entrada", "Perda"].includes(produtoParaEditar.tipo) ? produtoParaEditar.tipo : "");
    const [valor, setValor] = useState(produtoParaEditar ? produtoParaEditar.valor : "");
    const [imagem, setImagem] = useState(produtoParaEditar ? produtoParaEditar.imagem : null);

    // ESTADOS DA CÂMERA
    const [permissao, pedirPermissao] = useCameraPermissions();
    const [cameraVisivel, setCameraVisivel] = useState(false);
    const cameraRef = useRef(null);

    // Logica do *
    const tipoFinalAtual = tipo === "Personalizado" ? tipoPersonalizado.trim() : tipo;
    const nomeAlterado = produtoParaEditar && nome.trim() !== produtoParaEditar.nome;
    const numeroAlterado = produtoParaEditar && numeroProduto.trim() !== produtoParaEditar.numeroProduto;
    const tipoAlterado = produtoParaEditar && tipoFinalAtual !== produtoParaEditar.tipo;
    const valorAlterado = produtoParaEditar && valor.trim() !== produtoParaEditar.valor;
    const imagemAlterada = produtoParaEditar && imagem !== produtoParaEditar.imagem;

    // Camera
    const abrirCamera = async () => {
        if (!permissao || !permissao.granted) {
            const resposta = await pedirPermissao();
            if (!resposta.granted) {
                Alert.alert("Permissão Negada", "Precisamos de acesso à câmera para tirar a foto do produto.");
                return;
            }
        }
        setCameraVisivel(true);
    };

    const tirarFoto = async () => {
        if (cameraRef.current) {
            try {
                const foto = await cameraRef.current.takePictureAsync({ quality: 0.5 });
                setImagem(foto.uri);
                setCameraVisivel(false);
            } catch (error) {
                Alert.alert("Erro", "Não foi possível capturar a foto.");
            }
        }
    };

    // Salvamento na memoria e validação das infomrçaões
    const salvarAnotacao = async () => {
        // 1. Validações
        if (!nome.trim() || !numeroProduto.trim() || !valor.trim()) {
            Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
            return;
        }

        if (isNaN(numeroProduto)) {
            Alert.alert("Erro", "O número do produto deve conter apenas algarismos numéricos.");
            return;
        }

        const tipoFinal = tipo === "Personalizado" ? tipoPersonalizado.trim() : tipo;
        if (!tipoFinal) {
            Alert.alert("Erro", "Por favor, digite ou selecione um tipo para o produto.");
            return;
        }

        if (produtoParaEditar && !nomeAlterado && !numeroAlterado && !tipoAlterado && !valorAlterado && !imagemAlterada) {
            Alert.alert("Aviso", "Nenhuma alteração feita.");
            if (navigation) navigation.goBack();
            return;
        }

        try {
            // Puxa a lista existente do AsyncStorage
            const dadosSalvos = await AsyncStorage.getItem("@meus_produtos");
            let produtosExistentes = dadosSalvos ? JSON.parse(dadosSalvos) : [];

            if (produtoParaEditar) {
                produtosExistentes = produtosExistentes.filter(p => p.numeroProduto !== produtoParaEditar.numeroProduto);
            }

            // Validação de não ter nomes ou números repetidos
            const nomeJaExiste = produtosExistentes.some(p => p.nome.toLowerCase() === nome.trim().toLowerCase());
            if (nomeJaExiste) {
                Alert.alert("Erro", "Já existe um produto cadastrado com esse nome.");
                return;
            }

            const numeroJaExiste = produtosExistentes.some(p => p.numeroProduto === numeroProduto.trim());
            if (numeroJaExiste) {
                Alert.alert("Erro", "Este número de produto já está em uso.");
                return;
            }

            // Gerar data e hora
            const agora = new Date();
            const dia = String(agora.getDate()).padStart(2, '0');
            const mes = String(agora.getMonth() + 1).padStart(2, '0');
            const horas = String(agora.getHours()).padStart(2, '0');
            const minutos = String(agora.getMinutes()).padStart(2, '0');
            const dataHoraAutomatica = `${dia}-${mes} ${horas}:${minutos}`;

            // Montagem do objeto (Salvo no Storage) ------------
            const produtoPronto = {
                nome: nome.trim(),
                numeroProduto: numeroProduto.trim(),
                tipo: tipoFinal,
                valor: valor.trim(),
                dataHora: produtoParaEditar ? produtoParaEditar.dataHora : dataHoraAutomatica,
                imagem: imagem
            };

            let novaLista = [];
            if (produtoParaEditar) {
                novaLista = [...produtosExistentes, produtoPronto];
            } else {
                novaLista = [produtoPronto, ...produtosExistentes];
            }

            // Salva no AsyncStorage e volta para a tela anterior
            await AsyncStorage.setItem("@meus_produtos", JSON.stringify(novaLista));
            Alert.alert("Sucesso", produtoParaEditar ? "Alterações salvas!" : "Produto cadastrado com sucesso!");

            if (navigation) navigation.goBack();
        } catch (error) {
            Alert.alert("Erro", "Não foi possível salvar os dados.");
        }
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Titulo */}
            <Text>
                {produtoParaEditar ? "Editar Anotação" : "Adicionar Anotação"}
            </Text>

            <View>
                {/* Input Nome */}
                <View>
                    <Text>Nome do Produto</Text>
                    {nomeAlterado && <Text>*</Text>}
                </View>
                <TextInput value={nome} onChangeText={setNome} placeholder="Ex: Queijo Prato" />

                {/* Input Numero */}
                <View>
                    <Text>Número do Produto</Text>
                    {numeroAlterado && <Text>*</Text>}
                </View>
                <TextInput value={numeroProduto} onChangeText={setNumeroProduto} placeholder="Ex: 00000000" keyboardType="numeric" />
            </View>

            <View>
                {/* TIPO */}
                <View>
                    <Text>Tipo de Registro</Text>
                    {tipoAlterado && <Text>*</Text>}
                </View>
                <View>
                    {["Entrada", "Perda", "Personalizado"].map((t) => (
                        <TouchableOpacity key={t} onPress={() => setTipo(t)} >
                            <Text>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {tipo === "Personalizado" && (
                    <TextInput value={tipoPersonalizado} onChangeText={setTipoPersonalizado} placeholder="Digite o nome da categoria personalizada..." />
                )}
            </View>

            {false && (
                <View>
                    <View>
                        <Text>Imagem do Produto</Text>
                        {imagemAlterada && <Text>*</Text>}
                    </View>

                    {imagem ? (
                        <View>
                            <Image source={{ uri: imagem }} />

                            <TouchableOpacity onPress={abrirCamera} >
                                <Text>Alterar Foto</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={abrirCamera}>
                            <Text>Adicionar Foto do Produto</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Calculadora */}
            <View>
                <View>
                    <Text>Valor (R$)</Text>
                    {valorAlterado && <Text>*</Text>}
                </View>

                <Calculadora valorInicial={valor} aoConfirmar={(valorCalculado) => setValor(valorCalculado)} />
            </View>

            {/* Botão salvar, cancelar e retonar */}
            <View>
                {produtoParaEditar ? (
                    <TouchableOpacity onPress={() => {
                        Alert.alert(
                            "Cancelar Alterações",
                            "Deseja mesmo descartar as alterações feitas?",
                            [
                                { text: "Não" },
                                { text: "Sim", onPress: () => navigation.goBack() }
                            ]
                        );
                    }}
                    >
                        <Text>Cancelar</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text>Voltar</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={salvarAnotacao}>
                    <Text>Salvar Registro</Text>
                </TouchableOpacity>
            </View>

            {/* MODAL */}
            <Modal visible={cameraVisivel} transparent={false} animationType="slide">
                <CameraView ref={cameraRef}>
                    <TouchableOpacity>
                        <Text>Voltar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={tirarFoto}>
                        <View />
                    </TouchableOpacity>
                </CameraView>
            </Modal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({})