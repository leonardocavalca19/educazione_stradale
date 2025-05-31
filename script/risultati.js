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
        for (let i = 0; i < utenti.length; i++) {
            if (utenti[i].test != null) {
                let tests = []
                for (let j = 0; j < utenti[i].test.length; j++) {
                    tests.push(new Quiz(utenti[i].test[j].domande));
                    tests[j].realizazzione = utenti[i].test[j].realizazzione;
                    let domande = []
                    for (let k = 0; k < tests[j].domande.length; k++) {
                        domande.push(new Domanda(tests[j].domande[k].testo, tests[j].domande[k].corretta, null));
                        domande[k].risposta = tests[j].domande[k].risposta;
                        if (tests[j].domande[k].img != null) {
                            domande[k].img = tests[j].domande[k].img;
                        }
                    }
                    tests[j].domande = domande;
                }
                utenti[i].test = tests;
            }
        }

    } catch (error) {
        console.error("Impossibile caricare il file utenti.json:", error);
        utenti = [];
    }
}
// Invoca la funzione principale 'crea' per iniziare il processo di caricamento e visualizzazione dei risultati.
crea()
/**
 * Funzione principale asincrona per inizializzare la pagina dei risultati.
 * Carica i dati degli utenti, identifica l'utente loggato, recupera l'ultimo quiz sostenuto
 * e imposta l'interfaccia per la revisione delle domande errate e il grafico di confronto.
 */
async function crea() {
    // Attende il caricamento completo dei dati di tutti gli utenti
    await getutenti()
    /**
     * Gestisce il logout dell'utente.
     * Rimuove i dati dell'utente da localStorage e sessionStorage e reindirizza alla pagina di login.
     */
    function noaccesso() {
        localStorage.removeItem('utenteAccesso');
        sessionStorage.removeItem('utenteAccesso');
        window.location.href = "/login.html"
    }
    /** @type {string | object | null} Recupera i dati dell'utente loggato dallo storage. Inizialmente è una stringa JSON. */
    let accesso
    if (sessionStorage.getItem('utenteAccesso') == null) {
        accesso = localStorage.getItem('utenteAccesso')
    }
    else if (sessionStorage.getItem('utenteAccesso') != null) {
        accesso = sessionStorage.getItem('utenteAccesso')
    }
    if (accesso) {
        try {
            // Parsa i dati dell'utente (se ancora stringa) per ottenere l'email e cercare l'oggetto Utente completo.
            for (let i = 0; i < utenti.length; i++) {
                if (!(accesso instanceof Utente)) {
                    if (utenti[i].email == JSON.parse(accesso).email) {
                        accesso = utenti[i]
                        break
                    }
                }
            }

        } catch (e) {
            console.error("Errore nel parsing dell'utente da localStorage:", e);
            noaccesso();
        }
    } else {
        // Se l'utente dallo storage non corrisponde a nessun utente caricato da utenti.json
        noaccesso();
    }
    // Verifica finale che 'accesso' sia un'istanza di Utente.
    if (!(accesso instanceof Utente)) {
        noaccesso()
    }
    /**
    * Crea o aggiorna un grafico a barre (usando Chart.js) per mostrare come altri utenti
    * hanno risposto a una specifica domanda errata.
    * @param {string} canvasId - L'ID dell'elemento canvas nel DOM per il grafico.
    * @param {{conteggioVero: number, conteggioFalso: number}} statisticheAltri - Oggetto con il conteggio delle risposte "Vero" e "Falso" date da altri utenti.
    */
    function creaGraficoConfrontoPerDomandaErrata(canvasId, statisticheAltri) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas con ID ${canvasId} non trovato per il grafico.`);
            return;
        }
        // Distrugge un eventuale grafico precedente sullo stesso canvas per evitarne la sovrapposizione.
        if (window.graficoConfrontoDomanda instanceof Chart) {
            window.graficoConfrontoDomanda.destroy();
        }
        // Crea una nuova istanza di Chart.js.
        window.graficoConfrontoDomanda = new Chart(ctx.getContext('2d'), {
            type: 'bar', // Tipo di grafico: a barre.
            data: {
                labels: ['Altri Utenti'], // Etichetta per il gruppo di barre.
                datasets: [
                    {
                        label: 'Hanno Risposto "Vero"',
                        data: [statisticheAltri.conteggioVero],
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Hanno Risposto "Falso"',
                        data: [statisticheAltri.conteggioFalso],
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                indexAxis: 'y', // Barre orizzontali.
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { // Asse X (valori numerici delle risposte).
                        beginAtZero: true,
                        stacked: false, // Barre affiancate, non impilate
                        title: {
                            display: true,
                            text: 'Numero di Risposte Date dagli Altri Utenti'
                        }
                    },
                    y: { // Asse Y (etichetta 'Altri Utenti').
                        stacked: false
                    }
                },
                plugins: {
                    legend: {
                        position: 'top', // Posizione della legenda.
                    },
                    title: {
                        display: true,
                        text: 'Distribuzione Risposte Altri Utenti'
                    }
                }
            }
        });
    }
    /**
     * Listener che si attiva quando il documento HTML è stato completamente caricato e parsato.
     * Imposta la visualizzazione dei risultati, la navigazione tra le domande errate e gli event listener.
     */
    document.addEventListener("DOMContentLoaded", function () {
        if (localStorage.getItem('utenteAccesso') != null) {
            document.getElementById("nome").textContent = "Ciao " + JSON.parse(localStorage.getItem('utenteAccesso')).nome + " " + JSON.parse(localStorage.getItem('utenteAccesso')).cognome
        }
        else if (sessionStorage.getItem('utenteAccesso') != null) {
            document.getElementById("nome").textContent = "Ciao " + JSON.parse(sessionStorage.getItem('utenteAccesso')).nome + " " + JSON.parse(sessionStorage.getItem('utenteAccesso')).cognome
        }
        // Event listener per il link/bottone del profilo
        document.getElementById("profilo").addEventListener("click", function () {
            window.location.href = "/profilo.html"
        })
        // Event listener per il bottone di logout.
        document.getElementById("logoutBtn").addEventListener("click", function () {
            noaccesso()
            window.location.href = "/login.html";
        })
        // Recupera l'ultimo quiz sostenuto dall'utente.
        const quiz = accesso.test[accesso.test.length - 1]
        /** @type {Domanda[]} Array per memorizzare le domande a cui l'utente ha risposto erroneamente. */
        let errate = []
        let vero = 0
        let falso = 0
        for (let i = 0; i < quiz.domande.length; i++) {
            if (!quiz.domande[i].controllagiusta()) {
                errate.push(quiz.domande[i])
            }
        }
        let n = 0
        // Determina se l'utente è promosso o bocciato in base al numero di errori.
        if (errate.length <= 3) {
            document.getElementById("risposta").textContent = "Promosso! 🥳🥳"
            document.getElementById("divrisposta").style.backgroundColor = "green"
        }
        else {
            document.getElementById("risposta").textContent = "Bocciato 😓😓"
            document.getElementById("divrisposta").style.backgroundColor = "red"
        }
        /**
         * Aggiorna la visualizzazione della domanda errata corrente e il grafico di confronto.
         * @param {number} n - L'indice della domanda errata (nell'array 'errate') da visualizzare.
         */
        function aggiorna(n) {
            // Aggiorna stato bottoni "Precedente" e "Successiva"
            if (n > 0) {
                if (document.getElementById("domandaPrecedenteRevisione").disabled) {
                    document.getElementById("domandaPrecedenteRevisione").disabled = false
                }
            }
            if (n < errate.length - 1) {
                if (document.getElementById("domandaSuccessivaRevisione").disabled) {
                    document.getElementById("domandaSuccessivaRevisione").disabled = false
                }
            }
            if (n == errate.length - 1) {
                document.getElementById("domandaSuccessivaRevisione").disabled = true
            }
            if (n == 0) {
                document.getElementById("domandaPrecedenteRevisione").disabled = true
            }
            for (let j = 0; j < utenti.length; j++) {
                let arrayDomandeAltroUtente
                let indiceDomandaInAltroUtente
                try {
                    arrayDomandeAltroUtente = utenti[j].test[utenti[j].test.length - 1].domande;
                    indiceDomandaInAltroUtente = arrayDomandeAltroUtente.findIndex(d => d.testo === quiz.domande[n].testo);
                    if (arrayDomandeAltroUtente.includes(quiz.domande[n])) {
                        if (arrayDomandeAltroUtente[indiceDomandaInAltroUtente].risposta == true && utenti[j] != accesso) {
                            vero++
                        }
                        else if (arrayDomandeAltroUtente[indiceDomandaInAltroUtente].risposta == false && utenti[j] != accesso) {
                            falso++
                        }
                    }
                }
                catch {

                }

            }
            let statistche = {
                conteggioVero: vero,
                conteggioFalso: falso

            }
            creaGraficoConfrontoPerDomandaErrata("graficoConfrontoDomanda", statistche)
            document.getElementById("numeroDomandaRevisione").textContent = "Domanda N. " + (accesso.test[accesso.test.length - 1].domande.findIndex(d => d.testo === errate[n].testo) + 1)
            document.getElementById("testoDomandaRevisione").textContent = errate[n].testo
            if (errate[n].risposta == true) {
                document.getElementById("rispostaUtenteRevisione").textContent = "vero"
            }
            else {
                document.getElementById("rispostaUtenteRevisione").textContent = "falso"
            }

            if (errate[n].corretta == true) {
                document.getElementById("rispostaCorrettaRevisione").textContent = "vero"
            }
            else {
                document.getElementById("rispostaCorrettaRevisione").textContent = "falso"
            }
        }
        aggiorna(n)
        document.getElementById("domandaSuccessivaRevisione").addEventListener("click", function () {
            n += 1
            aggiorna(n)
        })
        document.getElementById("domandaPrecedenteRevisione").addEventListener("click", function () {
            n -= 1
            aggiorna(n)
        })




    })
}
