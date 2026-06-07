import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from "react-native";

const { height: ALTURA_TELA } = Dimensions.get("window");

export default function CalculadoraSamsung({ valorInicial, aoConfirmar }) {
    // ESTADOS
    const [calculo, setCalculo] = useState("");
    const [cursorPos, setCursorPos] = useState(0);
    const [preResultado, setPreResultado] = useState("");
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

        let valorTratado = calculo.trim();
        if (/[+\-×÷]$/.test(valorTratado)) {
            valorTratado = valorTratado.slice(0, -1);
        }
        aoConfirmar(valorTratado);

        try {
            let expressao = calculo.replace(/\./g, "").replace(/,/g, ".").replace(/×/g, "*").replace(/÷/g, "/");

            const temOperador = /[+*\/]/.test(expressao);
            const terminaComNumero = /[0-9]$/.test(expressao);

            if (temOperador && terminaComNumero) {
                let resEv = eval(expressao);
                let [int, dec] = Number(resEv.toFixed(6)).toString().split(".");
                let intFormatado = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                setPreResultado(dec !== undefined ? `= ${intFormatado},${dec}` : `= ${intFormatado}`);
            } else {
                setPreResultado("");
            }
        } catch (e) {
            setPreResultado("");
        }
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

            if (/[+\-*\/]$/.test(expressao)) {
                expressao = expressao.slice(0, -1);
            }

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

    const confirmarEEnviarValor = () => {
        let valorTratado = calculo.trim();

        if (!valorTratado || valorTratado === "0") {
            aoConfirmar("");
            if (aoFechar) aoFechar();
            return;
        }

        if (/[+\-×÷]$/.test(valorTratado)) {
            valorTratado = valorTratado.slice(0, -1);
        }

        aoConfirmar(valorTratado);
        if (aoFechar) aoFechar();
    };

    return (
        <View style={styles.container}>
            {/* Visor */}
            <View style={styles.displayContainer}>
                <TextInput style={styles.textoDisplay} scrollEnabled={true} ref={inputRef} value={calculo} caretHidden={false} selectionColor="#007BFF" onSelectionChange={(event) => setCursorPos(event.nativeEvent.selection.start)} showSoftInputOnFocus={false} multiline={true} />

                {preResultado !== "" && (
                    <Text style={styles.textoPreResultado}>{preResultado}</Text>
                )}
            </View>

            {/* Teclado da Calculadora */}
            <View style={{ gap: 10 }}>
                <View style={styles.linha}>
                    <TouchableOpacity onPress={limparTudo} style={[styles.botao, styles.btnLimpar, { flex: 1.5, aspectRatio: "auto" }]}>
                        <Text style={[styles.textoBotao, { color: "#FF5252" }]}>C</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.botao, styles.btnAcaoLongo, { flex: 1.5, aspectRatio: "auto" }]} onPress={apagarUm} onLongPress={iniciarApagarContinuo} onPressOut={pararApagarContinuo}>
                        <Text style={[styles.textoBotao, { color: "#007BFF" }]}>⌫</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => inserirCaractere("÷")} style={[styles.botao, styles.btnOperacao]}>
                        <Text style={styles.textoOperacao}>÷</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.linha}>
                    {[7, 8, 9].map((n) => (
                        <TouchableOpacity key={n} onPress={() => inserirCaractere(n.toString())} style={styles.botao}>
                            <Text style={styles.textoBotao}>{n}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity onPress={() => inserirCaractere("×")} style={[styles.botao, styles.btnOperacao]}>
                        <Text style={styles.textoOperacao}>×</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.linha}>
                    {[4, 5, 6].map((n) => (
                        <TouchableOpacity key={n} onPress={() => inserirCaractere(n.toString())} style={styles.botao}>
                            <Text style={styles.textoBotao}>{n}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={() => inserirCaractere("-")} style={[styles.botao, styles.btnOperacao]}>
                        <Text style={styles.textoOperacao}>-</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.linha}>
                    {[1, 2, 3].map((n) => (
                        <TouchableOpacity key={n} onPress={() => inserirCaractere(n.toString())} style={styles.botao}>
                            <Text style={styles.textoBotao}>{n}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity onPress={() => inserirCaractere("+")} style={[styles.botao, styles.btnOperacao]}>
                        <Text style={styles.textoOperacao}>+</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.linha}>
                    <TouchableOpacity onPress={() => inserirCaractere("0")} style={[styles.botao, { flex: 2, aspectRatio: "auto" }]}>
                        <Text style={styles.textoBotao}>0</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => inserirCaractere(",")} style={styles.botao}>
                        <Text style={styles.textoBotao}>,</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={calcularResultado} style={[styles.botao, styles.btnIgual]}>
                        <Text style={[styles.textoBotao, { color: "#FFF" }]}>=</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Geral
    container: {
        borderRadius: 16,
        padding: 12,
        width: "100%",
        alignSelf: "center",
    },

    // Visor
    displayContainer: {
        backgroundColor: "#F7F9FC",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        height: 110,
        justifyContent: "space-between",
    },
    textoDisplay: {
        color: "#000",
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "right",
        width: "100%",
        height: 65,
    },
    textoPreResultado: {
        color: "#777",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "right",
        height: 24,
    },

    // Tecaldo
    linha: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    botao: {
        flex: 1,
        aspectRatio: 1.1,
        backgroundColor: "#2D2D2D",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    botaoInvisivel: {
        backgroundColor: "transparent",
    },
    textoBotao: {
        color: "#E2E8F0",
        fontSize: 20,
        fontWeight: "600",
    },
    textoOperacao: {
        color: "#007BFF",
        fontSize: 22,
        fontWeight: "bold",
    },
    btnOperacao: {
        backgroundColor: "rgba(0, 123, 255, 0.12)",
    },
    btnLimpar: {
        backgroundColor: "rgba(255, 82, 82, 0.1)",
    },
    btnAcaoLongo: {
        backgroundColor: "rgba(0, 123, 255, 0.06)",
    },
    btnIgual: {
        backgroundColor: "#007BFF",
    },
})