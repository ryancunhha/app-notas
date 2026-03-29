import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Tabela({ navigation }) {
    /*
    Agora tá certo o tabela e home
    */

    const [listaGeral, setListaGeral] = useState([]);
    const [filtroAtivo, setFiltroAtivo] = useState("Todos");

    // já funcionou não precisa mexer aqui
    const categorias = ["Todos", "Entrada", "Saída", "Produção"];

    const categoriasExtras = [...new Set(listaGeral.map(item => item.tipo))];

    const todasCategorias = [
        ...categorias, ...categoriasExtras.filter(cat => !categorias.includes(cat) && cat !== "")
    ];

    // 1. CARREGAR DADOS (Sempre que a tela focar)
    useEffect(() => {
        const carregarDados = async () => {
            try {
                const valor = await AsyncStorage.getItem("@minha_tabela_dados");
                if (valor) {
                    setListaGeral(JSON.parse(valor));
                }
            } catch (e) {
                Alert.alert("Erro", "Não foi possível carregar os dados.");
            }
        };

        // Escuta quando a tela entra em foco (volta da calculadora)
        const focusHandler = navigation.addListener("focus", carregarDados);
        return focusHandler;
    }, [navigation]);

    // 2. FILTRO (Lógica de exibição)
    const dadosExibidos = filtroAtivo === "Todos" ? listaGeral : listaGeral.filter(item => item.tipo === filtroAtivo);

    // 3. LIMPAR TUDO (No AsyncStorage também!) ok e para limpar tbm do armaznamento
    const limparTabela = () => {
        Alert.alert("Aviso", "Deseja apagar todos os registros permanentemente?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Sim", onPress: async () => {
                    await AsyncStorage.removeItem("@minha_tabela_dados");
                    setListaGeral([]);
                }
            }
        ]);
    };

    const exportarLista = () => {
        const total = dadosExibidos.length;
        Alert.alert("Exportar", `Exportando ${total} itens do filtro: ${filtroAtivo}`);
        // Aqui depois você coloca a lógica de gerar PDF ou Excel
    };

    // Agora essa parte chata aqui que e a edição
    // poder editar: nome, numero, tipo,
    // no calculo ele vai levar novamente para calculadora mais do numero salvo e poder fazer novamente os calculos
    // e onde estar "sem foto" pode continuar sem foto mais colocar um botão de + para adicionar uma foto ou levar para o formulariio para tirar a foto lá
    const renderItem = ({ item }) => (
        <View >
            {/* BLOCO 1 */}
            <TouchableOpacity onPress={() => navigation.navigate("Formulario", { editando: item, fontSize: item.fontSize })}>
                {/* FOTO */}
                <View>
                    {item.foto ? (
                        <Image source={{ uri: item.foto }} />
                    ) : (
                        <View>
                            <Text>+ Foto</Text>
                        </View>
                    )}
                </View>

                {/* Nome */}
                <Text >{item.nome}</Text>

                {/* NUMERo */}
                <Text >{item.numero}</Text>

                <Text>
                    ✏️
                </Text>
            </TouchableOpacity>

            {/* Bloco 2 */}
            <TouchableOpacity onPress={() => navigation.navigate("Calculadora", { nome: item.nome, numero: item.numero, tipo: item.tipo, foto: item.foto, fontSize: item.fontSize, calculoAntigo: item.calculoFinal, editandoId: item.id })} >
                <Text>
                    {item.calculoFinal}
                </Text>
                
                <Text>
                    ✏️
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            {/* 1. FILTROS */}
            <View>
                <FlatList horizontal showsHorizontalScrollIndicator={false} data={todasCategorias} keyExtractor={(item) => "filtro-" + item}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => setFiltroAtivo(item)} >
                            <Text >{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* CABEÇALHO */}
            <View >
                <Text >FOTO</Text>
                <Text >NOME</Text>
                <Text >Nº</Text>
                <Text >SOMA</Text>
            </View>

            {/* LISTA DINÂMICA */}
            {/* AGORA  */}
            <FlatList data={dadosExibidos} keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} renderItem={renderItem} ListEmptyComponent={<Text >Nenhum item encontrado.</Text>} />

            {/* BOTÕES DE BAIXO */}
            <View >
                <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                    <Text >HOME</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={limparTabela}>
                    <Text >LIMPAR</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={exportarLista}>
                    <Text >EXPORTAR</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    // fazer depois
})