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
    messageArea.innerHTML = '';
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
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }
        const datiJSON = await response.json();
        for (let i = 0; i < datiJSON.length; i++) {
            utenti.push(new Utente(datiJSON[i].nome, datiJSON[i].cognome, datiJSON[i].email, datiJSON[i].passwordHash, datiJSON[i].dataNascita, datiJSON[i].test))
        }

    } catch (error) {
        console.error("Impossibile caricare il file utenti.json:", error);
        utenti = [];
    }
}
/**
 * Invia asincronamente i dati del nuovo utente al server per la registrazione.
 * @param {Utente} datiUtente - L'oggetto Utente contenente i dati da registrare.
 */
async function inviaDatiNuovoUtenteAlServer(datiUtente) {
    try {
        // Effettua una richiesta POST all'endpoint '/registra-utente'
        const response = await fetch('/registra-utente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Specifica che il corpo è JSON
            body: JSON.stringify(datiUtente), // Converte l'oggetto Utente in una stringa JSON
        });
        const risultato = await response.json(); // Parsa la risposta JSON dal server

        if (!response.ok) {
            // Se la risposta del server non è OK (es. utente già esistente, dati non validi),
            // logga l'errore e mostra un messaggio all'utente.
            console.error('CLIENT: Errore dal server:', risultato.message);
            displayMessage(risultato.message, risultato.type || 'danger');
            return;
        }
        // Se la registrazione ha successo, mostra un messaggio di successo.
        displayMessage(risultato.message || 'Utente registrato con successo!', risultato.type || 'success');
    } catch (error) {
        // Gestisce errori di rete o altri problemi durante l'invio della richiesta.
        console.error('CLIENT: Errore durante l_invio dei dati utente:', error);
    }
}
// Invoca getutenti per caricare i dati degli utenti esistenti all'avvio dello script.
// Questo è utile per eventuali controlli di duplicazione prima di inviare i dati al server.
getutenti()
/**
 * Listener che si attiva quando il documento HTML è stato completamente caricato e parsato.
 * Imposta la gestione del submit del form di registrazione.
 */
document.addEventListener("DOMContentLoaded", function () {
    /**
         * Aggiunge un event listener al form con ID 'registrazioneForm' per l'evento 'submit'.
         * Gestisce la validazione dei campi del form e l'invio dei dati per la registrazione.
         * @param {Event} event - L'oggetto evento submit.
         */
    document.getElementById("registrazioneForm").addEventListener("submit", async function (event) {
        event.preventDefault() // Previene il submit tradizionale del form
        // Flag per tenere traccia della validità di ciascun campo
        let nomecorretto = false
        let cognomecorretto = false
        let mailcorretta = false
        let password = false
        let password2 = false
        let datacorretta = false
        // Validazione Nome: solo lettere e spazi
        if (!new RegExp("^[a-zA-Z ]+$").test(document.getElementById("nomeInput").value)) {
            nomeInput.classList.add("is-invalid");
            nomeInput.classList.remove("is-valid")
            nomecorretto = false
        }
        else {
            nomeInput.classList.remove("is-invalid");
            nomeInput.classList.add("is-valid");
            nomecorretto = true
        }
        // Validazione Cognome: solo lettere e spazi
        if (!new RegExp("^[a-zA-Z ]+$").test(document.getElementById("cognomeInput").value)) {
            cognomeInput.classList.add("is-invalid");
            cognomeInput.classList.remove("is-valid")
            cognomecorretto = false
        }
        else {
            cognomeInput.classList.remove("is-invalid");
            cognomeInput.classList.add("is-valid");
            cognomecorretto = true
        }
         // Validazione Email: utilizza la validazione HTML5 e controlla che non sia vuota
        if (!document.getElementById("emailRegistrazioneInput").checkValidity()) {
            emailRegistrazioneInput.classList.add("is-invalid");
            emailRegistrazioneInput.classList.remove("is-valid")
            mailcorretta = false
        }
        else {
            emailRegistrazioneInput.classList.remove("is-invalid");
            emailRegistrazioneInput.classList.add("is-valid");
            mailcorretta = true
        }
        // Validazione Password: almeno 8 caratteri (qualsiasi carattere stampabile)
        if (!new RegExp("[ -~]{8}").test(document.getElementById("passwordRegistrazioneInput").value) || !document.getElementById("passwordRegistrazioneInput").checkValidity()) {
            passwordRegistrazioneInput.classList.add("is-invalid");
            passwordRegistrazioneInput.classList.remove("is-valid")
            password = false
        }
        else {
            passwordRegistrazioneInput.classList.remove("is-invalid");
            passwordRegistrazioneInput.classList.add("is-valid");
            password = true
        }
        // Validazione Conferma Password: deve corrispondere alla password inserita e soddisfare i criteri di lunghezza
        if (!(document.getElementById("confermaPasswordInput").value === document.getElementById("passwordRegistrazioneInput").value && new RegExp("[ -~]{8}").test(document.getElementById("passwordRegistrazioneInput").value))) {
            confermaPasswordInput.classList.add("is-invalid");
            confermaPasswordInput.classList.remove("is-valid")
            password2 = false
        }
        else {
            confermaPasswordInput.classList.remove("is-invalid");
            confermaPasswordInput.classList.add("is-valid");
            password2 = true
        }
        // Validazione Data di Nascita: non deve essere vuota e non deve essere una data futura
        if (document.getElementById("dataNascitaInput").value == "" || new Date(document.getElementById("dataNascitaInput").value) > new Date()) {
            dataNascitaInput.classList.add("is-invalid");
            dataNascitaInput.classList.remove("is-valid")
            datacorretta = false
        }
        else {
            dataNascitaInput.classList.remove("is-invalid");
            dataNascitaInput.classList.add("is-valid");
            datacorretta = true
        }
        // Validazione Check Termini e Condizioni: deve essere spuntato
        if (!document.getElementById("terminiCheck").checked) {
            terminiCheck.classList.add("is-invalid");
            terminiCheck.classList.remove("is-valid")
        }
        else {
            terminiCheck.classList.remove("is-invalid");
            terminiCheck.classList.add("is-valid");
        }
         // Se tutti i campi sono validi, procede con la creazione dell'utente e l'invio al server
        if (nomecorretto && cognomecorretto && mailcorretta && password && password2 && datacorretta && document.getElementById("terminiCheck").checked) {
             // Crea un nuovo oggetto Utente. La password viene passata in chiaro;
            // l'hashing dovrebbe avviene lato server prima del salvataggio.
            // Il campo 'test' viene inizializzato come array vuoto.
            let nuovoutente = new Utente(document.getElementById("nomeInput").value, document.getElementById("cognomeInput").value, document.getElementById("emailRegistrazioneInput").value, document.getElementById("passwordRegistrazioneInput").value, new Date(document.getElementById("dataNascitaInput").value), [])
            // Controllo di duplicazione
            let contenuto = false
            for (let i = 0; i < utenti.length - 1; i++) {
                if (JSON.stringify(nuovoutente) == JSON.stringify(utenti[i])) {
                    contenuto = true
                    break
                }
            }
            if (!contenuto) {
                utenti.push(nuovoutente)
                await inviaDatiNuovoUtenteAlServer(nuovoutente)
            }

        }
    })
})