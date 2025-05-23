const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const crypto = require('crypto');

const PERCORSO_UTENTI_JSON = path.join(__dirname, '..', 'json', 'utenti.json');
let utentiInMemoria = [];
class UtenteServer {
    constructor(nome, cognome, email, passwordHash, dataNascita) {
        this.id = crypto.randomUUID();
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.passwordHash = passwordHash;
        this.dataNascita = new Date(dataNascita).toISOString().split('T')[0];
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
        const dati = await fs.readFile(PERCORSO_UTENTI_JSON, 'utf8');
        utentiInMemoria = JSON.parse(dati);
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
                    datiNuovoUtente.data_nascita
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
    else if (req.url === '/' || req.url === '/index.html') {
        try {
            const html = await fs.readFile(path.join(__dirname, '..', 'index.html'), 'utf8');
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
        } catch(e){ console.error("SERVER: Errore caricamento index.html:", e); res.writeHead(404); res.end("index.html non trovato");}
    } else if (req.url === '/registrazione.js' && req.method === 'GET' ) {
         try {
            const js = await fs.readFile(path.join(__dirname, '..', 'registrazione.js'), 'utf8');
            res.writeHead(200, {'Content-Type': 'application/javascript'});
            res.end(js);
        } catch(e){ console.error("SERVER: Errore caricamento registrazione.js:", e); res.writeHead(404); res.end("registrazione.js non trovato");}
    } else if (req.url === '/json/utenti.json' && req.method === 'GET') {
         try {
            const utentiFile = await fs.readFile(PERCORSO_UTENTI_JSON, 'utf8');
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(utentiFile);
        } catch (e){
            if(e.code === 'ENOENT') {
                res.writeHead(200, {'Content-Type': 'application/json'});
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