const express = require('express');
const app = express();
const wppconnect = require('@wppconnect-team/wppconnect');
let Instancia;
let contatoReserva = "5511951991446";
let contatoEvento = "5511951991446";

app.use(express.json());
app.use(express.urlencoded({ extended : true }));


app.get('/Status', async function (req, res) {

    console.log("Solicitou status de conexao");

    const response = {
        status: false,
        message: ""
    }

    const executa = async() => {

            if (typeof(Instancia) === "object"){ 
                response.status = true;
                response.message = await Instancia.getConnectionState();
            }else{
                response.message = "A instancia não foi inicializada";              
            }
            res.send(response); 
    };
    executa();
});

app.post('/Eventos', async function (req, res) {

    console.log( "Houve uma solicitação para envio de 'Eventos'" );

    const data = {
        id: req.body.ContatoID,
        nome: req.body.ContatoNome,
        email: req.body.ContatoEmail,
        restaurante: req.body.ContatoRestaurante,
    }

    const response = {
        status: false,
        message: ""
    }

    const executa = async()=>{

            if (typeof(Instancia) === "object"){ 
                status = await Instancia.getConnectionState();

                if(status === 'CONNECTED'){
                    let numeroexiste = await Instancia.checkNumberStatus( contatoEvento + "@c.us" );  //Validando se o número existe ... Validating if the number exists
                    if(numeroexiste.canReceiveMessage===true){
                       await Instancia
                            .sendText(
                                numeroexiste.id._serialized, 
                                `Olá! Um pedido de cotação para eventos foi enviado para o restaurante _${data.restaurante}_!`+"\n\n"+
                                `📃 Nome: ${data.nome}`+"\n"+
                                `✉ Email: ${data.email}`+"\n"+
                                `📞 Telefone: ${data.id}`+"\n\n"+
                                `*_Essa mensagem foi enviada automáticamente._*`
                            ).then((result) => {
                                console.log('Result: ', result);
                                response.status = true;
                                response.message = result
                            }).catch((erro) => {
                                console.error('Error when sending: ', erro);
                            });
                    }else{
                        mensagemretorno='O numero não está disponível ou está bloqueado';
                    }
                }else{                          
                    mensagemretorno = 'Valide sua conexao com a internet ou QRCODE';
                }
            }else{
                mensagemretorno = 'A instancia não foi inicializada';               
            }

            res.send(response); 
    };
    executa();

});

app.post('/Reserva', async function (req, res) {

    console.log( "Houve uma solicitação para envio de 'Reserva'" );

    const data = {
        id: req.body.ContatoID,
        nome: req.body.ContatoNome,
        email: req.body.ContatoEmail,
        restaurante: req.body.ContatoRestaurante,
        reservaDia: req.body.ContatoReservaDia.replace( ".", "/" ),
        reservaHorario: req.body.ContatoReservaHorario,
        reservaPessoa: req.body.ContatoReservaPessoa,
        reservaNumero: req.body.ContatoReservaNumero,
    }

    const response = {
        status: false,
        message: ""
    }

    const executa = async()=>{

            if (typeof(Instancia) === "object"){ 
                status = await Instancia.getConnectionState();

                if(status === 'CONNECTED'){
                    let numeroexiste = await Instancia.checkNumberStatus( contatoReserva + "@c.us" );  //Validando se o número existe ... Validating if the number exists
                    if(numeroexiste.canReceiveMessage===true){
                       await Instancia
                            .sendText(
                                numeroexiste.id._serialized, 
                                `Olá! Uma reserva foi gerada com sucesso!`+"\n\n"+
                                `📃 Nome: ${data.nome}`+"\n"+
                                `✉ Email: ${data.email}`+"\n"+
                                `📞 Telefone: ${data.id}`+"\n\n"+
                                `📃 Número da Reserva: #${data.reservaNumero}`+"\n"+
                                `👥 Quantidade de Pessoas: ${data.reservaPessoa}`+"\n"+
                                `📅 Dia da Reserva: ${data.reservaDia}`+"\n"+
                                `🕛 Horário Marcado: ${data.reservaHorario}`+"\n\n"+

                                `*_Essa mensagem foi enviada automáticamente._*`
                            ).then((result) => {
                                console.log('Result: ', result);
                                response.status = true;
                                response.message = result
                            }).catch((erro) => {
                                console.error('Error when sending: ', erro);
                            });
                    }else{
                        mensagemretorno='O numero não está disponível ou está bloqueado';
                    }
                }else{                          
                    mensagemretorno = 'Valide sua conexao com a internet ou QRCODE';
                }
            }else{
                mensagemretorno = 'A instancia não foi inicializada';               
            }

            res.send(response); 
    };
    executa();

});
  
startWPP(); 

async function startWPP (){ 
    await wppconnect.create({session: 'GrupomaxTecnologiaWPP',
        catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
    },  
    statusFind: (statusSession, session) => {
        console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
        //Create session wss return "serverClose" case server for close
        console.log('Session name: ', session);
    },
        headless: true, // Headless chrome
        devtools: false, // Open devtools by default
        useChrome: true, // If false will use Chromium instance
        debug: false, // Opens a debug session
        logQR: true, // Logs QR automatically in terminal
        browserWS: '', // If u want to use browserWSEndpoint
        browserArgs: [''], // Parameters to be added into the chrome browser instance
        puppeteerOptions: {}, // Will be passed to puppeteer.launch
        disableWelcome: false, // Option to disable the welcoming message which appears in the beginning
        updatesLog: true, // Logs info updates automatically in terminal
        autoClose: 60000, // Automatically closes the wppconnect only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
        tokenStore: 'file', // Define how work with tokens, that can be a custom interface
        folderNameToken: './tokens', //folder name when saving tokens
    }).then((client) => {
            start(client);
    }).catch((erro) => console.log(erro));

}

async function start(client) {
    Instancia = client; //Será utilizado nas requisições REST ..... It will be used in REST requests

    client.onMessage( async (message) => {

    }); 
    client.onAck(ack => {

    });
    client.onStateChange( async (state) => {

    });

}

const server = app.listen( "80" );
console.log('Servidor iniciado na porta %s', server.address().port);