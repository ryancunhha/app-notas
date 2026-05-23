import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from "react-native";

const { height: ALTURA_TELA } = Dimensions.get("window");

export default function CalculadoraSamsung({ valorInicial, aoConfirmar }) {
    // ESTADOS
    const [calculo, setCalculo] = useState("");
    const [cursorPos, setCursorPos] = useState(0);
    const calculoRef = useRef("");
    const cursorPosRef = useRef(0);
    const intervalRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const valorTratado = valorInicial ? valorInicial.toString() : "";
        setCalculo(valorTratado);
        setCursorPos(valorTratado.length);
    }, []);

    useEffect(() => {
        calculoRef.current = calculo;
        cursorPosRef.current = cursorPos;
        aoConfirmar(calculo);
    }, [calculo, cursorPos]);

    const inserirCaractere = (char) => {
        const operadoresPermitidos = ["+", "-", "×", "÷"];
        const ehOperador = operadoresPermitidos.includes(char);
        const ehVirgula = char === ",";

        let textoAtual = calculoRef.current;
        const posAtual = cursorPosRef.current;
        const ultimoChar = textoAtual.slice(posAtual - 1, posAtual);

        if (operadoresPermitidos.includes(ultimoChar) && ehOperador) {
            const novoTexto = textoAtual.slice(0, posAtual - 1) + char + textoAtual.slice(posAtual);
            setCalculo(novoTexto);
            return;
        }

        const parteAntes = textoAtual.slice(0, posAtual);
        const parteDepois = textoAtual.slice(posAtual);

        const inicioNum = Math.max(
            parteAntes.lastIndexOf("+"), parteAntes.lastIndexOf("-"),
            parteAntes.lastIndexOf("×"), parteAntes.lastIndexOf("÷")
        );
        const buscaFim = parteDepois.search(/[+\-×÷]/);
        const fimNum = buscaFim === -1 ? textoAtual.length : posAtual + buscaFim;
        const blocoAtual = textoAtual.slice(inicioNum + 1, fimNum);

        if (!ehOperador) {
            const apenasNumeros = blocoAtual.replace(/[^0-9]/g, "");
            const temVirgula = blocoAtual.includes(",");

            if (apenasNumeros.length >= 15 && !ehVirgula) return;

            if (temVirgula && !ehVirgula) {
                const decimal = blocoAtual.split(",")[1] || "";
                const indiceVirgulaGlobal = inicioNum + 1 + blocoAtual.indexOf(",");
                if (decimal.length >= 10 && posAtual > indiceVirgulaGlobal) return;
            }
            if (temVirgula && ehVirgula) return;
        }

        if (["+", "-", "×", "÷", ","].includes(ultimoChar) && (ehOperador || ehVirgula)) return;
        if (textoAtual.length === 0 && ["+", "×", "÷", ","].includes(char)) return;

        let novoTextoRaw = textoAtual.slice(0, posAtual) + char + textoAtual.slice(posAtual);

        const aplicarMascaraBR = (valor) => {
            return valor.split(/([+\-×÷])/).map(parte => {
                if (operadoresPermitidos.includes(parte) || parte === "") return parte;

                let [inteiro, decimal] = parte.split(",");
                inteiro = inteiro.replace(/\./g, "");
                const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

                return decimal !== undefined ? `${inteiroFormatado},${decimal}` : inteiroFormatado;
            }).join("");
        };

        const textoFinal = aplicarMascaraBR(novoTextoRaw);
        setCalculo(textoFinal);

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
            let expressao = calculo.replace(/\./g, "").replace(/,/g, ".").replace(/×/g, "*").replace(/÷/g, "/");
            if (!expressao) return;

            let resultado = eval(expressao);

            let [int, dec] = Number(resultado.toFixed(10)).toString().split(".");
            let intFormatado = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

            let resultadoFinal = dec !== undefined ? `${intFormatado},${dec}` : intFormatado;

            setCalculo(resultadoFinal);
            setCursorPos(resultadoFinal.length);
        } catch (e) {
            Alert.alert("Erro", "Cálculo inválido");
        }
    };

    const enviarValorParaOFormulario = () => {
        const temOperador = /[+\-×÷]/.test(calculo);

        if (temOperador) {
            Alert.alert("Atenção", "Resolva o cálculo clicando no botão '=' antes de confirmar!");
            return;
        }

        aoConfirmar(calculo);
    };

    return (
        <View>
            {/* Visor */}
            <View>
                <TextInput ref={inputRef} value={calculo} caretHidden={false} selectionColor="#007BFF" onSelectionChange={(event) => setCursorPos(event.nativeEvent.selection.start)} showSoftInputOnFocus={false} />
            </View>

            {/* Teclado da Calculadora */}
            <View>
                <View>
                    <TouchableOpacity onPress={limparTudo}>
                        <Text>C</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={apagarUm} onLongPress={iniciarApagarContinuo} onPressOut={pararApagarContinuo}>
                        <Text>⌫</Text>
                    </TouchableOpacity>
                    
                    <View style={[styles.botao, styles.botaoInvisivel]} />
                    
                    <TouchableOpacity onPress={() => inserirCaractere("÷")}>
                        <Text>÷</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    {[7, 8, 9].map((n) => (
                        <TouchableOpacity key={n} onPress={() => inserirCaractere(n.toString())} >
                            <Text>{n}</Text>
                        </TouchableOpacity>
                    ))}
                    
                    <TouchableOpacity onPress={() => inserirCaractere("×")}>
                        <Text>×</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    {[4, 5, 6].map((n) => (
                        <TouchableOpacity key={n} onPress={() => inserirCaractere(n.toString())} >
                            <Text>{n}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={() => inserirCaractere("-")}>
                        <Text>-</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    {[1, 2, 3].map((n) => (
                        <TouchableOpacity key={n} onPress={() => inserirCaractere(n.toString())} >
                            <Text>{n}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity onPress={() => inserirCaractere("+")}>
                        <Text>+</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <View style={[styles.botao, styles.botaoInvisivel]} />
                    <TouchableOpacity onPress={() => inserirCaractere("0")}>
                        <Text>0</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => inserirCaractere(",")}>
                        <Text>,</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={calcularResultado}>
                        <Text>=</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({})