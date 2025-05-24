const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const crypto = require('crypto');

const PERCORSO_UTENTI_JSON = path.join(__dirname, '..', 'json', 'utenti.json');
let utentiInMemoria = [];


class UtenteServer {
    constructor(nome, cognome, email, passwordHash, dataNascita, test = []) {
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.passwordHash = passwordHash;
        this.dataNascita = dataNascita ? new Date(dataNascita).toISOString().split('T')[0] : null;
        this.test = test || [];
    }
}

async function hashPasswordConSHA256_Server(password) {

    return crypto.createHash('sha256').update(password).digest('hex');
}

async function caricareUtentiIniziali() {
    try {
        await fs.mkdir(path.dirname(PERCORSO_UTENTI_JSON), { recursive: true });
        const datiString = await fs.readFile(PERCORSO_UTENTI_JSON, 'utf8');
        const datiJSON = JSON.parse(datiString);
        utentiInMemoria = datiJSON.map(u => new UtenteServer(u.nome, u.cognome, u.email, u.passwordHash, u.dataNascita, u.test));
        console.log("SERVER: Utenti esistenti caricati in memoria da utenti.json.");
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("SERVER: File utenti.json non trovato. Inizio con lista vuota.");
            utentiInMemoria = [];
        } else {
            console.error("SERVER: Errore caricamento utenti.json:", error);
            utentiInMemoria = []; 
        }
    }
}

async function salvareUtentiSuFile() {
    try {
        await fs.mkdir(path.dirname(PERCORSO_UTENTI_JSON), { recursive: true });
        const datiJSONString = JSON.stringify(utentiInMemoria, null, 2);
        await fs.writeFile(PERCORSO_UTENTI_JSON, datiJSONString, 'utf8');
        console.log("SERVER: Lista utenti salvata con successo su utenti.json");
    } catch (error) {
        console.error("SERVER: Errore durante il salvataggio della lista utenti:", error);
        throw error; 
    }
}

const server = http.createServer(async (req, res) => {
    console.log(`SERVER: Ricevuta richiesta - Metodo: ${req.method}, URL: ${req.url}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 


    if (req.method === 'OPTIONS') {
        console.log('SERVER: Ricevuta richiesta OPTIONS (preflight CORS), invio 204.');
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/registra-utente' && req.method === 'POST') {
        let corpoRichiesta = '';
        req.on('data', chunk => { corpoRichiesta += chunk.toString(); });
        req.on('end', async () => {
            try {
                const datiNuovoUtente = JSON.parse(corpoRichiesta);
                if (!datiNuovoUtente.email || !datiNuovoUtente.password || !datiNuovoUtente.nome || !datiNuovoUtente.cognome || !datiNuovoUtente.data_nascita) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Dati mancanti per la registrazione." }));
                }
                if (utentiInMemoria.some(u => u.email === datiNuovoUtente.email)) {
                    res.writeHead(409, { 'Content-Type': 'application/json' }); 
                    return res.end(JSON.stringify({ message: "Email già registrata." }));
                }

                const passwordHashata = await hashPasswordConSHA256_Server(datiNuovoUtente.password);
                const utenteDaSalvare = new UtenteServer(
                    datiNuovoUtente.nome,
                    datiNuovoUtente.cognome,
                    datiNuovoUtente.email,
                    passwordHashata,
                    datiNuovoUtente.data_nascita,
                );
                utentiInMemoria.push(utenteDaSalvare);
                await salvareUtentiSuFile();
                res.writeHead(201, { 'Content-Type': 'application/json' });  
                res.end(JSON.stringify({ message: "Utente registrato con successo.", utente: { email: utenteDaSalvare.email, nome: utenteDaSalvare.nome } }));
            } catch (error) {
                console.error("SERVER: Errore in /registra-utente:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Errore interno del server durante la registrazione." }));
            }
        });
    } else if (req.url === '/login-utente' && req.method === 'POST') {
        let corpoRichiesta = '';
        req.on('data', chunk => { corpoRichiesta += chunk.toString(); });
        req.on('end', async () => {
            try {
                const credenziali = JSON.parse(corpoRichiesta);
                if (!credenziali.email || !credenziali.password) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Email e password sono richieste." }));
                }
                const utenteTrovato = utentiInMemoria.find(u => u.email.toLowerCase() === credenziali.email.toLowerCase());
                if (!utenteTrovato) {
                    res.writeHead(401, { 'Content-Type': 'application/json' }); 
                    return res.end(JSON.stringify({ message: "Credenziali non valide." }));
                }
                const hashPasswordRicevuta = await hashPasswordConSHA256_Server(credenziali.password);
                if (hashPasswordRicevuta === utenteTrovato.passwordHash) {
                    const datiUtenteDaInviare = {
                        email: utenteTrovato.email,
                        nome: utenteTrovato.nome,
                        cognome: utenteTrovato.cognome,
                        data_nascita: utenteTrovato.dataNascita, 
                        test: utenteTrovato.test || [] 
                    };
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Login effettuato con successo.", utente: datiUtenteDaInviare }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Credenziali non valide." }));
                }
            } catch (error) {
                console.error("SERVER: Errore in /login-utente:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Errore interno del server durante il login." }));
            }
        });
    } else if (req.url === '/modifica-utente' && req.method === 'PUT') {
        let corpoRichiesta = '';
        req.on('data', chunk => { corpoRichiesta += chunk.toString(); });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(corpoRichiesta);
                const { emailDaModificare, aggiornamenti } = payload;

                if (!emailDaModificare || !aggiornamenti) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Email utente e dati per l'aggiornamento sono richiesti." }));
                }
                const indiceUtente = utentiInMemoria.findIndex(u => u.email === emailDaModificare);
                if (indiceUtente === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Utente non trovato." }));
                }

                const utenteDaAggiornare = utentiInMemoria[indiceUtente];


                if (aggiornamenti.hasOwnProperty('nome')) utenteDaAggiornare.nome = aggiornamenti.nome;
                if (aggiornamenti.hasOwnProperty('cognome')) utenteDaAggiornare.cognome = aggiornamenti.cognome;
                if (aggiornamenti.hasOwnProperty('data_nascita')) utenteDaAggiornare.dataNascita = new Date(aggiornamenti.data_nascita).toISOString().split('T')[0];
                
                if (aggiornamenti.hasOwnProperty('password') && aggiornamenti.password) {
                    utenteDaAggiornare.passwordHash = await hashPasswordConSHA256_Server(aggiornamenti.password);
                    console.log(`SERVER: Password aggiornata per ${utenteDaAggiornare.email}`);
                }
                
                if (aggiornamenti.hasOwnProperty('test')) {
                    if (Array.isArray(aggiornamenti.test)) {
                        utenteDaAggiornare.test = aggiornamenti.test;
                        console.log(`SERVER: Array test sostituito per ${utenteDaAggiornare.email}. Numero test: ${utenteDaAggiornare.test.length}`);
                    } else {
                        console.warn(`SERVER: 'aggiornamenti.test' non era un array per ${utenteDaAggiornare.email}. Test non aggiornati.`);
                    }
                }

                utentiInMemoria[indiceUtente] = utenteDaAggiornare;
                await salvareUtentiSuFile();

              
                const utenteAggiornatoCliente = {
                    email: utenteDaAggiornare.email,
                    nome: utenteDaAggiornare.nome,
                    cognome: utenteDaAggiornare.cognome,
                    data_nascita: utenteDaAggiornare.dataNascita,
                    test: utenteDaAggiornare.test
                };
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Utente aggiornato con successo.", utente: utenteAggiornatoCliente }));

            } catch (error) {
                console.error("SERVER: Errore in /modifica-utente:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Errore interno del server durante l'aggiornamento dell'utente." }));
            }
        });
    } else if (req.url === '/json/utenti.json' && req.method === 'GET') { 
        try {//
            const utentiFile = await fs.readFile(PERCORSO_UTENTI_JSON, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(utentiFile);
        } catch (e) {
            if (e.code === 'ENOENT') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify([]));
            } else {
                console.error("SERVER: Errore caricamento utenti.json (GET):", e);
                res.writeHead(500);
                res.end("Errore lettura utenti.json");
            }
        }
    }
    else if (req.url === '/' || req.url === '/index.html') {
        try {
            const html = await fs.readFile(path.join(__dirname, '..', 'index.html'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (e) { res.writeHead(404); res.end("index.html non trovato"); }
    }

    else if (req.url === '/quiz.js') { 
        try {
            const jsContent = await fs.readFile(path.join(__dirname, '..', 'quiz.js'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(jsContent);
        } catch (e) { res.writeHead(404); res.end("quiz.js non trovato"); }
    }

    else if (req.url === '/libreriaclassi.js') {
        try {
            const jsContent = await fs.readFile(path.join(__dirname, '..', 'libreriaclassi.js'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(jsContent);
        } catch (e) { res.writeHead(404); res.end("libreriaclassi.js non trovato"); }
    }
     else {

        console.log(`SERVER: Endpoint non trovato per ${req.method} ${req.url}. Invio 404.`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Endpoint non trovato sul server." }));
    }
});

const PORTA = 3000;
caricareUtentiIniziali().then(() => {
    server.listen(PORTA, () => {
        console.log(`Server in ascolto su http://localhost:${PORTA}`);
        console.log(`Assicurati che il client faccia richieste a questo indirizzo o che l'IP sia accessibile dalla rete locale se usi dispositivi diversi.`);
        console.log(`Percorso utenti.json: ${PERCORSO_UTENTI_JSON}`);
    });
}).catch(error => {
    console.error("SERVER: Impossibile avviare il server a causa di un errore nel caricamento iniziale degli utenti:", error);
});