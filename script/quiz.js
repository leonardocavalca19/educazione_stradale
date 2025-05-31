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
/** @type {string | null} Stringa JSON contenente i dati base dell'utente loggato, recuperata dallo storage. */
let accesso
if (sessionStorage.getItem('utenteAccesso') == null) {
  accesso = localStorage.getItem('utenteAccesso')
}
else {
  accesso = sessionStorage.getItem('utenteAccesso')
}
/** @type {Utente | null} Oggetto rappresentante l'utente attualmente loggato. Inizializzato a null. */
let utenteCorrente = null
/**
 * Gestisce il logout dell'utente.
 * Rimuove i dati dell'utente da localStorage e sessionStorage e reindirizza alla pagina di login.
 */
function noaccesso() {
  localStorage.removeItem('utenteAccesso');
  sessionStorage.removeItem('utenteAccesso');
  window.location.href = "/login.html"
}
if (accesso) {
  // Autenticazione dell'utente: prova a parsare 'accesso' o reindirizza al login.
  try {
    utenteCorrente = JSON.parse(accesso);
  } catch (e) {
    console.error("Errore nel parsing dell'utente da localStorage:", e);
    noaccesso();
  }
} else {
  noaccesso();
}
/** @type {Quiz} Istanza del quiz corrente. Definita in libreriaclassi.js */
let quizz = new Quiz();
quizz.caricaDomande(); // Carica le domande per il quiz. Usando il metodo "casicadomande" della classe Quiz
creaquiz();
/**
 * Funzione principale che costruisce l'interfaccia del quiz, gestisce la navigazione
 * tra le domande, la raccolta delle risposte e il salvataggio finale del quiz.
 */
function creaquiz() {
  /**
   * Scorre la barra di navigazione delle domande per centrare il bottone della domanda attiva.
   * @param {number} indiceBottoneAttivo - L'indice del bottone (domanda) attualmente attivo.
   */
  function scrollNavigazioneVersoBottoneAttivo(indiceBottoneAttivo) {
    const containerNavigazione = document.getElementById("navigazione");
     // Assicura che bottoni[indiceBottoneAttivo] esista
    if (!bottoni || bottoni.length === 0) return;
    
    const bottoneAttivo = bottoni[indiceBottoneAttivo];

    if (containerNavigazione && bottoneAttivo) {
      const containerLarghezza = containerNavigazione.clientWidth;
      const bottoneOffsetLeft = bottoneAttivo.offsetLeft;
      const bottoneLarghezza = bottoneAttivo.offsetWidth;
      // Calcola la destinazione per centrare il bottone
      let destinazioneScroll = bottoneOffsetLeft - (containerLarghezza / 2) + (bottoneLarghezza / 2);
      // Limita lo scroll ai confini del container
      destinazioneScroll = Math.max(0, destinazioneScroll);
      destinazioneScroll = Math.min(destinazioneScroll, containerNavigazione.scrollWidth - containerLarghezza);
      containerNavigazione.scrollTo({
        left: destinazioneScroll,
        behavior: 'smooth' // Animazione di scroll fluida
      });
    }
  }
   // Imposta il messaggio di benvenuto (es. "Ciao Mario Rossi")
  // Utilizza 'utenteCorrente' che dovrebbe contenere i dati base parsati dallo storage.
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
  // Event listener per lo scroll orizzontale della navigazione domande con la rotellina del mouse
  document.getElementById("navigazione").addEventListener('wheel', function (event) {
    event.preventDefault();
    const scrollAmount = event.deltaY;
    document.getElementById("navigazione").scrollLeft += scrollAmount;
  });
  // Event listener per il bottone di reset della lingua (Google Translate widget)
  document.getElementById("resettaLinguaBtn").addEventListener("click", function () {
    document.cookie = "googtrans=/it/it; path=/; SameSite=Lax";
    window.location.reload();
  })
  // Event listener per il bottone di logout
  document.getElementById("logoutBtn").addEventListener("click", function () {
    noaccesso()
    window.location.href = "/login.html";
  })
   /** @type {Domanda[]} Array delle domande caricate per il quiz corrente. */
  let domande = quizz.domande;
   /** @type {number} Altezza massima riscontrata per il testo di una domanda, usata per layout consistente. */
  let max = 0;
  /** @type {HTMLButtonElement[]} Array dei bottoni di navigazione per le domande. */
  let bottoni = []
  /** @type {number} Indice della domanda corrente. */
  let i = 0;
  // Crea i bottoni di navigazione per ogni domanda
  for (let j = 0; j < domande.length; j++) {
    let bottone = document.createElement("button"); 
    bottone.textContent = j + 1; // Numero della domanda
     // Stili Bootstrap
    bottone.classList.add("btn");
    bottone.classList.add("btn-outline-secondary");

    bottone.addEventListener("click", function () {
       // Aggiorna lo stile dei bottoni precedenti: se non risposti -> outline, se risposti -> success
      for (let a = 0; a < bottoni.length; a++) {
        if (domande[a].risposta == null) { // Domanda non risposta
          bottoni[a].style.color = "#6c757d" // Colore standard outline
        }
        else {
          if (bottoni[a].classList.contains("btn-primary")) {
            bottoni[a].classList.remove("btn-primary");
          }
          bottoni[a].classList.add("btn-success");
        }
      }
      // Rimuove lo stato 'attivo' (btn-primary) dal bottone precedentemente attivo, se esiste ed è diverso da quello cliccato
      const bottoneAttivoPrecedente = document.querySelector('#navigazione button.btn-primary');
      if (bottoneAttivoPrecedente && bottoneAttivoPrecedente !== this) {
        bottoneAttivoPrecedente.classList.remove("btn-primary");
      }

      i = j; // Imposta l'indice della domanda corrente
      aggiornadomanda(i); // Aggiorna la visualizzazione della domanda



    });

    bottoni.push(bottone);
    document.getElementById("navigazione").appendChild(bottone);
  }

   // Imposta il primo bottone di navigazione come attivo se ci sono bottoni
  if (bottoni.length > 0 && bottoni[0].style.backgroundColor !== "rgb(124, 252, 0)") {
    bottoni[0].classList.remove("btn-outline-secondary");
    bottoni[0].classList.add("btn-primary");
  }
  // Calcola l'altezza massima del testo tra tutte le domande per uniformare l'altezza del contenitore
  for (let i = 0; i < domande.length; i++) {
    altezza = parseFloat(window.getComputedStyle(document.getElementById("testo")).getPropertyValue("height"))
    document.getElementById("testo").textContent = domande[i].testo;
    if (altezza > max) {
      max = altezza;
    }
  }
  document.getElementById("testo").style.height = max + "px";

  /**
   * Aggiorna la visualizzazione della domanda corrente (testo, immagine, numero domanda)
   * e lo stato dei bottoni di risposta e navigazione.
   * @param {number} n - L'indice della domanda da visualizzare.
   * @returns {number | undefined} L'indice della domanda visualizzata, o undefined se l'indice è fuori range.
   */
  function aggiornadomanda(n) {
    if (n < domande.length) {
      scrollNavigazioneVersoBottoneAttivo(n); // Centra il bottone di navigazione
      // Aggiorna lo stile del bottone di navigazione corrente
      // Se non è già 'success' (risposto), lo rende 'primary' (attivo)
      if (!bottoni[n].classList.contains("btn-success")) {
        bottoni[n].classList.add("btn-primary");
        bottoni[n].style.color = "white"
      }
      else {
        // Se è 'success', potrebbe comunque diventare 'primary' per indicare che è la domanda attiva
        // ma mantenendo l'indicazione di 'success'
        bottoni[n].classList.add("btn-primary");
        bottoni[n].classList.remove("btn-success")
      }
       // Mostra il testo della domanda
      document.getElementById("testo").textContent = domande[n].testo;
      // Gestisce la visualizzazione dell'immagine della domanda
      if (domande[n].img !== null) {
        document.getElementById("immagine").src = domande[n].img;
        document.getElementById("immagine").style.display = "";// Mostra l'immagine
      }
      else {
        document.getElementById("immagine").style.display = "none";// Nasconde l'immagine
      }
      // Se la domanda ha già una risposta, evidenzia il bottone corrispondent
      if (domande[n].risposta != null) {
        if (domande[n].risposta == true) {
          document.getElementsByClassName("bottoni")[1].classList.remove("btn-danger")
          if (!document.getElementsByClassName("bottoni")[0].classList.contains("btn-success")) {
            document.getElementsByClassName("bottoni")[0].classList.add("btn-success")
          }
        }
        else {
          document.getElementsByClassName("bottoni")[0].classList.remove("btn-success")
          if (!document.getElementsByClassName("bottoni")[1].classList.contains("btn-danger")) {
            document.getElementsByClassName("bottoni")[1].classList.add("btn-danger")
          }
        }
      }
      else {
        if (!document.getElementsByClassName("bottoni")[0].classList.contains("btn-success")) {
          document.getElementsByClassName("bottoni")[0].classList.add("btn-success")
        }
        if (!document.getElementsByClassName("bottoni")[1].classList.contains("btn-danger")) {
          document.getElementsByClassName("bottoni")[1].classList.add("btn-danger")
        }
      }
       // Aggiorna il numero della domanda visualizzato
      document.getElementById("numero-domanda").textContent = n + 1;
      return n
    }
    // Se n è fuori range (es. fine quiz), non fa nulla

  }
  // Visualizza la prima domanda all'avvio
  aggiornadomanda(i);
  // Aggiunge event listener ai bottoni di risposta (Vero/Falso)
  for (let s = 0; s < document.getElementsByClassName("bottoni").length; s++) {
    document.getElementsByClassName("bottoni")[s].addEventListener("click", function () {
      if (i < domande.length) {
        // Registra la risposta data dall'utente
        domande[i].risposta = (this.value === "true");

        // Aggiorna lo stile del bottone di navigazione per indicare che la domanda è stata risposta
        bottoni[i].classList.add("btn");
        bottoni[i].classList.add("btn-success");
        bottoni[i].style.color = "white"
        let esci = true
        // Controlla se tutte le domande hanno ricevuto una risposta
        for (let a = 0; a < domande.length; a++) {
          for (let j = 0; j < domande.length; j++) {
            if (domande[j].risposta == null) {
              esci = false
            }
          }
        }
        if (!esci) {
          // Se non tutte le domande sono state risposte, passa alla domanda successiva
          i += 1;
          aggiornadomanda(i);
        }
        else {
           // Tutte le domande sono state risposte: il quiz è completato.
          for (let i = 0; i < utenti.length; i++) {
            if (JSON.parse(JSON.stringify(utenti[i])).email === JSON.parse(accesso).email) {
              utenteCorrente = utenti[i]
            }
          }
          quizz.domande = domande //assegna le domande aggiornate al quiz
          utenteCorrente.test.push(quizz) //aggiunge il quiz all'utente
          // Aggiorna i dati dell'utente in localStorage o sessionStorage
          if (sessionStorage.getItem('utenteAccesso') !== null) {
            sessionStorage.setItem("utenteAccesso", JSON.stringify(utenteCorrente));
            console.log("Dati utente aggiornati in sessionStorage.");
          } else if (localStorage.getItem('utenteAccesso') !== null) {

            localStorage.setItem("utenteAccesso", JSON.stringify(utenteCorrente));
          } else {
            console.warn("Origine storage utente non chiara, salvo in sessionStorage di default.");
            sessionStorage.setItem("utenteAccesso", JSON.stringify(utenteCorrente));
          }

          const emailUtente = utenteCorrente ? utenteCorrente.email : null;
          quizz.realizazzione = new Date()
          const aggiornamentiPayload = {
            nuovoQuizCompletato: quizz
          };
          /**
           * Invia i dati del quiz completato al server per la memorizzazione persistente.
           * @param {string | null} emailAttuale - L'email dell'utente per identificarlo sul server.
           * @param {object} aggiornamenti - L'oggetto contenente il nuovo quiz completato.
           */
          async function modificaDatiUtente(emailAttuale, aggiornamenti) {
            const url = '/modifica-utente'; // Endpoint del server per aggiornare i dati utente

            const payloadDaInviare = {
              emailDaModificare: emailAttuale,
              aggiornamenti: aggiornamenti // L'oggetto quiz completo
            };
            try {
              const response = await fetch(url, {
                method: 'PUT', // Metodo HTTP per aggiornare risorse esistenti
                headers: {
                  'Content-Type': 'application/json' // Il corpo della richiesta è JSON
                },
                body: JSON.stringify(payloadDaInviare) // Converte l'oggetto payload in una stringa JSON
              });

              const responseData = await response.json(); // Parsa la risposta JSON dal server

              if (response.ok) {
              } else {
                console.error('Errore dal server:', responseData);
                displayMessage(responseData.message || 'Si è verificato un errore durante la modifica.', 'danger');
              }
            } catch (error) {
              console.error('Errore durante l_invio della richiesta:', error);
              displayMessage('Errore di connessione o durante la richiesta. Riprova.', 'danger');
            }
          }
          // Chiama la funzione per inviare i dati al server
          modificaDatiUtente(emailUtente, aggiornamentiPayload)
          // Il reindirizzamento a risultati.html ora avviene dentro modificaDatiUtente dopo la risposta del server.
          window.location.href = "/risultati.html"

        }

      }


    })
  }
  function noaccesso() {
    localStorage.removeItem('utenteAccesso');
    sessionStorage.removeItem('utenteAccesso');
    window.location.href = "/login.html"
  }
}





