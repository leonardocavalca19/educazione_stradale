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
        this.dataRegistrazione = new Date().toISOString();
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
    if (req.url === '/registra-utente' && req.method === 'POST') {
        let corpoRichiesta = '';
        req.on('data', chunk => { corpoRichiesta += chunk.toString(); });
        req.on('end', async () => {
            try {
                const datiNuovoUtente = JSON.parse(corpoRichiesta);
                if (!datiNuovoUtente.email || !datiNuovoUtente.password || !datiNuovoUtente.nome) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Dati mancanti o non validi." }));
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
                    datiNuovoUtente.dataNascita
                );

                utentiInMemoria.push(utenteDaSalvare);
                await salvareUtentiSuFile();

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Utente registrato con successo!", id: utenteDaSalvare.id }));
            } catch (error) {
                console.error("Errore in /registra-utente:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Errore interno del server." }));
            }
        });
    } 
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Endpoint non trovato" }));
    }
});

const PORTA = 3000;
caricareUtentiIniziali().then(() => {
    server.listen(PORTA, () => {
        console.log(`Server in ascolto su http://localhost:${PORTA}`);
    });
});