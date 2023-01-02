const { type } = require('os');
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const separador = `    -----------------------------------------------------------------------------------------------------------------`;

let pecasTotal = ['0x0', '0x1', '0x2', '0x3', '0x4', '0x5', '0x6',
    '1x1', '1x2', '1x3', '1x4', '1x5', '1x6',
    '2x2', '2x3', '2x4', '2x5', '2x6',
    '3x3', '3x4', '3x5', '3x6',
    '4x4', '4x5', '4x6',
    '5x5', '5x6',
    '6x6'];

let jogador1, jogador2, mesaTotal = [], mesaJogo = [], cemiterio = [], jogadorDaVez, pecaEscolhida,
    pecaCemiterio = null, temPecaParaJogar = false, ladoMesaParaJogar = null;

// CONSTRUTOR PARA CRIAR JOGADORES
class Jogador {
    constructor(posicao, nome = null) {
        this.posicao = posicao;
        this.nome = nome;
        this.pecas = [];
        this.passouVez = false;
    }
}

const criarJogador1 = () => {
    return new Promise((resolve, reject) => {
        rl.question('Qual o nome do jogador 1? ', (nome) => {
            jogador1 = new Jogador(1, nome);  // Cria o objeto jogador1, a partir do construtor
            resolve();
        });
    })
}

const criarJogador2 = () => {
    return new Promise((resolve, reject) => {
        rl.question('Qual o nome do jogador 2? ', (nome) => {
            jogador2 = new Jogador(2, nome);  // Cria o objeto jogador2, a partir do construtor
            resolve();
        });
    })
}

const puxarPecasDoTotal = jogador => {
    for (let i = 0; i < 7; i++) {
        const peca = pecasTotal[Math.trunc(Math.random() * pecasTotal.length)];  // Sorteia uma peça do total 
        jogador.pecas.push(peca);  // Jogador recebe essa peça sorteada
        mesaTotal.push(peca);
        pecasTotal.splice(pecasTotal.indexOf(peca), 1);  //Essa peça é removida do total restante de peças
    }
    cemiterio = pecasTotal;  // O cemitério fica com o que sobrou do total de peças
}

const verificarQuemComeça = () => {
    // Começa quem tem a bomba maior
    const bombas = ['6x6', '5x5', '4x4', '3x3', '2x2', '1x1', '0x0'];
    let bombaMaior = false;

    CompararComBombas:
    for (let bomba of bombas) {   // Compara a partir da bomba mais alta, se cada um dos dois jogadores tem
        for (let i in jogador1.pecas) {  // Compara cada peça do jogador1 com uma bomba
            if (jogador1.pecas[i] == bomba) {
                bombaMaior = true;
                jogadorDaVez = jogador1;
                jogarPrimeiraPeça(jogador1, i);
                break CompararComBombas;
            }
        }
        for (let i in jogador2.pecas) {  // Compara cada peça do jogador2 com uma bomba
            if (jogador2.pecas[i] == bomba) {
                bombaMaior = true;
                jogadorDaVez = jogador2;
                jogarPrimeiraPeça(jogador2, i);
                break CompararComBombas;
            }
        }
    }

    if (!bombaMaior) {    //Caso ninguém tenha uma bomba para se iniciar a partida, joga quem tem a peça maior 
        let somaCadaPecaJogador1 = [], somaCadaPecaJogador2 = [];

        jogador1.pecas.map(peca => somaCadaPecaJogador1.push(Number(peca[0]) + Number(peca[2])));        
        jogador2.pecas.map(peca => somaCadaPecaJogador2.push(Number(peca[0]) + Number(peca[2])));

        //Comparar os dois arrays e verificar quem tem a maior peça
        const maiorPecaJogador1 = somaCadaPecaJogador1.reduce(function(a, b) {
            return Math.max(a, b);
        });
        const maiorPecaJogador2 = somaCadaPecaJogador2.reduce(function(a, b) {
            return Math.max(a, b);
        });

        const indexMaiorPecaJogador1 = somaCadaPecaJogador1.indexOf(maiorPecaJogador1);
        const indexMaiorPecaJogador2 = somaCadaPecaJogador2.indexOf(maiorPecaJogador2);

        if(maiorPecaJogador1 > maiorPecaJogador2) {
            jogadorDaVez = jogador1;
            jogarPrimeiraPeça(jogador1, indexMaiorPecaJogador1);
        } else {
            jogadorDaVez = jogador2;
            jogarPrimeiraPeça(jogador2, indexMaiorPecaJogador2);
        }
    }
}

const jogarPrimeiraPeça = (jogador, i) => {
    mesaJogo.push(jogador.pecas[i]);  // jogador joga a peça
    jogador.pecas.splice(i, 1);  //  remove a peça que acabou de ser jogada 
    mudarJogadorDaVez();
    console.log(`\n\n    ${jogador.nome} começou jogando!`);
}

const mostrarPecasNasMaos = () => {
    return `\n\n\t\t ${jogador1.nome}:    ${jogador1.pecas}     |     ${jogador2.nome}:    ${jogador2.pecas} \n`;
}

const mostrarMesaAtual = () => {
    return `\n\n\n\t ${mesaJogo.join(' <-> ')} \n`;
}

const retornarLadosMesa = () => {
    const ladosMesa = [];

    const primeiroCharMesa = mesaJogo[0].substr(0, 1);
    const ultimoCharMesa = mesaJogo[mesaJogo.length - 1].substr(2, 1);

    ladosMesa[0] = primeiroCharMesa;
    ladosMesa[1] = ultimoCharMesa;

    return ladosMesa;
}

const mudarJogadorDaVez = () => {
    if (jogadorDaVez == jogador1) {  // jogadorDaVez muda
        jogadorDaVez = jogador2;
    } else if (jogadorDaVez == jogador2) {
        jogadorDaVez = jogador1;
    }
}

const compararPecaComLadosDaMesa = (lado1, lado2) => {
    const ladosMesa = retornarLadosMesa();

    if (lado1 == ladosMesa[0] ||  // Verifica se a peça puxada pode ser jogada 
        lado1 == ladosMesa[1] ||
        lado2 == ladosMesa[0] ||
        lado2 == ladosMesa[1]) {
        //console.log(jogadorDaVez.nome + ' >> ' + lado1 + 'x' + lado2);
        return true;
    } else {
        return false;
    }
}

const verificarSeTemPecaNaMao = () => {
    /* Verifica se jogadorDaVez tem ao menos um dos lados de mesaJogo (Primeiro
    character do primeiro elemento do array ou ultimo character do ultimo elemento
    desse array). Se não tiver, puxarPecaCemiterio(); */

    //console.log(jogadorDaVez.nome);

    temPecaParaJogar = false;  // Inicializa sempre como false para seguir os loops
    pecaCemiterio = null;

    for (let i = 0; i < jogadorDaVez.pecas.length; i++) {  //Percorre as peças do jogador da vez
        const primeiroCharPeca = jogadorDaVez.pecas[i][0];
        const ultimoCharPeca = jogadorDaVez.pecas[i][2];

        if (compararPecaComLadosDaMesa(primeiroCharPeca, ultimoCharPeca) == true) {
            temPecaParaJogar = true;
        }
    }

    if (temPecaParaJogar == false) {
        puxarPecaCemiterio();
    }
}

const puxarPecaCemiterio = () => {
    /* Puxa peça do cemitério enquanto a peça não existir ao menos em um dos lados
    de mesaJogo (Primeiro character do primeiro elemento do array ou ultimo character 
    do ultimo elemento desse array). */

    while (temPecaParaJogar == false) {

        if (cemiterio.length > 0) {  // Se existir peça no cemitério
            pecaCemiterio = cemiterio[Math.trunc(Math.random() * cemiterio.length)];
            jogadorDaVez.pecas.push(pecaCemiterio);
            console.log(`${jogadorDaVez.nome} puxou uma peça do cemitério: ${pecaCemiterio}`);
            cemiterio.splice(cemiterio.indexOf(pecaCemiterio), 1);  // Essa peça é removida do cemitério

            //console.log(jogadorDaVez.pecas);

            const primeiroCharPecaCemiterio = pecaCemiterio[0];
            const ultimoCharPecaCemiterio = pecaCemiterio[2];

            //console.log(primeiroCharPecaCemiterio+'x'+ultimoCharPecaCemiterio);

            if (compararPecaComLadosDaMesa(primeiroCharPecaCemiterio, ultimoCharPecaCemiterio) == true) {
                temPecaParaJogar = true;
            }
        } else {
            jogadorDaVez.passouVez = true;
            temPecaParaJogar = true;  // Para sair do loop

            console.log(separador);
            console.log(`\t ${jogadorDaVez.nome} passou a vez!`);
            console.log(separador);

            verificarSeFechouJogo();
            mudarJogadorDaVez();
            verificarSeTemPecaNaMao();
        }
    }
}

const verificarSeFechouJogo = () => {
    if (jogador1.passouVez == true && jogador2.passouVez == true) {
        //Verificar quem tem menos pontos e finalizar partida   
        const pontosJ1 = 0;
        const pontosJ2 = 0;

        for (let i = 0; i < jogador1.pecas.length; i++) {  // Conta os pontos do jogador 1
            pontosJ1 += jogador1.pecas[i][0];
            pontosJ1 += jogador1.pecas[i][2];
        }

        for (let i = 0; i < jogador2.pecas.length; i++) {  // Conta os pontos do jogador 2
            pontosJ2 += jogador2.pecas[i][0];
            pontosJ2 += jogador2.pecas[i][2];
        }

        if (pontosJ1 > pontosJ2) {
            console.log(`${jogador1.nome} venceu a partida!`);
        } else if (pontosJ2 > pontosJ1) {
            console.log(`${jogador2.nome} venceu a partida!`);
        } else {
            console.log(`Empate!`);
        }

        console.log(mostrarPecasNasMaos());

        process.abort();
    }
}

const solicitarPecaJogador = (pecaCemiterio = null) => {
    if (pecaCemiterio == null) {  // Caso não seja puxado nenhuma peça do cemitério
        return new Promise((resolve, reject) => {
            rl.question('Qual a peça a ser jogada? ', (resposta) => {
                pecaEscolhida = resposta;
                validarPecaEscolhida();

                resolve();
            });
        })
    } else {
        pecaEscolhida = pecaCemiterio;
    }
}

const validarPecaEscolhida = () => {  // Validar valor digitado pelo usuário
    // Deve ser Number (!NaN) // Deve ser 'x' // Deve ter 3 caracteres
    //Valida formato de peça jogada

    if (pecaEscolhida.length != 3 || isNaN(pecaEscolhida[0]) || isNaN(pecaEscolhida[2]) || pecaEscolhida[1] != 'x') {
        console.log('Formato inválido. Jogue novamente!');
        //solicitarPecaJogador(); //Resolver erro!
    } else if (jogadorDaVez.pecas.indexOf(pecaEscolhida) == -1) {  //Valida se jogador tem peça
        console.log('Você não tem a peça escolhida. Jogue novamente!');
        //solicitarPecaJogador(); //Resolver erro!
    } else if (mesaJogo.length !== 0) {
        const ladosMesa = retornarLadosMesa();  // Array pegando os dois lados da mesa 
        // [0] = Primeiro character do primeiro elemento da mesa
        // [1] = Ultimo character do ultimo elemento da mesa

        if (pecaEscolhida[0] != ladosMesa[0] && pecaEscolhida[0] != ladosMesa[1] &&
            pecaEscolhida[2] != ladosMesa[0] && pecaEscolhida[2] != ladosMesa[1]) {  //Valida se pode ser jogada (tem lado na mesa)
            console.log('Peça não pode ser jogada. Jogue novamente!');
            //solicitarPecaJogador(); //Resolver erro!
        }
    }
}

const verificarSePodeEscolherLadoParaJogar = () => {
    //Verifica se tem nos dois lados, se tiver, deve escolher onde jogar. Se não, joga logo
    const ladosMesa = retornarLadosMesa();

    if (pecaEscolhida[0] == ladosMesa[0] && pecaEscolhida[1] == ladosMesa[1] ||
        pecaEscolhida[0] == ladosMesa[1] && pecaEscolhida[1] == ladosMesa[0]) {
        return true;
    } else {
        return false;
    }
}

const solicitarLadoParaJogar = () => {
    return new Promise((resolve, reject) => {
        rl.question('Escolha o lado para jogar: 1 - Esquerda / 2 - Direita: ', (resposta) => {
            ladoMesaParaJogar = validarLadoParaJogar(resposta);
            resolve();
        });
    })
}

const validarLadoParaJogar = (resposta) => {
    if (resposta != 1 || resposta != 2) {
        console.log('Opção inválida. Jogue novamente!');
        //solicitarLadoParaJogar();  //Resolver erro;
    } else {
        return resposta;
    }
}

const jogarPeca = (ladoMesaParaJogar = null) => {
    //Joga peça na mesa
    if (mesaJogo.length == 0) {
        mesaJogo[0] = pecaEscolhida;
    } else {
        const pecaEscolhidaInvertida = pecaEscolhida[2] + 'x' + pecaEscolhida[0];
        const ladosMesa = retornarLadosMesa();

        if (ladoMesaParaJogar == null) {  //Só pode jogar em um dos lados da mesa
            if (ladosMesa[0] == pecaEscolhida[0] || ladosMesa[0] == pecaEscolhida[2]) {  // Lado esquerdo da mesa

                if (ladosMesa[0] == pecaEscolhida[0]) {  // Lado esquerdo da peça
                    mesaJogo.unshift(pecaEscolhidaInvertida);  //Inverte string e adiciona como primeiro elemento do array da mesa
                } else {  // Lado direito da peça  
                    mesaJogo.unshift(pecaEscolhida);  //Mantém string e adiciona como primeiro elemento do array da mesa
                }
            } else if (ladosMesa[1] == pecaEscolhida[0] || ladosMesa[1] == pecaEscolhida[2]) {  // Lado direito da mesa            

                if (ladosMesa[1] == pecaEscolhida[0]) {  // Lado esquerdo da peça
                    mesaJogo.push(pecaEscolhida);  //Mantém string e adiciona como ultimo elemento do array da mesa
                } else {  // Lado direito da peça 
                    mesaJogo.push(pecaEscolhidaInvertida)  //Inverte string e adiciona como ultimo elemento do array da mesa
                }
            }

        } else if (ladoMesaParaJogar == 1) {  //Pode jogar nos dois lados e escolheu o lado da esquerda
            if (ladosMesa[0] == pecaEscolhida[0]) {  // Lado esquerdo da peça
                mesaJogo.unshift(pecaEscolhidaInvertida);  //Inverte string e adiciona como primeiro elemento do array da mesa
            } else {  // Lado direito da peça
                mesaJogo.unshift(pecaEscolhida);  //Mantém string e adiciona como primeiro elemento do array da mesa
            }
        } else if (ladoMesaParaJogar == 2) {  //Pode jogar nos dois lados e escolheu o lado da direita
            if (ladosMesa[1] == pecaEscolhida[0]) {  // Lado esquerdo da peça
                mesaJogo.push(pecaEscolhida);  //Mantém string e adiciona como ultimo elemento do array da mesa
            } else {  // Lado direito da peça
                mesaJogo.push(pecaEscolhidaInvertida)  //Inverte string e adiciona como ultimo elemento do array da mesa
            }
        }
    }

    jogadorDaVez.pecas.splice(jogadorDaVez.pecas.indexOf(pecaEscolhida), 1);  //Remove a peça que acabou de ser jogada  
    mudarJogadorDaVez();

    //Inicializando variáveis
    ladoMesaParaJogar = null;
    pecaEscolhida = null;
    jogador1.passouVez = false; // Inicializa jogador1.passouVez para valor padrão
    jogador2.passouVez = false; // Inicializa jogador2.passouVez para valor padrão
}

const main = async () => {
    await criarJogador1();
    await criarJogador2();

    puxarPecasDoTotal(jogador1);
    puxarPecasDoTotal(jogador2);
    
    console.log(mostrarPecasNasMaos());
    
    verificarQuemComeça();

    while (jogadorDaVez.pecas.length != 0) {
        console.log(mostrarMesaAtual());
        console.log(separador);
        console.log(mostrarPecasNasMaos());
        console.log(`\n    ${jogadorDaVez.nome} está na vez!\n`);
        if (mesaJogo.length !== 0) {
            verificarSeTemPecaNaMao();  // Verifica as peças na mão em relação aos lados da mesa
        }  //**Verificar update de verificarSeFechouJogo();
        await solicitarPecaJogador(pecaCemiterio);  // pecaCemiterio está definida como null, caso jogadorDaVez puxou peça de cemiterio, não pergunta nada e joga a peça
        //**Resolver erros de validarPecaEscolhida(); && **esperar comando para puxar peça do cemitério
        if (mesaJogo.length !== 0) {
            if (verificarSePodeEscolherLadoParaJogar()) {
                solicitarLadoParaJogar();  //**Resolver erro de solicitarLadoParaJogar();
                //**Resolver erro de validarLadoParaJogar();
            }
        }
        jogarPeca(ladoMesaParaJogar);  // Caso o jogador da vez possa jogar nos dois lados
        //**Resolver erro de finalizar partida somente quando o proximo jogador jogar
    }
    rl.close();
    console.log(`${jogadorDaVez.nome} ganhou a partida!`);
}

main();