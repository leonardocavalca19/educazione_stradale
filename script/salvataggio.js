const fs = require('fs').promises;
const path = require('path');
const http = require('http');

const PERCORSO_UTENTI_JSON = path.join(__dirname, 'json', 'utenti.json');

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
                console.error("Errore durante la gestione di /salva-lista-utenti:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Errore interno del server." }));
            }
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
    }
});
const PORTA = 3000;
server.listen(PORTA, () => {
    console.log(`Server in ascolto su http://localhost:${PORTA}`);
});

