let accesso = localStorage.getItem('utenteAccesso')
let utenteCorrente=null
function noaccesso() {
  localStorage.removeItem('utenteAccesso');
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
    let bottone = document.createElement("button")
    bottone.textContent = j + 1
    bottone.addEventListener("click", function () {
      i = j
    })
    aggiornadomanda(j)
    bottoni.push(bottone)
    document.getElementById("navigazione").appendChild(bottone)
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
  if (i < domande.length - 1) {
    aggiornadomanda(i);
  }
  for (let s = 0; s < document.getElementsByClassName("bottoni").length; s++) {
    document.getElementsByClassName("bottoni")[s].addEventListener("click", function () {
      if (i < domande.length) {
        if (domande[i].controllagiusta(this.value === "true")) {
          domande[i].risultato = true;
        }
        else {
          domande[i].risultato = false;
        }
        bottoni[i].style.backgroundColor = "#7CFC00"
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
            let utente = localStorage.getItem("utenteAccesso")
            try {
              utente = JSON.parse(utente)
            }
            catch {

            }
            let local=JSON.parse(localStorage.getItem("utenteAccesso"))
            utenteCorrente=new Utente(local.nome,local.cognome,local.email,local.password,local.data_nascita,[])
            utenteCorrente.test.push(quizz)
            utenteCorrente=JSON.parse(utenteCorrente)
            localStorage.setItem("utenteAccesso", JSON.stringify(utenteCorrente))
            const emailUtente = utenteCorrente ? utenteCorrente.email : null;

            if (emailUtente) {
              fetch('http://localhost:3000/modifica-utente', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  emailDaModificare: emailUtente,
                  aggiornamenti: {
                    nuovoQuizCompletato: quizz
                  }
                })
              })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`Errore HTTP! Status: ${response.status}`);
                  }
                  return response.json();
                })
                .then(data => {
                  console.log('Statistiche utente aggiornate sul server:', data);

                  if (data.utente) {
                    localStorage.setItem('utenteAccesso', JSON.stringify(data.utente));
                  }
                  window.location.href = "/risultati.html";
                })
                .catch(error => {
                  console.error('Errore durante l\'aggiornamento delle statistiche utente:', error);
                  alert('Errore nel salvataggio dei risultati. Riprova più tardi.');
                  window.location.href = "/risultati.html";
                });
            }
          }

        }

      }


    })
  }
  function noaccesso() {
    localStorage.removeItem('utenteAccesso');
    window.location.href = "/login.html"
  }
  document.getElementById("quizlink").addEventListener("click", function (event) {
    event.preventDefault()
    if (localStorage.getItem('utenteAccesso') == null) {
      noaccesso()
    }
    else {
      window.location.href = "/quiz.html"
    }
  })
}





