import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, TextInput, Share, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuSuspenso from "../../components/MenuSuspenso/MenuSuspenso";
import Layout from "../../Layout/layout";

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
    const [idMenuAberto, setIdMenuAberto] = useState(null);

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

    // Ações Postit
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
        aoExcluir: (produto) => {
            if (!produto) return;

            Alert.alert(
                "Excluir Produto",
                `Tem certeza, excluir: ${produto.nome}?`,
                [
                    { text: "Não", style: "cancel" },
                    {
                        text: "Sim, Excluir",
                        onPress: async () => {
                            const novaLista = produtos.filter(
                                p => p.numeroProduto !== produto.numeroProduto
                            );

                            await AsyncStorage.setItem(
                                "@meus_produtos",
                                JSON.stringify(novaLista)
                            );

                            setProdutos(novaLista);
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

            let mensagemTexto = `📋 *RELATÓRIO - ${filtroAtual.toUpperCase()}*\n\n`;

            produtosFiltrados.forEach((item, index) => {
                mensagemTexto += `${index + 1}.   ---------------\n`;
                mensagemTexto += `   📦 Produto: *${item.nome}*\n`;
                mensagemTexto += `   🔢 Código: ${item.numeroProduto}\n`;
                mensagemTexto += `   💰 Valor: R$ ${item.valor}\n`;
                mensagemTexto += `   📅 Data: ${item.dataHora}\n\n`;
            });

            try {
                await Share.share({
                    message: mensagemTexto,
                });
            } catch (error) {
                console.log("Erro ao compartilhar:", error);
            }
        },
        aoCompartilharItem: async (produto) => {
            if (!produto) return;

            const mensagem =
                `📦 Produto: ${produto.nome}\n` +
                `🔢 Código: ${produto.numeroProduto}\n` +
                `💰 Valor: R$ ${produto.valor}\n` +
                `📅 Data: ${produto.dataHora}`;

            try {
                await Share.share({
                    message: mensagem,
                });
            } catch (error) {
                console.log("Erro ao compartilhar:", error);
            }
        },
        aoVerImagem: () => {
            alert(`Visualizar Imagem`);
        },
        aoEditar: (produto) => {
            if (produto) {
                navigation.navigate("FormScreen", { produto });
            }
        },
    };

    // Seleções do postits
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
            `Deseja excluir os produtos selecionados?`,
            [
                { text: "Não", style: "cancel" },
                {
                    text: "Sim, Excluir",
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
        const corDaFaixa = item.tipo === "Entrada" ? "#4CAF50" : item.tipo === "Perda" ? "#F44336" : "#2196F3";
        const corTransparnte = corDaFaixa + "1A";

        return (
            <TouchableOpacity style={[styles.cardPostIt, { backgroundColor: corTransparnte }]}
                onPress={() => {
                    if (itensSelecionados.length > 0) {
                        alternarSelecaoMultipla(item.numeroProduto);
                    }
                }} onLongPress={() => alternarSelecaoMultipla(item.numeroProduto)} delayLongPress={300} activeOpacity={0.8} >
                <View style={{ height: 8, backgroundColor: corDaFaixa, width: "100%" }} />

                <View style={{ position: "absolute", top: 16, right: 10, zIndex: 5 }}>
                    {itensSelecionados.length > 0 && (
                        <View style={[styles.bolinhaSelecao, estaSelecionado ? styles.bolinhaAtiva : styles.bolinhaInativa]}>
                            {estaSelecionado && <View style={styles.pontoInterno} />}
                        </View>
                    )}
                </View>

                <View style={{ padding: 12, gap: 8 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 18 }} numberOfLines={1}>{item.nome}</Text>
                    <Text style={{ fontSize: 17 }}>Código: {item.numeroProduto}</Text>
                    <Text style={{ fontSize: 17 }}>Valor: {item.valor}</Text>
                    <Text style={{ fontSize: 14 }}>🕒 {item.dataHora}</Text>
                </View>

                <View style={{ marginVertical: 3, paddingHorizontal: 5, justifyContent: "center", alignItems: "center", gap: 3, }}>
                    <TouchableOpacity style={styles.gaveta}
                        onPress={() => {
                            acoesMenu.aoEditar(item);
                            setIdMenuAberto(null);
                        }}
                    >
                        <Text style={{ fontWeight: "bold", color: "#333" }}>
                            Editar
                        </Text>
                    </TouchableOpacity>

                    {false && (
                        <TouchableOpacity style={styles.gaveta} onPress={() => { acoesMenu.aoVerImagem(); setIdMenuAberto(null); }}>
                            <Text style={{ fontWeight: "bold", color: "#333" }}>Ver Imagem</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.gaveta}
                        onPress={() => {
                            acoesMenu.aoExcluir(item);
                            setIdMenuAberto(null);
                        }}
                    >
                        <Text style={{ fontWeight: "bold", color: "#333" }}>
                            Excluir
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gaveta}
                        onPress={() => {
                            acoesMenu.aoCompartilharItem(item);
                            setIdMenuAberto(null);
                        }}
                    >
                        <Text style={{ fontWeight: "bold", color: "#333" }}>
                            Compartilhar
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Layout>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={{ fontSize: 25, fontWeight: "bold" }}>Notas</Text>

                    <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 0.7, borderRadius: 5, borderColor: "#999", paddingVertical: 5, }}>
                        <TextInput style={{ width: 200, height: 30, paddingLeft: 10, paddingBottom: 0, paddingTop: 0, fontSize: 17, }} onChangeText={setPesquisa} value={pesquisa} placeholder="Pesquisar..." placeholderTextColor="#999" />
                        <Text style={{ paddingHorizontal: 6, paddingVertical: 4 }}>🔍</Text>
                    </View>
                </View>

                <View style={{ flex: 1, }}>

                    {/* Cabeçalho */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 10, }}>
                        <TouchableOpacity onPress={(e) => abrirMenu(e, "filtro")}>
                            <Text style={{ fontSize: 25, fontWeight: "600", marginHorizontal: 18, }}>⋮</Text>
                        </TouchableOpacity>

                        {/* Filtro centralizado */}
                        <View style={{ flex: 1, alignItems: "center", }}>
                            <FlatList data={tiposDeFiltro} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => item} contentContainerStyle={{ justifyContent: "center", alignItems: "center", }}
                                renderItem={({ item }) => {
                                    let corPadrao = "#007BFF";
                                    if (item === "Perda") corPadrao = "#F44336";
                                    if (item === "Entrada") corPadrao = "#4CAF50";

                                    const selecionado = filtroAtual === item;

                                    return (
                                        <TouchableOpacity style={{ marginHorizontal: 3, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: selecionado ? corPadrao : corPadrao + "33", }}
                                            onPress={() => {
                                                setFiltroAtual(item);
                                                setItensSelecionados([]);
                                            }}
                                        >
                                            <Text style={{ color: selecionado ? "#FFF" : "#000", fontSize: 16, fontWeight: "bold" }}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </View>
                    </View>

                    {/* POST-ITS */}
                    <View style={{ flex: 1 }}>
                        <FlatList data={[1]}
                            renderItem={() => (
                                <View>
                                    {produtosFiltrados.length === 0 ? (
                                        <View style={{ marginTop: 100, alignItems: "center", justifyContent: "center", }}>
                                            <Text style={{ color: "#999", fontSize: 16 }}>
                                                Nenhum registro encontrado.
                                            </Text>
                                        </View>
                                    ) : (
                                        <View>
                                            {produtosFiltrados.map((item, index) => (
                                                <RenderizarPostIt key={item.numeroProduto} item={item} />
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )} keyExtractor={() => "mural-root"} showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>

                {/* Navegação */}
                <View style={styles.fabContainer}>
                    {itensSelecionados.length > 0 && (
                        <TouchableOpacity style={[styles.btnNav, { marginBottom: 10, backgroundColor: "#e30000" }]} onPress={deletarSelecionadosEmMassa}>
                            <Text>🗑️</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.btnNav, { backgroundColor: "#2d73e4" }]} onPress={irParaCadastroFormulario}>
                        <Text style={{ fontWeight: "900", color: "#fff" }}>+</Text>
                    </TouchableOpacity>
                </View>

                <MenuSuspenso visivel={menuVisivel} aoFechar={() => setMenuVisivel(false)} posicaoBotao={posicaoMenu} versao={versaoMenu} acoes={acoesMenu} />
            </View>
        </Layout>
    )
}

const styles = StyleSheet.create({
    // Geral
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },

    // Header
    header: {
        marginTop: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    // Filtro

    // Post-its
    cardPostIt: {
        width: "100%",
        borderRadius: 8,
        marginBottom: 15,
        overflow: "hidden",
        alignSelf: "flex-start",
    },

    // Opções
    gaveta: {
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.5)",
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.03)",
    },

    // Selecão
    bolinhaSelecao: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    bolinhaInativa: {
        borderColor: "#94A3B8",
        backgroundColor: "transparent",
    },
    bolinhaAtiva: {
        borderColor: "#007BFF",
        backgroundColor: "#007BFF",
    },
    pontoInterno: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#fff",
    },

    // Navegação
    fabContainer: {
        position: "absolute",
        bottom: 20,
        right: 30,
        zIndex: 5,
    },
    btnNav: {
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50,
    }
})