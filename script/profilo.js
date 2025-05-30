/**
 * @file Script per la gestione del login utente, caricamento dati utente e protezione rotte.
 * @summary Questo script gestisce il form di login, recupera i dati degli utenti da un file JSON,
 * gestisce la sessione utente (tramite localStorage o sessionStorage) e protegge l'accesso
 * alla pagina del quiz.
 */

/**
 * @type {Utente[]} Array per memorizzare gli oggetti Utente caricati dal file JSON.
 * La classe Utente è definita nel file libreriaclassi.js
 */
let utenti = []
/**
 * Mostra un messaggio all'utente nell'area designata della pagina.
 * Utilizza la Piattaforma Bootstrap per lo stile degli alert.
 * @param {string} message - Il messaggio da visualizzare.
 * @param {string} type - Il tipo di alert (es. 'success', 'danger', 'warning', 'info'), usato per lo stile.
 */
function displayMessage(message, type) {
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = ''; // Pulisce messaggi precedenti
    // Crea il wrapper per l'alert di Bootstrap
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');

    messageArea.append(wrapper);
}
/**
 * Carica asincronamente i dati degli utenti dal file '/json/utenti.json'.
 * Popola l'array globale 'utenti' con istanze di Oggetti Utente, Quiz e Domanda.
 * Definite sempre in libreriaclassi.js.
 * Gestisce eventuali errori durante il fetch o il parsing del JSON.
 */
async function getutenti() {
    try {
        const response = await fetch("/json/utenti.json");
        // Se la risposta non è OK (es. errore 404, 500), lancia un errore
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }
        const datiJSON = await response.json(); // Parsa il JSON
        // Itera sui dati JSON per creare e popolare gli oggetti Utente
        for (let i = 0; i < datiJSON.length; i++) {
            utenti.push(new Utente(datiJSON[i].nome, datiJSON[i].cognome, datiJSON[i].email, datiJSON[i].passwordHash, datiJSON[i].dataNascita, datiJSON[i].test))
        }
        // Itera sugli utenti per processare i loro test (quiz)
        for (let i = 0; i < utenti.length; i++) {
            if (utenti[i].test != null) { // Controlla se l'utente ha dei test associati
                let tests = [] // Array temporaneo per i quiz dell'utente corrente
                for (let j = 0; j < utenti[i].test.length; j++) {
                    // Crea un nuovo oggetto Quiz con le domande dal JSON
                    tests.push(new Quiz(utenti[i].test[j].domande));
                    // Associa la data di realizzazione del quiz
                    tests[j].realizazzione = utenti[i].test[j].realizazzione;
                    let domande = [] // Array temporaneo per le domande del quiz corrente
                    for (let k = 0; k < tests[j].domande.length; k++) {
                        // Crea un nuovo oggetto Domanda
                        domande.push(new Domanda(tests[j].domande[k].testo, tests[j].domande[k].corretta, null));
                        // Associa la risposta data dall'utente
                        domande[k].risposta = tests[j].domande[k].risposta;
                        // Associa l'immagine della domanda (se presente)
                        if (tests[j].domande[k].img != null) {
                            domande[k].img = tests[j].domande[k].img;
                        }
                    }
                    tests[j].domande = domande; // Assegna l'array di oggetti Domanda al quiz
                }
                utenti[i].test = tests; // Assegna l'array di oggetti Quiz all'utente
            }
        }


    } catch (error) {
        // Logga un errore in console se il caricamento o il parsing fallisc
        console.error("Impossibile caricare il file utenti.json:", error);
        utenti = [];
    }
}
/**
 * Gestisce il logout dell'utente.
 * Rimuove i dati dell'utente da localStorage e sessionStorage e reindirizza alla pagina di login.
 */
function noaccesso() {
    localStorage.removeItem('utenteAccesso');
    sessionStorage.removeItem('utenteAccesso');
    window.location.href = "/login.html"
}
// Invoca la funzione principale 'avvia' per iniziare il processo di caricamento e visualizzazione.
avvia()
/**
 * Funzione principale asincrona per inizializzare la pagina del profilo.
 * Carica i dati degli utenti, identifica l'utente loggato e popola la pagina
 * con le sue informazioni e lo storico dei test.
 */
async function avvia() {
    // Attende il caricamento completo dei dati di tutti gli utenti
    await getutenti()
    let accesso // Variabile per memorizzare i dati dell'utente loggato
     // Tenta di recuperare i dati dell'utente prima da sessionStorage, poi da localStorage
    if (sessionStorage.getItem('utenteAccesso') == null) {
        accesso = localStorage.getItem('utenteAccesso')
    }
    else if (sessionStorage.getItem('utenteAccesso') != null) {
        accesso = sessionStorage.getItem('utenteAccesso')
    }
    if (accesso) {
        try {
            // Cerca l'utente completo nell'array 'utenti' caricato da utenti.json,
            // per ottenere tutti i dettagli, inclusi i test
            for (let i = 0; i < utenti.length; i++) {
                if (utenti[i].email == JSON.parse(accesso).email) {
                    accesso = utenti[i] // Sostituisce 'accesso' con l'oggetto Utente completo
                    break; // Esce dal ciclo una volta trovato l'utente
                }
            }
            // Se 'accesso' è ancora una stringa (utente non trovato nell'array 'utenti'),
            // o se il parsing è fallito e 'accesso' non è un oggetto atteso,
            // potrebbe essere necessario un controllo aggiuntivo qui o gestire l'errore.
            if (typeof accesso === 'string') {
                // Questo scenario potrebbe verificarsi se l'utente in storage non esiste più in utenti.json
                console.warn("Utente trovato nello storage ma non nell'elenco utenti caricato.");
                noaccesso(); // Sloga l'utente
                return; // Interrompe l'esecuzione di avvia
            }
        } catch (e) {
            console.error("Errore nel parsing dell'utente da localStorage:", e);
            noaccesso();
        }
    } else {
        // Se non ci sono dati utente in nessuno dei due storage, l'utente non è loggato.
        noaccesso();
    }
    /**
     * Listener che si attiva quando il documento HTML è stato completamente caricato e parsato.
     * Popola la pagina del profilo con i dati dell'utente e imposta gli event listener.
     */
    document.addEventListener('DOMContentLoaded', function () {
        // Ottiene i riferimenti agli elementi del DOM dove visualizzare le informazioni
        const userInfoNome = document.getElementById('userInfoNome');
        const userInfoCognome = document.getElementById('userInfoCognome');
        const userInfoEmail = document.getElementById('userInfoEmail');
        const userInfoDataNascita = document.getElementById('userInfoDataNascita');
        const testHistoryContainer = document.getElementById('testHistoryContainer');


        if (accesso) {
            try {
                // Popola i campi con le informazioni dell'utente
                userInfoNome.textContent = accesso.nome || 'N/D';
                userInfoCognome.textContent = accesso.cognome || 'N/D';
                userInfoEmail.textContent = accesso.email || 'N/D';
                // Formatta la data di nascita se presente
                userInfoDataNascita.textContent = accesso.data_nascita ? new Date(accesso.data_nascita).toLocaleDateString('it-IT') : 'N/D';
                // Gestisce la visualizzazione dello storico dei test
                if (accesso.test && accesso.test.length > 0) {
                    testHistoryContainer.innerHTML = ''; // Pulisce il contenitore
                    accesso.test.forEach((quizRecord, index) => {
                        // Controlla la validità del record del test
                        if (!quizRecord || !quizRecord.domande) {
                            console.warn('Record test non valido o senza domande:', quizRecord);
                            return;
                        }
                        // Calcola il punteggio e identifica le domande errate
                        let domandeCorrette = 0;
                        const domandeTotali = quizRecord.domande.length;
                        const domandeErrateRecord = [];

                        quizRecord.domande.forEach(domanda => {
                            if (domanda.risposta === domanda.corretta) {
                                domandeCorrette++;
                            } else {
                                domandeErrateRecord.push(domanda);
                            }
                        });

                        const card = document.createElement('div');
                        card.className = 'card mb-3';  // Stile Bootstrap per la card
                        // Formatta la data del test
                        let dataTestHtml = 'Data non disponibile';
                        if (quizRecord.realizazzione) {
                            try {
                                dataTestHtml = new Date(quizRecord.realizazzione).toLocaleDateString('it-IT', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                            } catch (e) {
                                console.warn("Data test non valida: ", quizRecord.realizazzione);
                            }
                        }
                        // Prepara l'HTML per le domande errate
                        let listaDomandeErrateHtml = '<p>Nessuna domanda errata.</p>';
                        if (domandeErrateRecord.length > 0) {
                            listaDomandeErrateHtml = '<h6>Domande errate:</h6><ul class="list-unstyled">';
                            domandeErrateRecord.forEach(d => {
                                listaDomandeErrateHtml += `<li class="incorrect-question">- ${d.testo} (Risposta data: ${d.risposta === null || d.risposta === undefined ? 'Non data' : (d.risposta ? 'Vero' : 'Falso')}, Corretta: ${d.corretta ? 'Vero' : 'Falso'})</li>`;
                            });
                            listaDomandeErrateHtml += '</ul>';
                        }
                        // Crea l'HTML per la card del test
                        card.innerHTML = `
                                <div class="card-header">
                                    Test #${index + 1} - Sostenuto il: ${dataTestHtml}
                                </div>
                                <div class="card-body">
                                    <p><strong>Punteggio:</strong> ${domandeCorrette} / ${domandeTotali}</p>
                                    ${listaDomandeErrateHtml}
                                </div>
                            `;
                        testHistoryContainer.appendChild(card); // Aggiunge la card al contenitore
                    });
                } else {
                    // Messaggio se non ci sono test sostenuti
                    testHistoryContainer.innerHTML = '<p>Nessun test sostenuto finora.</p>';
                }
            } catch (error) {
                // Gestione errori nel popolamento della pagina
                console.error("Errore nel parsing dei dati utente:", error);
                userInfoNome.textContent = 'Errore nel caricamento dei dati.';
                testHistoryContainer.innerHTML = '<p>Impossibile caricare lo storico dei test.</p>';
            }
        } else {
            // Se l'utente non è autenticato o i dati non sono disponibili dopo i controlli
            document.body.innerHTML = '<div class="container alert alert-danger mt-5" role="alert">Utente non autenticato o dati non disponibili. Effettua il <a href="login.html">login</a>.</div>';
            noaccesso()
            window.location.href = 'login.html';
        }
        // Imposta il messaggio di benvenuto (es. "Ciao Mario Rossi")
        if (localStorage.getItem('utenteAccesso') != null) {
            document.getElementById("nome").textContent = "Ciao " + JSON.parse(localStorage.getItem('utenteAccesso')).nome + " " + JSON.parse(localStorage.getItem('utenteAccesso')).cognome
        }
        else if (sessionStorage.getItem('utenteAccesso') != null) {
            document.getElementById("nome").textContent = "Ciao " + JSON.parse(sessionStorage.getItem('utenteAccesso')).nome + " " + JSON.parse(sessionStorage.getItem('utenteAccesso')).cognome
        }
        document.getElementById("profilo").addEventListener("click", function () {
            window.location.href = "/profilo.html"
        })

        document.getElementById("logoutBtn").addEventListener("click", function () {
            noaccesso()
            window.location.href = "/login.html";
        })
    });
}