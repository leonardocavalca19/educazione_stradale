let accesso = localStorage.getItem('utenteAccesso')
let utenteCorrente = null
  (function () {

    function getUtenteSalvato() {
      let datiUtenteString = localStorage.getItem('utenteAccesso');
      if (datiUtenteString) {
        return { dati: datiUtenteString, tipoStorage: 'localStorage' };
      }
      datiUtenteString = sessionStorage.getItem('utenteAccesso');
      if (datiUtenteString) {
        return { dati: datiUtenteString, tipoStorage: 'sessionStorage' };
      }
      return null;
    }

    let infoUtenteStorage = getUtenteSalvato(); 
    let accesso = infoUtenteStorage ? infoUtenteStorage.dati : null;


    let utenteCorrente = null;

    function noaccesso() {
      localStorage.removeItem('utenteAccesso');
      sessionStorage.removeItem('utenteAccesso'); 
      window.location.href = "/login.html";
      throw new Error("Accesso negato o utente non valido. Reindirizzamento a /login.html in corso.");
    }

    if (accesso) {
      try {
        utenteCorrente = JSON.parse(accesso);
        if (!utenteCorrente || !utenteCorrente.email) {
          console.error("ERRORE INIZIALE: Oggetto utente non valido o email mancante (da " + (infoUtenteStorage ? infoUtenteStorage.tipoStorage : "sconosciuto") + ").");
          noaccesso();
        }
        console.log("Utente corrente caricato con successo da " + (infoUtenteStorage ? infoUtenteStorage.tipoStorage : "sconosciuto") + ":", JSON.parse(JSON.stringify(utenteCorrente)));
      } catch (e) {
        console.error("ERRORE INIZIALE: Errore nel parsing dell'utente (da " + (infoUtenteStorage ? infoUtenteStorage.tipoStorage : "sconosciuto") + "). Dati corrotti?", e);
        noaccesso();
      }
    } else {
      console.log("INFO INIZIALE: Nessun 'utenteAccesso' trovato in localStorage o sessionStorage. Utente non loggato.");
      noaccesso();
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
                console.log("Quiz completato! Tentativo di salvataggio...");

                let utenteStringaDaStorage = localStorage.getItem("utenteAccesso");
                let utenteDatiParsati = null;


                if (!utenteStringaDaStorage || utenteStringaDaStorage === "null") {
                  console.error("ERRORE if(finito): 'utenteAccesso' non trovato o è 'null' in localStorage.");

                  alert("Errore: sessione utente non valida. Prova a fare login di nuovo.");
                  window.location.href = "/login.html";
                  return;
                }
                try {
                  utenteDatiParsati = JSON.parse(utenteStringaDaStorage);
                } catch (e) {
                  console.error("ERRORE if(finito): Errore parsing 'utenteAccesso'.", e);
                  alert("Errore: dati sessione corrotti. Prova a fare login di nuovo.");
                  localStorage.removeItem('utenteAccesso');
                  window.location.href = "/login.html";
                  return;
                }
                if (!utenteDatiParsati || !utenteDatiParsati.email) {
                  console.error("ERRORE if(finito): Dati utente parsati non validi o email mancante.");
                  alert("Errore: dati utente incompleti. Prova a fare login di nuovo.");
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

                console.log("DEBUG: 'utenteConQuiz' appena istanziato. Valore iniziale di utenteConQuiz.test:", JSON.parse(JSON.stringify(utenteConQuiz.test)));

                console.log("DEBUG: Oggetto 'quizz' (prima di essere aggiunto a utenteConQuiz.test):", JSON.parse(JSON.stringify(quizz)));


                utenteConQuiz.test.push(quizz);


                console.log("DEBUG: Contenuto di 'utenteConQuiz.test' DOPO .push(quizz):", JSON.parse(JSON.stringify(utenteConQuiz.test)));
                console.log("DEBUG: Lunghezza di 'utenteConQuiz.test' DOPO .push(quizz):", utenteConQuiz.test ? utenteConQuiz.test.length : "non definito o null");
                if (utenteConQuiz.test && utenteConQuiz.test.length > 0 && utenteConQuiz.test[0] && utenteConQuiz.test[0].domande) {
                  console.log("DEBUG: Numero domande nel primo quiz in utenteConQuiz.test[0]:", utenteConQuiz.test[0].domande.length);
                }
              }
            }


            localStorage.setItem("utenteAccesso", JSON.stringify(utenteConQuiz));
            console.log("Utente aggiornato con il nuovo quiz e salvato in localStorage:", JSON.parse(JSON.stringify(utenteConQuiz)));


            const emailPerSalvataggio = utenteConQuiz.email;
            const aggiornamentiDaInviare = {
              test: utenteConQuiz.test
            };

            
            console.log("DEBUG: 'aggiornamentiDaInviare' che verranno inviati al server:", JSON.parse(JSON.stringify(aggiornamentiDaInviare)));

          
            if (emailPerSalvataggio) {
              console.log("Invio dati aggiornati al server:", emailPerSalvataggio, aggiornamentiDaInviare);
              modificaDatiUtente(emailPerSalvataggio, aggiornamentiDaInviare);
            } else {
              console.error("ERRORE CRITICO if(finito): Email dell'utente non disponibile per il salvataggio sul server.");
              alert("Errore critico: impossibile identificare l'utente per il salvataggio sul server.");
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
  }
  )



