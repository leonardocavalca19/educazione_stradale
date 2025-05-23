let utenti = []
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
getutenti()
let accesso
if (sessionStorage.getItem('utenteAccesso') == null) {
  accesso = localStorage.getItem('utenteAccesso')
}
else {
  accesso = sessionStorage.getItem('utenteAccesso')
}
let utenteCorrente = null
function noaccesso() {
  window.location.href = "/login.html"
}
if (accesso) {
  try {
    utenteCorrente = JSON.parse(accesso);
  } catch (e) {
    console.error("Errore nel parsing dell'utente da localStorage:", e);
    noaccesso();
  }
} else {
  noaccesso();
}
let quizz
quizz = new Quizz();
quizz.caricaDomande();
function creaquiz() {
  function scrollNavigazioneVersoBottoneAttivo(indiceBottoneAttivo) {
    const containerNavigazione = document.getElementById("navigazione");

    if (!bottoni || bottoni.length === 0) return;

    const bottoneAttivo = bottoni[indiceBottoneAttivo];

    if (containerNavigazione && bottoneAttivo) {
      const containerLarghezza = containerNavigazione.clientWidth;
      const bottoneOffsetLeft = bottoneAttivo.offsetLeft;
      const bottoneLarghezza = bottoneAttivo.offsetWidth;
      let destinazioneScroll = bottoneOffsetLeft - (containerLarghezza / 2) + (bottoneLarghezza / 2);

      destinazioneScroll = Math.max(0, destinazioneScroll);
      destinazioneScroll = Math.min(destinazioneScroll, containerNavigazione.scrollWidth - containerLarghezza);
      containerNavigazione.scrollTo({
        left: destinazioneScroll,
        behavior: 'smooth'
      });
    }
  }
  document.getElementById("navigazione").addEventListener('wheel', function (event) {
    event.preventDefault();
    const scrollAmount = event.deltaY;
    document.getElementById("navigazione").scrollLeft += scrollAmount;
  });
  document.getElementById("resettaLinguaBtn").addEventListener("click", function () {
    document.cookie = "googtrans=/it/it; path=/; SameSite=Lax";
    window.location.reload();
  })
  document.getElementById("logoutBtn").addEventListener("click", function () {
    noaccesso()
    window.location.href = "/login.html";
  })
  let domande = quizz.domande;
  let max = 0;
  let bottoni = []
  let i = 0;

  for (let j = 0; j < domande.length; j++) {
    let bottone = document.createElement("button");
    bottone.textContent = j + 1;

    bottone.classList.add("btn");
    bottone.classList.add("btn-outline-secondary");

    bottone.addEventListener("click", function () {
      for (let a = 0; a < bottoni.length; a++) {
        if (domande[a].risultato == null) {
          bottoni[a].style.color = "#6c757d"
        }
        else {
          if (bottoni[a].classList.contains("btn-primary")) {
            bottoni[a].classList.remove("btn-primary");
          }
          bottoni[a].classList.add("btn-success");
        }
      }
      const bottoneAttivoPrecedente = document.querySelector('#navigazione button.btn-primary');
      if (bottoneAttivoPrecedente && bottoneAttivoPrecedente !== this) {
        bottoneAttivoPrecedente.classList.remove("btn-primary");
      }

      i = j;
      aggiornadomanda(i);



    });

    bottoni.push(bottone);
    document.getElementById("navigazione").appendChild(bottone);
  }


  if (bottoni.length > 0 && bottoni[0].style.backgroundColor !== "rgb(124, 252, 0)") {
    bottoni[0].classList.remove("btn-outline-secondary");
    bottoni[0].classList.add("btn-primary");
  }

  for (let i = 0; i < domande.length; i++) {
    altezza = parseFloat(window.getComputedStyle(document.getElementById("testo")).getPropertyValue("height"))
    document.getElementById("testo").textContent = domande[i].testo;
    if (altezza > max) {
      max = altezza;
    }
  }
  document.getElementById("testo").style.height = max + "px";


  function aggiornadomanda(n) {
    if (n < domande.length) {
      scrollNavigazioneVersoBottoneAttivo(n);
      if (!bottoni[n].classList.contains("btn-success")) {
        bottoni[n].classList.add("btn-primary");
        bottoni[n].style.color = "white"
      }
      else {
        bottoni[n].classList.add("btn-primary");
        bottoni[n].classList.remove("btn-success")
      }
      document.getElementById("testo").textContent = domande[n].testo;
      if (domande[n].img !== null) {
        document.getElementById("immagine").src = domande[n].img;
        document.getElementById("immagine").style.display = "";
      }
      else {
        document.getElementById("immagine").style.display = "none";
      }
      document.getElementById("numero-domanda").textContent = n + 1;
      return n
    }

  }

  aggiornadomanda(i);
  for (let s = 0; s < document.getElementsByClassName("bottoni").length; s++) {
    document.getElementsByClassName("bottoni")[s].addEventListener("click", function () {
      if (i < domande.length) {
        if (domande[i].controllagiusta(this.value === "true")) {
          domande[i].risultato = true;
        }
        else {
          domande[i].risultato = false;
        }
        bottoni[i].classList.add("btn");
        bottoni[i].classList.add("btn-success");
        bottoni[i].style.color = "white"
        let esci = true
        for (let a = 0; a < domande.length; a++) {
          for (let j = 0; j < domande.length; j++) {
            if (domande[j].risultato == null) {
              esci = false
            }
          }
        }
        if (!esci) {
          i += 1;
          aggiornadomanda(i);
        }
        else {
          for (let i = 0; i < utenti.length; i++) {
            if (JSON.parse(JSON.stringify(utenti[i])).email === JSON.parse(accesso).email) {
              utenteCorrente = utenti[i]
            }
          }
          quizz.domande=domande
          utenteCorrente.test.push(quizz)
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
          quizz.realizazzione=new Date()
          const aggiornamentiPayload = {
            nuovoQuizCompletato: quizz
          };
          async function modificaDatiUtente(emailAttuale, aggiornamenti) {
            const url = '/modifica-utente';

            const payloadDaInviare = {
              emailDaModificare: emailAttuale,
              aggiornamenti: aggiornamenti
            };
            try {
              const response = await fetch(url, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadDaInviare)
              });

              const responseData = await response.json();

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
          modificaDatiUtente(emailUtente, aggiornamentiPayload)
          window.location.href="/risultati.html"

        }

      }


    })
  }
  function noaccesso() {
    localStorage.removeItem('utenteAccesso');
    window.location.href = "/login.html"
  }
}





