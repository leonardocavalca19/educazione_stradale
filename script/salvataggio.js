
/**
 * @file Script server Node.js per la gestione degli utenti e dei quiz.
 * @summary Questo server gestisce la registrazione, il login, la modifica dei dati utente (inclusi i risultati dei quiz)
 * e serve i file statici necessari per l'applicazione client.
 * Utilizza un file JSON locale (utenti.json) come persistenza dei dati.
 */

// Importazione dei moduli Node.js necessari.
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const os = require('os');
/**
 * @const {string} PERCORSO_UTENTI_JSON
 * Percorso completo del file JSON dove vengono memorizzati i dati degli utenti.
 * Si trova nella cartella 'json' a un livello superiore rispetto alla directory corrente (__dirname).
 */
const PERCORSO_UTENTI_JSON = path.join(__dirname, '..', 'json', 'utenti.json');
/**
 * @type {UtenteServer[]} Array che funge da cache in memoria per gli oggetti Utente.
 * Viene popolato al caricamento iniziale da utenti.json e aggiornato durante le operazioni del server.
 */
let utentiInMemoria = [];
/**
 * Classe che rappresenta un utente lato server.
 * Gestisce la struttura dei dati utente come viene memorizzata e manipolata dal server.
 */
class UtenteServer {
    /**
     * Costruttore per la classe UtenteServer.
     * @param {string} nome - Il nome dell'utente.
     * @param {string} cognome - Il cognome dell'utente.
     * @param {string} email - L'email dell'utente (usata come identificatore univoco).
     * @param {string} passwordHash - La password dell'utente già hashata.
     * @param {string|Date} dataNascita - La data di nascita dell'utente. Verrà normalizzata in formato YYYY-MM-DD.
     * @param {Array<object>} test - Un array di oggetti rappresentanti i test sostenuti dall'utente.
     */
    constructor(nome, cognome, email, passwordHash, dataNascita, test) {
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.passwordHash = passwordHash;
        // Normalizza la data di nascita in formato YYYY-MM-DD.
        this.dataNascita = new Date(dataNascita).toISOString().split('T')[0];
        this.test = test
    }
}
/**
 * Funzione asincrona per hashare una password utilizzando l'algoritmo SHA-256.
 * Tenta di usare l'API Web Crypto (`global.crypto.subtle`) se disponibile,
 * altrimenti ripiega sul modulo 'crypto' di Node.js.
 * @param {string} password - La password in chiaro da hashare.
 * @returns {Promise<string>} Una Promise che risolve con la stringa esadecimale dell'hash della password.
 */
async function hashPasswordConSHA256_Server(password) {
    // Controlla se l'API Web Crypto è disponibile
    if (typeof global.crypto !== 'undefined' && global.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await global.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
        // Utilizza il modulo 'crypto' di Node.js
        return crypto.createHash('sha256').update(password).digest('hex');
    }
}
/**
 * Carica asincronamente gli utenti dal file PERCORSO_UTENTI_JSON nella cache `utentiInMemoria`.
 * Questa funzione viene chiamata all'avvio del server.
 * Se il file non esiste (ENOENT), inizia con una lista utenti vuota.
 * Crea la directory 'json' se non esiste.
 */
async function caricareUtentiIniziali() {
    try {
        // Assicura che la directory dove si trova utenti.json esista.
        await fs.mkdir(path.dirname(PERCORSO_UTENTI_JSON), { recursive: true });
        // Legge il file utenti.json.
        const dati = JSON.parse(await fs.readFile(PERCORSO_UTENTI_JSON, 'utf8'));
        // Popola utentiInMemoria con istanze di UtenteServer.
        for (let i = 0; i < dati.length; i++) {
            utentiInMemoria.push(new UtenteServer(dati[i].nome, dati[i].cognome, dati[i].email, dati[i].passwordHash, dati[i].dataNascita, dati[i].test))
        }

        console.log("Utenti esistenti caricati in memoria da utenti.json.");
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Errore: File Not Found.
            console.log("File utenti.json non trovato. Inizio con lista vuota.");
            utentiInMemoria = [];
        } else {
            // Altri errori durante il caricamento.
            console.error("Errore caricamento utenti.json:", error);
        }
    }
}
/**
 * Salva asincronamente l'array `utentiInMemoria` nel file PERCORSO_UTENTI_JSON.
 * Serializza l'array in una stringa JSON formattata.
 * Crea la directory 'json' se non esiste.
 * @throws Lancia un errore se il salvataggio fallisce.
 */
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
/**
 * Creazione del server HTTP.
 * Il server gestisce le richieste in entrata, instrada verso gli endpoint corretti
 * e interagisce con il sistema di gestione degli utenti.
 */
const server = http.createServer(async (req, res) => {
    console.log(`SERVER: Ricevuta richiesta - Metodo: ${req.method}, URL: ${req.url}`);
    // Impostazione degli header CORS per permettere richieste da origini diverse (es. client su porta diversa).
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permette qualsiasi origine.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Metodi HTTP permessi.
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Header permessi nella richiesta.
    // Gestione delle richieste pre-flight OPTIONS.
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    // Endpoint per la registrazione di un nuovo utente.
    if (req.url === '/registra-utente' && req.method === 'POST') {
        console.log("SERVER: Endpoint /registra-utente (POST) raggiunto.");
        let corpoRichiesta = '';
        // Accumula i dati ricevuti nel corpo della richiesta.
        req.on('data', chunk => { corpoRichiesta += chunk.toString(); });
        // Quando tutti i dati sono stati ricevuti.
        req.on('end', async () => {
            console.log("SERVER: Corpo richiesta per /registra-utente:", corpoRichiesta);
            try {
                const datiNuovoUtente = JSON.parse(corpoRichiesta);
                console.log("SERVER: Dati parsati da /registra-utente:", datiNuovoUtente);
                // Validazione base dei dati ricevuti.
                if (!datiNuovoUtente.email || !datiNuovoUtente.password || !datiNuovoUtente.nome) {
                    console.error("SERVER: Dati mancanti o non validi da /registra-utente");
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Dati mancanti o non validi.", type: "danger" }));
                    return;
                }
                // Controlla se l'email è già registrata.
                if (utentiInMemoria.some(u => u.email === datiNuovoUtente.email)) {
                    if (!res.headersSent) {
                        res.writeHead(409, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: "Email già registrata.", type: "danger" }));
                    }
                    return;
                }
                const passwordInChiaro = datiNuovoUtente.password;
                const passwordHashata = await hashPasswordConSHA256_Server(passwordInChiaro);
                // Hasha la password prima di salvarla.
                console.log("SERVER: Password hashata per /registra-utente.");
                // Crea una nuova istanza di UtenteServer.
                const utenteDaSalvare = new UtenteServer(
                    datiNuovoUtente.nome,
                    datiNuovoUtente.cognome,
                    datiNuovoUtente.email,
                    passwordHashata,
                    datiNuovoUtente.data_nascita,
                    datiNuovoUtente.test
                );

                utentiInMemoria.push(utenteDaSalvare); // Aggiunge il nuovo utente alla cache in memoria.
                await salvareUtentiSuFile(); // Salva l'array aggiornato su file.
                if (!res.headersSent) {
                    res.end(JSON.stringify({ message: "Utente creato con successo", type: "success" }));
                    return
                }
                return

            } catch (error) {
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'application/json' }); // Internal Server Error.
                    res.end(JSON.stringify({ message: "Errore interno del server durante la registrazione.", type: "danger" }));
                }
                return
            }

        });
        return

    }
    // Endpoint per il login di un utente.
    else if (req.url === '/login-utente' && req.method === 'POST') {
        console.log("SERVER: Endpoint /login-utente (POST) raggiunto.");
        let corpoRichiesta = '';
        req.on('data', chunk => { corpoRichiesta += chunk.toString(); });
        req.on('end', async () => {
            try {
                const credenziali = JSON.parse(corpoRichiesta);
                const emailRicevuta = credenziali.email ? credenziali.email.trim().toLowerCase() : null;
                const passwordInChiaroRicevuta = credenziali.password;

                if (!emailRicevuta || !passwordInChiaroRicevuta) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Email e password sono richieste.", type: "danger" }));
                    return
                }


                console.log(`SERVER: Tentativo di login per email: [${emailRicevuta}]`);
                // Trova l'utente per email (ignorando maiuscole/minuscole).
                const utenteTrovato = utentiInMemoria.find(u => u.email.toLowerCase() === emailRicevuta);

                if (!utenteTrovato) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    console.log("SERVER: Utente non trovato per email:", emailRicevuta);
                    res.end(JSON.stringify({ message: "Utente non trovato con l'email fornita.", type: "danger" }));
                    return
                }
                // Hasha la password ricevuta e la confronta con quella memorizzata.
                const hashPasswordRicevuta = await hashPasswordConSHA256_Server(passwordInChiaroRicevuta);

                if (hashPasswordRicevuta === utenteTrovato.passwordHash) {
                    console.log("SERVER: Login riuscito per utente:", utenteTrovato.email);
                    // Prepara i dati utente da inviare al client.
                    const datiUtenteDaInviare = {
                        email: utenteTrovato.email,
                        nome: utenteTrovato.nome,
                        cognome: utenteTrovato.cognome
                    };
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Login effettuato con successo.", utente: datiUtenteDaInviare, type: "success" }));
                    return;
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    console.log("SERVER: Password errata per utente:", utenteTrovato.email);
                    res.end(JSON.stringify({ message: "Errore, mail o password errate", type: "danger" }));
                    return
                }

            } catch (error) {
                console.error("SERVER: Errore in /login-utente:", error);
                if (error instanceof SyntaxError) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: "Richiesta JSON non valida.", type: "danger" }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Errore, connessione al server non riuscita", type: "danger" }));
                    return
                }
            }
        });
        return
    }
    // Endpoint per modificare i dati di un utente (es. aggiungere un quiz, cambiare password).
    else if (req.url === '/modifica-utente' && req.method === 'PUT') {
        console.log("SERVER: Endpoint /modifica-utente (PUT) raggiunto.");
        let corpoRichiesta = '';
        req.on('data', chunk => { corpoRichiesta += chunk.toString(); });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(corpoRichiesta);
                const emailDaModificare = payload.emailDaModificare;
                const aggiornamenti = payload.aggiornamenti;

                if (!emailDaModificare || !aggiornamenti) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Email dell'utente da modificare e dati per l'aggiornamento sono richiesti.", type: "danger" }));
                    return
                }

                console.log(`SERVER: Richiesta di modifica per l'utente con email: ${emailDaModificare}`);
                console.log("SERVER: Dati di aggiornamento ricevuti:", aggiornamenti);

                const indiceUtente = utentiInMemoria.findIndex(u => u.email === emailDaModificare);

                if (indiceUtente === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Utente non trovato con l'email fornita.", type: "danger" }));
                    return
                }

                const utenteDaAggiornare = utentiInMemoria[indiceUtente];
                // Se ci sono aggiornamenti relativi a un nuovo quiz completato.
                if (aggiornamenti.hasOwnProperty('nuovoQuizCompletato')) {

                    if (!utenteDaAggiornare.test) {
                        utenteDaAggiornare.test = [];
                    }

                    utenteDaAggiornare.test.push(aggiornamenti.nuovoQuizCompletato);
                    console.log(`SERVER: Aggiunto nuovo quiz completato per utente: ${utenteDaAggiornare.email}`);
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                // Se c'è un aggiornamento della password.
                if (aggiornamenti.hasOwnProperty('password') && aggiornamenti.password) {
                    console.log(`SERVER: Inizio aggiornamento password per l'utente: ${utenteDaAggiornare.email}`);
                    utenteDaAggiornare.passwordHash = await hashPasswordConSHA256_Server(aggiornamenti.password); //
                    console.log(`SERVER: Password aggiornata e hashata per l'utente: ${utenteDaAggiornare.email}`);
                    res.end(JSON.stringify({ message: "Password aggiornata correttamente", type: "success" }));
                    return
                }

                utentiInMemoria[indiceUtente] = utenteDaAggiornare;

                await salvareUtentiSuFile();



            } catch (error) {
                console.error("SERVER: Errore durante l'aggiornamento dell'utente in /modifica-utente:", error);
                if (error instanceof SyntaxError) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Corpo della richiesta JSON non valido.", type: "danger" }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Errore interno del server durante l'aggiornamento dell'utente.", type: "danger" }));
                }
                return
            }
        });
        return
    }
    // Blocco per servire file statici (HTML, JS, JSON).
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
    else if (req.url === '/risultati.html') {
        try {
            const html = await fs.readFile(path.join(__dirname, '..', 'risultati.html'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (e) { console.error("SERVER: Errore caricamento utenti.json (GET):", e); res.writeHead(500); res.end("Errore lettura risultati.html"); }
    } else if (req.url === '/risultati.js') {
        try {
            const js = await fs.readFile(path.join(__dirname, '..', 'risultati.js'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(js);
        } catch (e) { console.error("SERVER: Errore caricamento utenti.json (GET):", e); res.writeHead(500); res.end("Errore lettura risultati.js"); }
    }
    else if (req.url === '/style/comune.css' && req.method === 'GET') { // Controlla l'URL esatto
        try {
            const cssContent = await fs.readFile(path.join(__dirname, '..', 'style', 'comune.css'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(cssContent);
        } catch (e) {
            console.error("SERVER: Errore caricamento style/comune.css:", e);
            res.writeHead(404);
            res.end("style/comune.css non trovato");
        }
    }
    else if (req.url === '/style/login.css' && req.method === 'GET') {
        try {
            const cssContent = await fs.readFile(path.join(__dirname, '..', 'style', 'login.css'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(cssContent);
        } catch (e) {
            console.error("SERVER: Errore caricamento style/login.css:", e);
            res.writeHead(404);
            res.end("style/login.css non trovato");
        }
    }
    else if (req.url === '/style/quiz.css' && req.method === 'GET') {
        try {
            const cssContent = await fs.readFile(path.join(__dirname, '..', 'style', 'quiz.css'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(cssContent);
        } catch (e) {
            console.error("SERVER: Errore caricamento style/quiz.css:", e);
            res.writeHead(404);
            res.end("style/quiz.css non trovato");
        }
    }
    else if (req.url === '/style/registrati.css' && req.method === 'GET') {
        try {
            const cssContent = await fs.readFile(path.join(__dirname, '..', 'style', 'registrati.css'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(cssContent);
        } catch (e) {
            console.error("SERVER: Errore caricamento style/registrati.css:", e);
            res.writeHead(404);
            res.end("style/registrati.css non trovato");
        }
    }
    else if (req.url === '/style/styles.css' && req.method === 'GET') {
        try {
            const cssContent = await fs.readFile(path.join(__dirname, '..', 'style', 'styles.css'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(cssContent);
        } catch (e) {
            console.error("SERVER: Errore caricamento style/styles.css:", e);
            res.writeHead(404);
            res.end("style/styles.css non trovato");
        }
    }

    else {
        console.log(`SERVER: Nessun handler per ${req.method} ${req.url}. Invio 404.`);
        if (!res.headersSent) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Endpoint non trovato sul server Node.js", type: "danger" }));
        }
    }
});
/**
 * @const {number} PORTA - La porta su cui il server si metterà in ascolto.
 */
const PORTA = process.env.PORT || 3000;
// Avvio del server: prima carica gli utenti iniziali, poi mette il server in ascolto.
caricareUtentiIniziali().then(() => {
    server.listen(PORTA, '0.0.0.0', () => {// Ascolta su tutte le interfacce di rete.
        // Ottieni e logga gli indirizzi IP di rete locali
        const networkInterfaces = os.networkInterfaces();
        Object.keys(networkInterfaces).forEach((ifaceName) => {
            networkInterfaces[ifaceName].forEach((iface) => {
                // Salta indirizzi non IPv4 e indirizzi interni (es. 127.0.0.1)
                if (iface.family === 'IPv4' && !iface.internal) {
                    console.log(`Accessibile anche da altre macchine sulla rete locale via: http://${iface.address}:${PORTA}`);
                }
            });
        });
    });
}).catch(error => {
    console.error("SERVER: Errore critico durante l'avvio del server (caricamento utenti fallito):", error);
    process.exit(1); // Esce dal processo se il caricamento iniziale fallisce in modo grave.
});
