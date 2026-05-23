import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, TextInput, Share, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuSuspenso from "../../components/MenuSuspenso/MenuSuspenso";

export default function HomeScreen({ navigation }) {
    // ESTADOS INICIAL
    const [produtos, setProdutos] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [filtroAtual, setFiltroAtual] = useState("TUDO");
    const [itensSelecionados, setItensSelecionados] = useState([]);
    const [menuVisivel, setMenuVisivel] = useState(false);
    const [versaoMenu, setVersaoMenu] = useState("postIt");
    const [posicaoMenu, setPosicaoMenu] = useState(null);
    const [produtoFocado, setProdutoFocado] = useState(null);

    // Carrega os dados do AsyncStorage
    useEffect(() => {
        const atualizarTelaAoFocar = navigation.addListener("focus", () => {
            carregarProdutosDoBanco();
        });

        return atualizarTelaAoFocar;
    }, [navigation]);

    const carregarProdutosDoBanco = async () => {
        try {
            const dadosSalvos = await AsyncStorage.getItem("@meus_produtos");
            if (dadosSalvos !== null) {
                setProdutos(JSON.parse(dadosSalvos));
            } else {
                setProdutos([]);
            }
        } catch (error) {
            console.log("Erro ao carregar os dados:", error);
        }
    };

    // FILTRO
    const tiposDeFiltro = ["TUDO", "Entrada", "Perda", ...new Set(
        produtos.map(p => p.tipo).filter(tipo => tipo !== "Entrada" && tipo !== "Perda")
    )];

    const produtosFiltrados = produtos.filter(produto => {
        const atendeFiltro = filtroAtual === "TUDO" || produto.tipo === filtroAtual;

        const termoBusca = pesquisa.toLowerCase();
        const atendePesquisa = produto.nome.toLowerCase().includes(termoBusca) || produto.numeroProduto.includes(termoBusca) || produto.valor.includes(termoBusca);

        return atendeFiltro && atendePesquisa;
    });

    // Ações Menu
    const abrirMenu = (event, versao, produto = null) => {
        const { pageX, pageY } = event.nativeEvent;

        setPosicaoMenu({
            x: pageX - 10,
            y: pageY - 10,
            width: 20,
            height: 20
        });

        setVersaoMenu(versao);
        setProdutoFocado(produto);
        setMenuVisivel(true);
    };

    const acoesMenu = {
        aoExcluir: () => {
            if (!produtoFocado) return;

            Alert.alert(
                "Excluir Produto",
                `Tem certeza que deseja excluir "${produtoFocado.nome}"?`,
                [
                    { text: "Não", style: "cancel" },
                    {
                        text: "Excluir",
                        style: "destructive",
                        onPress: async () => {
                            const novaLista = produtos.filter(p => p.numeroProduto !== produtoFocado.numeroProduto);

                            try {
                                await AsyncStorage.setItem("@meus_produtos", JSON.stringify(novaLista));

                                setProdutos(novaLista);
                                setItensSelecionados(itensSelecionados.filter(id => id !== produtoFocado.numeroProduto));
                                setProdutoFocado(null);
                            } catch (erro) {
                                Alert.alert("Erro", "Não foi possível gravar a exclusão no celular.");
                            }
                        }
                    }
                ]
            );
        },
        aoLimparTudo: () => {
            Alert.alert(
                "Limpar Produtos",
                `Deseja mesmo excluir todos os produtos da categoria "${filtroAtual}"?`,
                [
                    { text: "Não", style: "cancel" },
                    {
                        text: "Sim, Excluir",
                        style: "destructive",
                        onPress: async () => {
                            let novaLista = [];
                            if (filtroAtual !== "TUDO") {
                                novaLista = produtos.filter(p => p.tipo !== filtroAtual);
                            }

                            try {
                                // Força a gravação da lista limpa no AsyncStorage
                                await AsyncStorage.setItem("@meus_produtos", JSON.stringify(novaLista));
                                setProdutos(novaLista);
                                setItensSelecionados([]);
                            } catch (erro) {
                                Alert.alert("Erro", "Não foi possível limpar os dados do armazenamento.");
                            }
                        }
                    }
                ]
            );
        },
        aoCompartilhar: async () => {
            if (produtosFiltrados.length === 0) {
                alert("Não há produtos nesta lista para compartilhar.");
                return;
            }

            let mensagemTexto = `📋 *RELATÓRIO DE PRODUTOS - ABA: ${filtroAtual.toUpperCase()}*\n`;
            mensagemTexto += `----------------------------------------\n\n`;

            produtosFiltrados.forEach((item, index) => {
                mensagemTexto += `${index + 1}. *${item.nome}*\n`;
                mensagemTexto += `   🔢 Nº: ${item.numeroProduto}\n`;
                mensagemTexto += `   🏷️ Tipo: ${item.tipo}\n`;
                mensagemTexto += `   💰 Valor: R$ ${item.valor}\n`;
                mensagemTexto += `   🕒 Data: ${item.dataHora}\n\n`;
            });

            mensagemTexto += `----------------------------------------\n`;

            try {
                await Share.share({
                    message: mensagemTexto,
                });
            } catch (error) {
                console.log("Erro ao compartilhar:", error);
            }
        },
        aoVerImagem: () => {
            alert(`Visualizar Imagem`);
        },
        aoEditar: () => {
            if (produtoFocado) {
                navigation.navigate("FormScreen", { produto: produtoFocado });
            }
        },
    };

    // Ações post-it
    const alternarSelecaoMultipla = (numeroProduto) => {
        if (itensSelecionados.includes(numeroProduto)) {
            setItensSelecionados(itensSelecionados.filter(id => id !== numeroProduto));
        } else {
            setItensSelecionados([...itensSelecionados, numeroProduto]);
        }
    };

    const deletarSelecionadosEmMassa = () => {
        if (itensSelecionados.length === 0) return;

        Alert.alert(
            "Excluir Selecionados",
            `Deseja mesmo excluir os ${itensSelecionados.length} produtos selecionados?`,
            [
                { text: "Não", style: "cancel" },
                {
                    text: "Excluir Todos",
                    style: "destructive",
                    onPress: async () => {
                        const novaLista = produtos.filter(p => !itensSelecionados.includes(p.numeroProduto));

                        try {
                            await AsyncStorage.setItem("@meus_produtos", JSON.stringify(novaLista));
                            setProdutos(novaLista);
                            setItensSelecionados([]);
                        } catch (erro) {
                            Alert.alert("Erro", "Não foi possível salvar a exclusão em massa.");
                        }
                    }
                }
            ]
        );
    };

    const irParaCadastroFormulario = () => {
        navigation.navigate("FormScreen", { produto: null });
    };

    const RenderizarPostIt = ({ item }) => {
        const estaSelecionado = itensSelecionados.includes(item.numeroProduto);

        return (
            <TouchableOpacity onPress={() => itensSelecionados.length > 0 ? alternarSelecaoMultipla(item.numeroProduto) : null} onLongPress={() => alternarSelecaoMultipla(item.numeroProduto)} activeOpacity={0.8} >
                <Text>
                    {/* TESTE DE MULTIPLA SELEÇÂO */}
                    {estaSelecionado ? "# " : ""}
                </Text>

                <View>
                    <Text numberOfLines={1}>{item.nome}</Text>
                    <Text>{item.numeroProduto}</Text>
                    <Text>R$ {item.valor}</Text>
                </View>

                <View>
                    <Text>{item.dataHora}</Text>
                    <TouchableOpacity onPress={(e) => abrirMenu(e, "postIt", item)}>
                        <Text>...</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View>
            <View>
                <Text>Bloco De Notas</Text>
                <TextInput onChangeText={setPesquisa} value={pesquisa} placeholder="Pesquisar por nome, número ou valor..." placeholderTextColor="#999" />
            </View>

            <View>
                {/* Filtro */}
                <View>
                    <View>
                        <FlatList data={tiposDeFiltro} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => item} renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setFiltroAtual(item);
                                    setItensSelecionados([]);
                                }}
                            >
                                <Text>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                        />
                    </View>

                    <TouchableOpacity onPress={(e) => abrirMenu(e, "filtro")}>
                        <Text>...</Text>
                    </TouchableOpacity>
                </View>

                {/* POST-ITS */}
                <View>
                    <FlatList data={produtosFiltrados} renderItem={RenderizarPostIt} keyExtractor={(item) => item.numeroProduto} numColumns={2} showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text>Nenhum registro.</Text>
                        }
                    />
                </View>
            </View>

            <View>
                {itensSelecionados.length > 0 && (
                    <TouchableOpacity onPress={deletarSelecionadosEmMassa}>
                        <Text>🗑️</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={irParaCadastroFormulario}>
                    <Text>+</Text>
                </TouchableOpacity>
            </View>

            <MenuSuspenso visivel={menuVisivel} aoFechar={() => setMenuVisivel(false)} posicaoBotao={posicaoMenu} versao={versaoMenu} acoes={acoesMenu} />
        </View>
    )
}

const styles = StyleSheet.create({})