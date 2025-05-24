let accesso = localStorage.getItem('utenteAccesso');
let utenteCorrente = null;

function noaccesso() {
  localStorage.removeItem('utenteAccesso');
  window.location.href = "/login.html";
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

let quizz;
quizz = new Quizz();
quizz.caricaDomande();

const emailUtente = utenteCorrente ? utenteCorrente.email : null;
const aggiornamentiDaInviare = {
  test: utenteCorrente.test
};

async function modificaDatiUtente(emailAttuale, updates) {
  const url = '/modifica-utente'; 

  const payload = { 
    emailDaModificare: emailAttuale, 
    aggiornamenti: updates 
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
      console.log('Dati utente aggiornati sul server:', responseData); 
    } else {
      console.error('Errore dal server durante la modifica:', responseData); 
    }
  } catch (error) {
    console.error("Errore durante l'invio della richiesta di modifica:", error); 
  }
}

if (emailUtente) {
  modificaDatiUtente(emailUtente, aggiornamentiDaInviare); //
} else {
  console.error("Email utente non disponibile, impossibile aggiornare i dati.");
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
  let bottoni = [];
  for (let j = 0; j < domande.length; j++) {
    let bottone = document.createElement("button");
    bottone.textContent = j + 1;
    bottone.dataset.domandaIndex = j;

    bottone.classList.add("btn", "btn-outline-secondary", "btn-sm", "me-2"); // Aggiungi classi qui

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

  let i = 0;

  function aggiornadomanda(n) {
    document.getElementById("testo").textContent = domande[n].testo;
    if (domande[n].img !== null) {
      document.getElementById("immagine").src = domande[n].img;
      document.getElementById("immagine").style.display = "";
    } else {
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
      currentButton.classList.remove('btn-outline-secondary', 'btn-success-custom'); // Rimuovi anche custom per l'active
      currentButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }
  aggiornadomanda(i);



  for (let s = 0; s < document.getElementsByClassName("bottoni").length; s++) {
    document.getElementsByClassName("bottoni")[s].addEventListener("click", async function () { // Aggiungi 'async' qui
      if (i < domande.length) {
        if (domande[i].controllagiusta(this.value === "true")) {
          domande[i].risultato = true;
        } else {
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
        } else {

          let finito = true;
          for (let j = 0; j < domande.length; j++) {
            if (domande[j].risultato === null) {
              finito = false;
              break;
            }
          }

          if (finito) {
            quizz.realizazzione = new Date().toISOString();


            const aggiornamentiUtente = {
              nuovoQuizCompletato: quizz
            };

            if (utenteCorrente && utenteCorrente.email) {
              const result = await modificaDatiUtente(utenteCorrente.email, aggiornamentiUtente);

              if (result.success) {
                console.log("Quiz completato e statistiche salvate con successo!");
                window.location.href = "/risultati.html";
              } else {
                console.error("Errore nel salvataggio delle statistiche:", result.message);
                alert("Errore nel salvataggio dei risultati. Riprova più tardi.");
                window.location.href = "/risultati.html";
              }
            } else {
              console.warn("Utente non loggato o email non disponibile. Non posso salvare il quiz.");
              window.location.href = "/risultati.html";
            }
          }
        }
      }
    });
  }


  document.getElementById("quizlink").addEventListener("click", function (event) {
    event.preventDefault();
    if (localStorage.getItem('utenteAccesso') == null) {
      noaccesso();
    } else {
      window.location.href = "/quiz.html";
    }
  });
}