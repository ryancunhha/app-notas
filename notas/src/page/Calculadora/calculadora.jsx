import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function Calculadora({ route, navigation }) {
    // Puxar NOME, NUMERO, TIPO, FONTE, FOTO
    // Fazer calculadora com: +, -, /, *, igual, C -> Limpar Tudo, Botão de apagar -> apagar 1 por 1 e pode ficar precisonando
    // teclas 0,1,2,3,4,5,6,7,8,9 e ,
    // tamanho maximo 15 digitos
    // pode 000000000000000
    // pode com decimal 10 digitos 0,0000000000  
    // salvar completo -> nome, numero, tipo, fonte, foto, calculo
    // pode seleciona onde estar exemplo tem 00000000 ai quero ir pro ultimo poder clicar para apagar onde eu quero

    // depois de fazer a tabela feita, poder editar o numero Por enquanto so adicionar 
    /*
    deixar salvo aqui para não esquecer kkk
    {Ediatndo ? (
                        <Text style={{ fontSize }}>
                            📝 EDITANDO: {tipo} {nome} (Nº {numero})
                        </Text>
                    ) : (
                        <Text style={{ fontSize }}>
                            + ADIÇÃO: {tipo} {nome} (Nº {numero})
                        </Text>
                    )}
    */

    // dados do formulario
    const { nome, numero, tipo, fontSize, foto } = route.params;

    const [calculo, setCalculo] = useState("");
    const [cursorPos, setCursorPos] = useState(0); // Para saber onde o usuário clicou

    const calculoRef = useRef(calculo);
    const cursorPosRef = useRef(cursorPos);
    const intervalRef = useRef(null); // Para o botão de apagar segurado

    // Mantém as referências atualizadas sempre que o estado mudar
    useEffect(() => {
        calculoRef.current = calculo;
        cursorPosRef.current = cursorPos;
    }, [calculo, cursorPos]);

    // Funções da Calculadora
    const inserirCaractere = (char) => {
        const operadoresPermitidos = ["+", "-", "×", "÷"];
        const ehOperador = operadoresPermitidos.includes(char);
        const ehVirgula = char === ",";

        let textoAtual = calculoRef.current;
        const posAtual = cursorPosRef.current;

        // 1. Identificar o bloco do número atual
        const parteAntes = textoAtual.slice(0, posAtual);
        const parteDepois = textoAtual.slice(posAtual);

        const inicioNum = Math.max(
            parteAntes.lastIndexOf("+"), parteAntes.lastIndexOf("-"),
            parteAntes.lastIndexOf("×"), parteAntes.lastIndexOf("÷")
        );
        const buscaFim = parteDepois.search(/[+\-×÷]/);
        const fimNum = buscaFim === -1 ? textoAtual.length : posAtual + buscaFim;

        const blocoAtual = textoAtual.slice(inicioNum + 1, fimNum);

        // --- REGRAS DE LIMITE ---
        if (!ehOperador) {
            const apenasNumeros = blocoAtual.replace(/[^0-9]/g, "");
            const temVirgula = blocoAtual.includes(",");

            // REGRA: Máximo 15 dígitos no bloco (inteiro + decimal)
            if (apenasNumeros.length >= 15 && !ehVirgula) return;

            // REGRA: Máximo 10 decimais após a vírgula
            if (temVirgula && !ehVirgula) {
                const decimal = blocoAtual.split(",")[1] || "";
                const indiceVirgulaGlobal = inicioNum + 1 + blocoAtual.indexOf(",");
                if (decimal.length >= 10 && posAtual > indiceVirgulaGlobal) return;
            }
            if (temVirgula && ehVirgula) return;
        }

        // --- VALIDAÇÕES DE SEGURANÇA ---
        const ultimoChar = textoAtual.slice(posAtual - 1, posAtual);
        if (["+", "-", "×", "÷", ","].includes(ultimoChar) && (ehOperador || ehVirgula)) return;
        if (textoAtual.length === 0 && ["+", "×", "÷", ","].includes(char)) return;

        // --- INSERÇÃO + MÁSCARA (MILHAR . E DECIMAL ,) ---
        let novoTextoRaw = textoAtual.slice(0, posAtual) + char + textoAtual.slice(posAtual);

        const aplicarMascaraBR = (valor) => {
            return valor.split(/([+\-×÷])/).map(parte => {
                if (operadoresPermitidos.includes(parte) || parte === "") return parte;

                let [inteiro, decimal] = parte.split(",");
                // Limpa pontos de milhar antigos para reajustar
                inteiro = inteiro.replace(/\./g, "");

                // Adiciona ponto a cada 3 dígitos (Milhar)
                const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

                return decimal !== undefined ? `${inteiroFormatado},${decimal}` : inteiroFormatado;
            }).join("");
        };

        const textoFinal = aplicarMascaraBR(novoTextoRaw);
        setCalculo(textoFinal);

        // Ajuste do cursor para não pular com os pontos automáticos
        const diferenca = textoFinal.length - textoAtual.length;
        setCursorPos(posAtual + (diferenca > 0 ? diferenca : 1));
    };

    const apagarUm = () => {
        const textoAtual = calculoRef.current;
        const posAtual = cursorPosRef.current;

        if (posAtual > 0) {
            const novoTexto = textoAtual.slice(0, posAtual - 1) + textoAtual.slice(posAtual);

            setCalculo(novoTexto);
            setCursorPos(posAtual - 1);
            cursorPosRef.current = posAtual - 1;
            calculoRef.current = novoTexto;
        }
    };

    const iniciarApagarContinuo = () => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(apagarUm, 80);
        }
    };

    const pararApagarContinuo = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const limparTudo = () => {
        setCalculo("");
        setCursorPos(0);
    };

    const calcularResultado = () => {
        try {
            // TRADUÇÃO: Remove pontos de milhar e troca vírgula por ponto para o eval
            let expressao = calculo.replace(/\./g, "").replace(/,/g, ".").replace(/×/g, "*").replace(/÷/g, "/");
            let resultado = eval(expressao);

            // VOLTA PARA O FORMATO BR: Máximo 10 decimais, ponto no milhar e vírgula no decimal
            let [int, dec] = Number(resultado.toFixed(10)).toString().split(".");
            let intFormatado = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

            let resultadoFinal = dec !== undefined ? `${intFormatado},${dec}` : intFormatado;

            setCalculo(resultadoFinal);
            setCursorPos(resultadoFinal.length);
        } catch (e) {
            Alert.alert("Erro", "Cálculo inválido");
        }
    };

    const finalizarAnotacao = () => {
        const dadosCompletos = { nome, numero, tipo, fontSize, foto, calculoFinal: calculo };

        // Navega para a Tabela (Tela 4)
        navigation.navigate("Tabela", { dadosCompletos });
    };

    return (
        <View>

            <View>
                <Text style={{ fontSize }}>
                    + ADIÇÃO: {tipo} {nome} (Nº {numero})
                </Text>
            </View>

            <View>
                <TextInput value={calculo} caretHidden={false} onSelectionChange={(event) => setCursorPos(event.nativeEvent.selection.start)} showSoftInputOnFocus={false} />
            </View>

            <View>
                <TouchableOpacity onPress={limparTudo}>
                    <Text style={{ fontSize }}>C</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={apagarUm} onLongPress={iniciarApagarContinuo} onPressOut={pararApagarContinuo}>
                    <Text style={{ fontSize }}>⌫</Text>
                </TouchableOpacity>

                <View>
                    {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, ","].map((n) => (
                        <TouchableOpacity key={n} onPress={() => inserirCaractere(n.toString())} >
                            <Text style={{ fontSize }}>{n}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View>
                    {["÷", "×", "-", "+"].map((op) => (
                        <TouchableOpacity key={op} onPress={() => inserirCaractere(op)}>
                            <Text style={{ fontSize }}>{op}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity onPress={calcularResultado}>
                        <Text style={{ fontSize }}>=</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.btnFinalizar} onPress={finalizarAnotacao}>
                <Text style={{ fontSize }}>
                    {/* fazer depois ser tiver ediçaõ {Editidano ? "CONFIRMAR EDIÇÃO ✅" : "FINALIZAR ✅"} */}
                    FINALIZAR ✅
                </Text>
            </TouchableOpacity>


        </View>
    )
}

const styles = StyleSheet.create({
    // fazer depois
});