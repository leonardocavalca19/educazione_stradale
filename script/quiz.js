let accesso = localStorage.getItem('utenteAccesso')
function noaccesso() {
  localStorage.removeItem('utenteAccesso');
  window.location.href = "/login.html"
}
let quizz
quizz = new Quizz();
quizz.caricaDomande();
function creaquiz() {
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
  for (let i = 0; i < domande.length; i++) {
    altezza = parseFloat(window.getComputedStyle(document.getElementById("testo")).getPropertyValue("height"))
    document.getElementById("testo").textContent = domande[i].testo;
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
    }
    else {
      document.getElementById("immagine").style.display = "none";
    }
    document.getElementById("numero-domanda").textContent = n + 1;
  }
  if (i < domande.length - 1) {
    aggiornadomanda(i);
  }
  for (let s = 0; s < document.getElementsByClassName("bottoni").length; s++) {
    document.getElementsByClassName("bottoni")[s].addEventListener("click", function () {
      if (i < domande.length - 1) {
        if (domande[i].corretta == (this.value === "true")) {
          domande[i].risultato = true;
        }
        else {
          domande[i].risultato = false;
        }
        i += 1;
        aggiornadomanda(i);

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





