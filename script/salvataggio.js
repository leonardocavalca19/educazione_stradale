const fs = require('fs').promises;
const path = require('path');
const http = require('http');

const PERCORSO_UTENTI_JSON = path.join(__dirname, 'json', 'utenti.json');
let utentiInMemoria = [];

async function caricareUtentiIniziali() {
    try {
        await fs.mkdir(path.dirname(PERCORSO_UTENTI_JSON), { recursive: true });
        const dati = await fs.readFile(PERCORSO_UTENTI_JSON, 'utf8');
        utentiInMemoria = JSON.parse(dati);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("File utenti.json non trovato all'avvio. Si inizierà con una lista vuota. Verrà creato al primo salvataggio.");
            utentiInMemoria = [];
        } else {
            console.error("Errore durante il caricamento di utenti.json all'avvio:", error);
            utentiInMemoria = [];
        }
    }
}

async function salvareListaUtentiSuFile(listaDaSalvare) {
    try {
        await fs.mkdir(path.dirname(PERCORSO_UTENTI_JSON), { recursive: true });
        const datiJSONString = JSON.stringify(listaDaSalvare, null, 2);
        await fs.writeFile(PERCORSO_UTENTI_JSON, datiJSONString, 'utf8');
        console.log("Lista utenti salvata con successo su utenti.json");
    } catch (error) {
        console.error("Errore durante il salvataggio della lista utenti:", error);
        throw error;
    }
}

const server = http.createServer(async (req, res) => {
    if (req.url === '/salva-lista-utenti' && req.method === 'POST') {
        let corpoRichiesta = '';
        req.on('data', chunk => {
            corpoRichiesta += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const listaRicevutaDalClient = JSON.parse(corpoRichiesta);
                utentiInMemoria = listaRicevutaDalClient; 

                await salvareListaUtentiSuFile(utentiInMemoria);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Lista utenti ricevuta e salvata con successo!" }));
            } catch (error) {

            }
        });
    } 
    else if (req.url === '/' || req.url === '/index.html') {
        try {
            const htmlContent = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        } catch (e) { res.writeHead(404); res.end("index.html non trovato");}
    } else if (req.url === '/registrazione.js') {
        try {
            const jsContent = await fs.readFile(path.join(__dirname, 'registrazione.js'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(jsContent);
        } catch (e) { res.writeHead(404); res.end("registrazione.js non trovato");}
    } else if (req.url === '/json/utenti.json' && req.method === 'GET') {
         try {
            const utentiFileContent = await fs.readFile(PERCORSO_UTENTI_JSON, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(utentiFileContent);
        } catch (e) {
            if (e.code === 'ENOENT') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify([]));
            } else {
                console.error("Errore lettura utenti.json per GET:", e);
                res.writeHead(500); res.end("Errore caricamento utenti.json");
            }
        }
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