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
// Invoca immediatamente getutenti per caricare i dati degli utenti all'avvio dello script
getutenti()
/**
 * Listener che si attiva quando il documento HTML è stato completamente caricato e parsato.
 * Imposta la gestione del submit del form di login e i controlli di navigazione.
 */
document.addEventListener("DOMContentLoaded", function () {
    /**
     * Recupera le informazioni dell'utente loggato.
     * Controlla prima localStorage (per "ricordami"), poi sessionStorage.
     * @returns {string | null} I dati dell'utente loggato come stringa JSON, o null se non trovato.
     */
    function getInfoUtenteLoggatoPerLogin() {
        if (localStorage.getItem('utenteAccesso')) {
            return localStorage.getItem('utenteAccesso');
        }
        return sessionStorage.getItem('utenteAccesso');
    }
    /**
     * Rimuove i dati dell'utente loggato da localStorage e sessionStorage
     * e reindirizza l'utente alla pagina di login ('/login.html').
     * Usato tipicamente quando l'accesso a una rotta protetta è negato.
     */
    function noaccessoPaginaLogin() {

        localStorage.removeItem('utenteAccesso');
        sessionStorage.removeItem('utenteAccesso');

        window.location.href = "/login.html"; // Reindirizza alla pagina di login
    }
    const quizLinkLogin = document.getElementById("quizlink");
    if (quizLinkLogin) {
        /**
         * Aggiunge un event listener all'elemento con ID 'quizlink'.
         * Previene la navigazione di default e controlla se un utente è loggato.
         * Se loggato, reindirizza a '/quiz.html'.
         * Altrimenti, chiama noaccessoPaginaLogin() per reindirizzare alla pagina di login.
         * @param {Event} event - L'oggetto evento click.
         */
        quizLinkLogin.addEventListener("click", function (event) {
            event.preventDefault(); // Previene l'azione di default del link
            if (getInfoUtenteLoggatoPerLogin() == null) {
                // Se nessun utente è loggato, nega l'accesso
                noaccessoPaginaLogin();
            } else {
                // Se l'utente è loggato, permette l'accesso alla pagina del quiz
                window.location.href = "/quiz.html";
            }
        });
    }
    /**
    * Aggiunge un event listener al form con ID 'form' per l'evento 'submit'.
    * Gestisce i tentativi di login dell'utente.
    * @param {Event} event - L'oggetto evento submit.
    */
    document.getElementById("form").addEventListener("submit", async function (event) {
        event.preventDefault(); // Previene il submit tradizionale del form
         // Ottiene i riferimenti agli input email e password
        const emailInput = document.getElementById("emailInput");
        const passwordInput = document.getElementById("passwordInput");
         // Ottiene e normalizza i valori di email e password
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        // Validazione dell'email: non vuota e formato email corretto
        let isEmailValid = emailInput.checkValidity() && email !== "";
         // Validazione della password: non vuota e almeno 8 caratteri qualsiasi (compresi spazi e simboli)
        let isPasswordValid = passwordInput.checkValidity() && new RegExp("[ -~]{8}").test(password);
        // Feedback visivo per la validazione
        emailInput.style.borderColor = isEmailValid ? "green" : "red";
        passwordInput.style.borderColor = isPasswordValid ? "green" : "red";

        if (isEmailValid && isPasswordValid) {
            // Se entrambi i campi sono validi, tenta il logi
            try {
                 // Invia una richiesta POST al server per il login
                const response = await fetch('/login-utente', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Specifica il tipo di contenuto del corpo
                    },
                    body: JSON.stringify({ email: email, password: password }) // Invia email e password come JSON
                });

                const responseData = await response.json(); // Parsa la risposta JSON dal server
                if (!response.ok) {
                    // Se la risposta del server non è OK (es. credenziali errate), mostra un messaggio di errore
                    displayMessage(responseData.message, responseData.type || 'danger');
                }
                if (response.ok) {
                    // Login riuscito
                    console.log("Login riuscito:", responseData);
                    // Controlla se l'utente ha scelto "Ricordami"
                    if (document.getElementById("rememberMeCheck").checked) {
                        // Salva i dati dell'utente in localStorage (persistente)
                        localStorage.setItem('utenteAccesso', JSON.stringify(responseData.utente));
                    } else {
                        // Salva i dati dell'utente in sessionStorage (per la sessione corrente)
                        sessionStorage.setItem('utenteAccesso', JSON.stringify(responseData.utente));
                    }
                    // Reindirizza l'utente alla pagina del quiz dopo il login
                    window.location.href = "/quiz.html";
                }

            } catch (error) {
                // Gestisce errori nella richiesta di login (es. problemi di rete)
                console.error("Errore nella richiesta di login:", error);
            }
        }

    });
})
