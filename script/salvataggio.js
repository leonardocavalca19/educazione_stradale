const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const crypto = require('crypto');

const PERCORSO_UTENTI_JSON = path.join(__dirname, '..', 'json', 'utenti.json');
let utentiInMemoria = [];
class UtenteServer {
    constructor(nome, cognome, email, passwordHash, dataNascita, test) {
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.passwordHash = passwordHash;
        this.dataNascita = new Date(dataNascita).toISOString().split('T')[0];
        this.test = test
    }
}

async function hashPasswordConSHA256_Server(password) {
    if (typeof global.crypto !== 'undefined' && global.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await global.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
        return crypto.createHash('sha256').update(password).digest('hex');
    }
}

async function caricareUtentiIniziali() {
    try {
        await fs.mkdir(path.dirname(PERCORSO_UTENTI_JSON), { recursive: true });
        const dati = JSON.parse(await fs.readFile(PERCORSO_UTENTI_JSON, 'utf8'));
        for (let i = 0; i < dati.length; i++) {
            utentiInMemoria.push(new UtenteServer(dati[i].nome, dati[i].cognome, dati[i].email, dati[i].passwordHash, dati[i].dataNascita, dati[i].test))
        }

        console.log("Utenti esistenti caricati in memoria da utenti.json.");
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("File utenti.json non trovato. Inizio con lista vuota.");
            utentiInMemoria = [];
        } else {
            console.error("Errore caricamento utenti.json:", error);
        }
    }
}

async function salvareUtentiSuFile() {
    try {
        await fs.mkdir(path.dirname(PERCORSO_UTENTI_JSON), { recursive: true });
        const datiJSONString = JSON.stringify(utentiInMemoria, null, 2);
        await fs.writeFile(PERCORSO_UTENTI_JSON, datiJSONString, 'utf8');
        console.log("Lista utenti salvata con successo su utenti.json");
    } catch (error) {
        console.error("Errore durante il salvataggio della lista utenti:", error);
        throw error;
    }
}

const server = http.createServer(async (req, res) => {
    console.log(`SERVER: Ricevuta richiesta - Metodo: ${req.method}, URL: ${req.url}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    if (req.url === '/registra-utente' && req.method === 'POST') {
        console.log("SERVER: Endpoint /registra-utente (POST) raggiunto.");
        let corpoRichiesta = '';
        req.on('data', chunk => { corpoRichiesta += chunk.toString(); });
        req.on('end', async () => {
            console.log("SERVER: Corpo richiesta per /registra-utente:", corpoRichiesta);
            try {
                const datiNuovoUtente = JSON.parse(corpoRichiesta);
                console.log("SERVER: Dati parsati da /registra-utente:", datiNuovoUtente);
                if (!datiNuovoUtente.email || !datiNuovoUtente.password || !datiNuovoUtente.nome) {
                    console.error("SERVER: Dati mancanti o non validi da /registra-utente");
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Dati mancanti o non validi." }));
                }
                if (utentiInMemoria.some(u => u.email === datiNuovoUtente.email)) {
                    console.warn("SERVER: Email già registrata:", datiNuovoUtente.email);
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Email già registrata." }));
                }
                const passwordInChiaro = datiNuovoUtente.password;
                const passwordHashata = await hashPasswordConSHA256_Server(passwordInChiaro);
                console.log("SERVER: Password hashata per /registra-utente.");
                const utenteDaSalvare = new UtenteServer(
                    datiNuovoUtente.nome,
                    datiNuovoUtente.cognome,
                    datiNuovoUtente.email,
                    passwordHashata,
                    datiNuovoUtente.data_nascita,
                    datiNuovoUtente.test
                );

                utentiInMemoria.push(utenteDaSalvare);
                await salvareUtentiSuFile();

                res.writeHead(201, { 'Content-Type': 'application/json' });

            } catch (error) {
                console.error("SERVER: Errore in /registra-utente:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Errore interno del server durante la registrazione." }));
            }
        });

    }
    else if (req.url === '/modifica-utente' && req.method === 'PUT') {
        console.log("SERVER: Endpoint /modifica-utente (PUT) raggiunto.");
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        let corpoRichiesta = '';
        req.on('data', chunk => { corpoRichiesta += chunk.toString(); });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(corpoRichiesta);
                const emailDaModificare = payload.emailDaModificare;
                const aggiornamenti = payload.aggiornamenti;

                if (!emailDaModificare || !aggiornamenti) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Email dell'utente da modificare e dati per l'aggiornamento sono richiesti." }));
                }

                console.log(`SERVER: Richiesta di modifica per l'utente con email: ${emailDaModificare}`);
                console.log("SERVER: Dati di aggiornamento ricevuti:", aggiornamenti);

                const indiceUtente = utentiInMemoria.findIndex(u => u.email === emailDaModificare);

                if (indiceUtente === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Utente non trovato con l'email fornita." }));
                }

                const utenteDaAggiornare = utentiInMemoria[indiceUtente];
                if (aggiornamenti.hasOwnProperty('nuovoQuizCompletato')) {

                    if (!utenteDaAggiornare.test) {
                        utenteDaAggiornare.test = [];
                    }

                    utenteDaAggiornare.test.push(aggiornamenti.nuovoQuizCompletato);
                    console.log(`SERVER: Aggiunto nuovo quiz completato per utente: ${utenteDaAggiornare.email}`);
                }
                if (aggiornamenti.hasOwnProperty('password') && aggiornamenti.password) {
                    console.log(`SERVER: Inizio aggiornamento password per l'utente: ${utenteDaAggiornare.email}`);
                    utenteDaAggiornare.passwordHash = await hashPasswordConSHA256_Server(aggiornamenti.password); //
                    console.log(`SERVER: Password aggiornata e hashata per l'utente: ${utenteDaAggiornare.email}`);
                }

                utentiInMemoria[indiceUtente] = utenteDaAggiornare;

                await salvareUtentiSuFile();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Utente aggiornato con successo.", utente: utenteDaAggiornare }));

            } catch (error) {
                console.error("SERVER: Errore durante l'aggiornamento dell'utente in /modifica-utente:", error);
                if (error instanceof SyntaxError) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Corpo della richiesta JSON non valido." }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Errore interno del server durante l'aggiornamento dell'utente." }));
                }
            }
        });
    }
    else if (req.url === '/login-utente' && req.method === 'POST') {
        console.log("SERVER: Endpoint /login-utente (POST) raggiunto.");
         res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        let corpoRichiesta = '';
        req.on('data', chunk => { corpoRichiesta += chunk.toString(); });
        req.on('end', async () => {
            try {
                const credenziali = JSON.parse(corpoRichiesta);
                const emailRicevuta = credenziali.email ? credenziali.email.trim().toLowerCase() : null;
                const passwordInChiaroRicevuta = credenziali.password;

                if (!emailRicevuta || !passwordInChiaroRicevuta) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Email e password sono richieste." }));
                }

                console.log(`SERVER: Tentativo di login per email: [${emailRicevuta}]`);

                const utenteTrovato = utentiInMemoria.find(u => u.email.toLowerCase() === emailRicevuta);

                if (!utenteTrovato) {
                    console.log("SERVER: Utente non trovato per email:", emailRicevuta);
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Credenziali non valide." }));
                }

                const hashPasswordRicevuta = await hashPasswordConSHA256_Server(passwordInChiaroRicevuta);

                if (hashPasswordRicevuta === utenteTrovato.passwordHash) {
                    console.log("SERVER: Login riuscito per utente:", utenteTrovato.email);
                    const datiUtenteDaInviare = {
                        email: utenteTrovato.email,
                        nome: utenteTrovato.nome,
                        cognome: utenteTrovato.cognome
                    };
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Login effettuato con successo.", utente: datiUtenteDaInviare }));
                } else {
                    console.log("SERVER: Password errata per utente:", utenteTrovato.email);
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Credenziali non valide." }));
                }

            } catch (error) {
                console.error("SERVER: Errore in /login-utente:", error);
                if (error instanceof SyntaxError) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Richiesta JSON non valida." }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Errore interno del server durante il login." }));
                }
            }
        });
    }
    else if (req.url === '/' || req.url === '/index.html') {
        try {
            const html = await fs.readFile(path.join(__dirname, '..', 'index.html'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (e) { console.error("SERVER: Errore caricamento index.html:", e); res.writeHead(404); res.end("index.html non trovato"); }
    } else if (req.url === '/registrazione.js' && req.method === 'GET') {
        try {
            const js = await fs.readFile(path.join(__dirname, '..', 'registrazione.js'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(js);
        } catch (e) { console.error("SERVER: Errore caricamento registrazione.js:", e); res.writeHead(404); res.end("registrazione.js non trovato"); }
    } else if (req.url === '/json/utenti.json' && req.method === 'GET') {
        try {
            const utentiFile = await fs.readFile(PERCORSO_UTENTI_JSON, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(utentiFile);
        } catch (e) {
            if (e.code === 'ENOENT') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify([]));
            } else {
                console.error("SERVER: Errore caricamento utenti.json (GET):", e); res.writeHead(500); res.end("Errore lettura utenti.json");
            }
        }
    }
    else {
        console.log(`SERVER: Nessun handler per ${req.method} ${req.url}. Invio 404.`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Endpoint non trovato sul server Node.js" }));
    }
});

const PORTA = 3000;
caricareUtentiIniziali().then(() => {
    server.listen(PORTA, () => {
        console.log(`Server in ascolto su http://localhost:${PORTA}`);
    });
});