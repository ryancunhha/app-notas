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
    const salvamentoConcluido = useRef(false);
    const [numeroProduto, setNumeroProduto] = useState(produtoParaEditar ? produtoParaEditar.numeroProduto : "");
    const [tipo, setTipo] = useState(produtoParaEditar ? (["Entrada", "Perda"].includes(produtoParaEditar.tipo) ? produtoParaEditar.tipo : "Personalizado") : "Entrada");
    const [tipoPersonalizado, setTipoPersonalizado] = useState(produtoParaEditar && !["Entrada", "Perda"].includes(produtoParaEditar.tipo) ? produtoParaEditar.tipo : "");
    const [valor, setValor] = useState(produtoParaEditar ? produtoParaEditar.valor : "");
    const [imagem, setImagem] = useState(produtoParaEditar ? produtoParaEditar.imagem : null);
    const [categoriasExistentes, setCategoriasExistentes] = useState([]);

    // ESTADOS DA CÂMERA
    const [permissao, pedirPermissao] = useCameraPermissions();
    const [cameraVisivel, setCameraVisivel] = useState(false);
    const cameraRef = useRef(null);

    // Logica do *
    const tipoFinalAtual = tipo === "Personalizado" ? tipoPersonalizado.trim() : tipo;
    const nomeAlterado = produtoParaEditar && nome.trim() !== produtoParaEditar.nome;
    const numeroAlterado = produtoParaEditar && numeroProduto.trim() !== produtoParaEditar.numeroProduto;
    const tipoAlterado = produtoParaEditar && tipoFinalAtual !== produtoParaEditar.tipo;
    const valorAlterado = produtoParaEditar && String(valor).trim() !== String(produtoParaEditar.valor) || String(valor).trim() !== "";
    const imagemAlterada = produtoParaEditar && imagem !== produtoParaEditar.imagem;
    const temAlteracao = produtoParaEditar ? (nomeAlterado || numeroAlterado || tipoAlterado || valorAlterado || imagemAlterada) : (nome.trim() !== "" || numeroProduto.trim() !== "" || valor.trim() !== "" || tipo !== "Entrada" || tipoPersonalizado.trim() !== "" || imagem !== null);

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
            Alert.alert("Erro", "Preencha todos os campos obrigatórios: NOME, NUMERO e VALOR.");
            return;
        }

        if (isNaN(numeroProduto)) {
            Alert.alert("Erro", "O número do produto deve conter apenas números.");
            return;
        }

        let valorTexto = String(valor).trim();
        let valorSemNegativo = valorTexto.startsWith('-') ? valorTexto.substring(1) : valorTexto;

        if (valorSemNegativo.includes('+') || valorSemNegativo.includes('-') || valorSemNegativo.includes('×') || valorSemNegativo.includes('÷')) {
            Alert.alert("Cálculo Incompleto", "O campo de valor possui uma conta (4+4). Resolva o cálculo antes de salvar o produto.");
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

            // Montagem do objeto (Salvo no Storage)
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
            salvamentoConcluido.current = true;
            Alert.alert("Sucesso", produtoParaEditar ? "Alterações salvas!" : "Produto cadastrado com sucesso!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            if (navigation) navigation.goBack();
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert("Erro", "Não foi possível salvar os dados.");
        }
    };

    useEffect(() => {
        const carregarCategorias = async () => {
            try {
                const dadosSalvos = await AsyncStorage.getItem("@meus_produtos");

                if (dadosSalvos !== null) {
                    const listaProdutos = JSON.parse(dadosSalvos);
                    const filtradas = [...new Set(
                        listaProdutos.map(p => p.tipo).filter(t => t !== "Entrada" && t !== "Perda" && t)
                    )];

                    setCategoriasExistentes(filtradas);
                }
            } catch (e) {
                console.log("Erro ao carregar categorias", e);
            }
        };

        carregarCategorias();
    }, []);

    useEffect(() => {
        const desfazerEscuta = navigation.addListener("beforeRemove", (e) => {
            if (salvamentoConcluido.current) return;
            if (!temAlteracao) return;
            e.preventDefault();

            Alert.alert(
                produtoParaEditar ? "Descartar Alterações?" : "Deseja descartar as informações?",
                produtoParaEditar ? "Deseja descartar as alterações?" : "Deseja descartar as informações preenchidas?",
                [
                    { text: "Não", style: "cancel" },
                    {
                        text: "Sim",
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ]
            );
        });

        return desfazerEscuta;
    }, [navigation, temAlteracao]);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Informações Basica */}
            <View>
                {/* Botão Salvar, Cancelar e Retonar */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12, gap: 5 }}>
                    <TouchableOpacity style={[styles.bntTipo, { flex: 1, borderColor: "#666", backgroundColor: "#FFF" }]} onPress={() => navigation.goBack()}>
                        <Text style={{ fontWeight: "bold", color: "#555", textAlign: "center" }}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.bntTipo, { flex: 1, borderColor: "#2196F3", backgroundColor: "#2196F3" }]} onPress={salvarAnotacao}>
                        <Text style={{ fontWeight: "bold", color: "#FFF", textAlign: "center" }}>Salvar Registro</Text>
                    </TouchableOpacity>
                </View>

                {/* Titulo */}
                <Text style={styles.titulo}>
                    {produtoParaEditar ? "Editar" : "Adicionar"}
                </Text>

                <View style={{ marginVertical: 10, marginHorizontal: 5, gap: 8 }}>
                    {/* Input Nome */}
                    <View style={{ flexDirection: "row" }}>
                        <Text style={styles.subTitulo}>Nome do Produto</Text>
                        {nomeAlterado && <Text style={{ color: "#F44336" }}>*</Text>}
                    </View>
                    <TextInput style={styles.input} value={nome} onChangeText={setNome} />

                    {/* Input Numero */}
                    <View style={{ flexDirection: "row" }}>
                        <Text style={styles.subTitulo}>Número do Produto</Text>
                        {numeroAlterado && <Text style={{ color: "#F44336" }}>*</Text>}
                    </View>
                    <TextInput style={styles.input} value={numeroProduto} onChangeText={setNumeroProduto} keyboardType="numeric" />
                </View>
            </View>

            {/* Categorias */}
            <View style={{ marginHorizontal: 5, gap: 8 }}>
                <View style={{ flexDirection: "row" }}>
                    <Text style={styles.subTitulo}>Tipo de Categoria</Text>
                    {tipoAlterado && <Text style={{ color: "#F44336" }}>*</Text>}
                </View>

                <View style={{ marginHorizontal: 5 }}>
                    {/* Padrões */}
                    <View style={{ gap: 5 }}>
                        {["Entrada", "Perda"].map((t) => {
                            const ativo = tipo === t;
                            const corBase = t === "Entrada" ? "#4CAF50" : "#F44336";
                            const fundoTransparente = corBase + "1A";

                            return (
                                <TouchableOpacity key={t} onPress={() => { setTipo(t); setTipoPersonalizado(""); }} style={[styles.bntTipo, { borderColor: ativo ? corBase : "#DDD", backgroundColor: ativo ? corBase : fundoTransparente }]}>
                                    <Text style={{ fontWeight: "bold", fontSize: 14, color: ativo ? "#FFF" : "#555" }}>{t}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {/* Personalizados */}
                    <View>
                        <TouchableOpacity onPress={() => { setTipo("Personalizado"); setTipoPersonalizado(""); }} style={[styles.bntTipo, { borderColor: tipo === "Personalizado" ? "#007BFF" : "#DDD", backgroundColor: tipo === "Personalizado" ? "#007BFF" : "#007BFF0D", borderStyle: tipo === "Personalizado" ? "solid" : "dashed", marginTop: 5 }]}>
                            <Text style={{ fontWeight: "bold", fontSize: 14, color: tipo === "Personalizado" ? "#FFF" : "#007BFF" }}>
                                Criar Categoria
                            </Text>
                        </TouchableOpacity>

                        {tipo === "Personalizado" && (
                            <TextInput value={tipoPersonalizado} onChangeText={setTipoPersonalizado} placeholder="Digite o nome da nova categoria" placeholderTextColor="#999" style={[styles.input, { borderColor: "#007BFF", backgroundColor: "#FFF", marginTop: 5 }]} />
                        )}
                    </View>

                    {/* Já existentes */}
                    {categoriasExistentes.length > 0 && (
                        <View style={{ marginVertical: 5, gap: 5 }}>
                            <Text style={{ fontSize: 12, fontWeight: "700", color: "#666" }}>Criadas Anteriormente:</Text>

                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
                                {categoriasExistentes.map((cat) => {
                                    const ativo = tipo === "Personalizado" && tipoPersonalizado === cat;
                                    const azulFundo = "#007BFF1F";

                                    return (
                                        <TouchableOpacity key={cat} onPress={() => { setTipo("Personalizado"); setTipoPersonalizado(cat); }} style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 5, borderWidth: 1.5, borderColor: ativo ? "#007BFF" : "#007BFF33", backgroundColor: ativo ? "#007BFF" : azulFundo, }}>
                                            <Text style={{ fontSize: 15, fontWeight: "bold", color: ativo ? "#FFF" : "#007BFF" }}>
                                                🏷️ {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </View>
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
                <View style={{ flexDirection: "row", marginVertical: 10 }}>
                    <Text style={styles.subTitulo}>Valor</Text>
                    {valorAlterado && <Text style={{ color: "#F44336" }}>*</Text>}
                </View>

                <Calculadora valorInicial={valor} aoConfirmar={(valorCalculado) => setValor(valorCalculado)} />
            </View>

            {/* MODAL */}
            <Modal visible={cameraVisivel} transparent={false}>
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

const styles = StyleSheet.create({
    // Geral
    container: {
        flex: 1,
        marginTop: 40,
        marginBottom: 50,
        paddingHorizontal: 10,
    },

    // Titulo
    titulo: {
        marginVertical: 16,
        fontSize: 26,
        fontWeight: "bold",
        color: "#777",
        textAlign: "center"
    },

    // Formulario
    subTitulo: {
        fontSize: 17,
        fontWeight: "800",
        color: "#444"
    },

    // inputs
    input: {
        fontSize: 16,
        marginHorizontal: 5,
        paddingHorizontal: 10,
        borderWidth: 1.5,
        borderColor: "#999",
        borderRadius: 5,
    },

    // botões tipo
    bntTipo: {
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1.5,
    }
})