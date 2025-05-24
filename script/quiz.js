let accesso = localStorage.getItem('utenteAccesso')
let utenteCorrente = null
function noaccesso() {
  localStorage.removeItem('utenteAccesso');
  window.location.href = "/login.html"
}
let quizz
quizz = new Quizz();
quizz.caricaDomande();

async function modificaDatiUtente(emailAttuale, aggiornamenti) {
  const url = 'http://localhost:3000/modifica-utente';

  const payload = {
    emailDaModificare: emailAttuale,
    aggiornamenti: aggiornamenti
  };

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('Risposta dal server (modifica dati utente):', responseData);

      if (responseData.utente) {
        localStorage.setItem("utenteAccesso", JSON.stringify(responseData.utente));

        utenteCorrente = responseData.utente;
      }
      return { success: true, message: responseData.message, utenteAggiornato: responseData.utente };
    } else {
      console.error('Errore dal server (modifica dati utente):', responseData);
      return { success: false, message: responseData.message || 'Si è verificato un errore durante la modifica.' };
    }
  } catch (error) {
    console.error('Errore durante l_invio della richiesta (modifica dati utente):', error);
    return { success: false, message: 'Errore di connessione o durante la richiesta. Riprova.' };
  }
}

function creaquiz() {
  document.getElementById("navigazione").addEventListener('wheel', function (event) {
    event.preventDefault();
    const scrollAmount = event.deltaY;
    document.getElementById("navigazione").scrollLeft += scrollAmount;
  });

  document.getElementById("resettaLinguaBtn").addEventListener("click", function () {
    document.cookie = "googtrans=/it/it; path=/; SameSite=Lax";
    window.location.reload();
  });

  document.getElementById("logoutBtn").addEventListener("click", function () {
    noaccesso();
  });

  let domande = quizz.domande;
  let max = 0;
  let bottoni = []
  let i = 0;
  for (let j = 0; j < domande.length; j++) {
    let bottone = document.createElement("button");
    bottone.textContent = j + 1;
    bottone.dataset.domandaIndex = j;

    bottone.classList.add("btn", "btn-outline-secondary", "btn-sm", "me-2");

    bottone.addEventListener("click", function () {
      i = parseInt(this.dataset.domandaIndex);
      aggiornadomanda(i);
    });
    bottoni.push(bottone);
    document.getElementById("navigazione").appendChild(bottone);
  }

  for (let k = 0; k < domande.length; k++) {
    document.getElementById("testo").textContent = domande[k].testo;
    let altezza = parseFloat(window.getComputedStyle(document.getElementById("testo")).getPropertyValue("height"));
    if (altezza > max) {
      max = altezza;
    }
  }
  document.getElementById("testo").style.height = max + "px";


  function aggiornadomanda(n) {
    document.getElementById("testo").textContent = domande[n].testo;
    if (domande[n].img !== null) {
      document.getElementById("immagine").src = domande[n].img;
      document.getElementById("immagine").style.display = "";
    }
    else {
      document.getElementById("immagine").style.display = "none";
    }
    document.getElementById("numero-domanda").textContent = n + 1;
    document.querySelectorAll('#navigazione button').forEach(btn => {
      btn.classList.remove('active');
      btn.classList.add('btn-outline-secondary');

      btn.style.backgroundColor = '';


      const domandaIndex = parseInt(btn.dataset.domandaIndex);
      if (domande[domandaIndex] && domande[domandaIndex].risultato !== null) {
        btn.classList.remove('btn-outline-secondary');
        btn.classList.add('btn-success-custom');
      }
    });

    const currentButton = document.querySelector(`#navigazione button[data-domanda-index="${n}"]`);
    if (currentButton) {
      currentButton.classList.add('active');
      currentButton.classList.remove('btn-outline-secondary', 'btn-success-custom');
      currentButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }
  aggiornadomanda(i);



  for (let s = 0; s < document.getElementsByClassName("bottoni").length; s++) {
    document.getElementsByClassName("bottoni")[s].addEventListener("click", async function () {
      if (i < domande.length) {
        if (domande[i].controllagiusta(this.value === "true")) {
          domande[i].risultato = true;
        }
        else {
          domande[i].risultato = false;
        }
        const currentNavButton = document.querySelector(`#navigazione button[data-domanda-index="${i}"]`);
        if (currentNavButton) {
          currentNavButton.classList.remove('active', 'btn-outline-secondary');
          currentNavButton.classList.add('btn-success-custom');
        }
        if (i < domande.length - 1) {
          i += 1;
          aggiornadomanda(i);
        }
        else {
          let finito = true
          for (let j = 0; j < domande.length; j++) {
            if (domande[j].risultato == null) {
              finito = false
            }
          }
          if (finito) {
            let utenteStringaDaStorage = localStorage.getItem("utenteAccesso");
            let utenteDatiParsati = null;
            if (!utenteStringaDaStorage || utenteStringaDaStorage === "null") {
              console.error("ERRORE nel blocco if(finito): 'utenteAccesso' non trovato o è la stringa 'null' in localStorage. Impossibile salvare il quiz.");
              alert("Errore: sessione utente non valida o scaduta. Per favore, effettua nuovamente il login.");
              localStorage.removeItem('utenteAccesso');
              sessionStorage.removeItem('utenteAccesso');
              window.location.href = "/login.html";
              return;
            }
            console.log("DEBUG: Oggetto 'quizz' (dovrebbe contenere le domande e i risultati):", JSON.parse(JSON.stringify(quizz)));
            console.log("DEBUG: Contenuto di 'utenteConQuiz.test' (dovrebbe essere un array con l'oggetto quizz):", JSON.parse(JSON.stringify(utenteConQuiz.test)));
            console.log("DEBUG: Lunghezza di 'utenteConQuiz.test':", utenteConQuiz.test ? utenteConQuiz.test.length : "non definito o null");

            const aggiornamentiDaInviare = {
              test: utenteConQuiz.test
            };

            console.log("Invio dati aggiornati al server:", emailPerSalvataggio, aggiornamentiDaInviare);
            if (utenteConQuiz.test && utenteConQuiz.test.length > 0) {
              console.log("DEBUG: 'utenteConQuiz.test[0]' (il primo quiz nell'array):", JSON.parse(JSON.stringify(utenteConQuiz.test[0])));
              if (utenteConQuiz.test[0] && utenteConQuiz.test[0].domande) {
                console.log("DEBUG: Numero di domande nel primo quiz:", utenteConQuiz.test[0].domande.length);
              }
            } else {
              console.warn("ATTENZIONE: 'utenteConQuiz.test' è vuoto o non definito prima di inviare al server!");
            }

            if (emailPerSalvataggio) {
              modificaDatiUtente(emailPerSalvataggio, aggiornamentiDaInviare);
            }


            try {
              utenteDatiParsati = JSON.parse(utenteStringaDaStorage);
            } catch (e) {
              console.error("ERRORE nel blocco if(finito): Errore nel parsing di 'utenteAccesso' da localStorage. Dati corrotti?", e);
              console.log("Stringa problematica da localStorage:", utenteStringaDaStorage);
              alert("Errore: i dati della sessione utente sembrano corrotti. Per favore, effettua nuovamente il login.");
              localStorage.removeItem('utenteAccesso');
              window.location.href = "/login.html";
              return;
            }

            if (!utenteDatiParsati || !utenteDatiParsati.email) {
              console.error("ERRORE nel blocco if(finito): Dati utente parsati non validi o email mancante.");
              console.log("Dati utente problematici:", utenteDatiParsati);
              alert("Errore: i dati utente sono incompleti. Per favore, effettua nuovamente il login.");
              localStorage.removeItem('utenteAccesso');
              window.location.href = "/login.html";
              return;
            }

            console.log("DEBUG nel blocco if(finito): Dati utente letti e validati da localStorage:", utenteDatiParsati);


            let testEsistenti = [];
            if (utenteDatiParsati.test && Array.isArray(utenteDatiParsati.test)) {
              testEsistenti = utenteDatiParsati.test;
            }

            let utenteConQuiz = new Utente(
              utenteDatiParsati.nome,
              utenteDatiParsati.cognome,
              utenteDatiParsati.email,
              null,
              null,
              testEsistenti
            );
            utenteConQuiz.test.push(quizz);


            try {
              localStorage.setItem("utenteAccesso", JSON.stringify(utenteConQuiz));
              console.log("Utente aggiornato con il nuovo quiz e salvato in localStorage:", utenteConQuiz);
            } catch (e) {
              console.error("ERRORE nel blocco if(finito): Impossibile salvare utente aggiornato in localStorage", e);
              alert("Errore durante il salvataggio locale dei progressi. Il quiz potrebbe non essere salvato correttamente.");

            }

            const emailPerSalvataggio = utenteConQuiz.email;

            if (emailPerSalvataggio) {
              const aggiornamentiDaInviare = {

              };
              console.log("Invio dati aggiornati al server:", emailPerSalvataggio, aggiornamentiDaInviare);
              modificaDatiUtente(emailPerSalvataggio, aggiornamentiDaInviare);
            } else {

              console.error("ERRORE CRITICO nel blocco if(finito): Email dell'utente non disponibile per il salvataggio sul server, nonostante le validazioni.");
              alert("Errore critico: impossibile identificare l'utente per il salvataggio sul server.");
            }
          }
        }


        document.getElementById("quizlink").addEventListener("click", function (event) {
          event.preventDefault();
          if (localStorage.getItem('utenteAccesso') == null) {
            noaccesso()
          }
          else {
            window.location.href = "/quiz.html"
          }
        })
      }
    })
  }
}




