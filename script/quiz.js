class Domanda {
  constructor(testo, corretta, img = null) {
    this.testo = testo;
    this.corretta = corretta;
    this.img = img;
  }
}
class Quizz {
  constructor(domande = []) {
    this.domande = domande;
    this.realizazzione = null;
  }
  scegliDomandeRandom(json, n) {
    let argomenti = Object.keys(json);

    while (this.domande.length < n) {
      let j = Math.floor(Math.random() * (argomenti.length));
      let argomento = json[argomenti[j]];
      let argomentidomandeArgomento = Object.keys(argomento);
      let i = Math.floor(Math.random() * (argomentidomandeArgomento.length));
      let domandeargomento = argomento[argomentidomandeArgomento[i]];
      let d = Math.floor(Math.random() * (domandeargomento.length));
      let domandaargomento = domandeargomento[d];
      let domanda = new Domanda(domandaargomento.q, domandaargomento.a, domandaargomento.img);
      this.domande.push(domanda);
    }
  }
  async caricaDomande() {
    try {
      const risposta = await fetch("/json/domande.json");
      if (!risposta.ok) {
        throw new Error(`Errore HTTP! Status: ${risposta.status}.`);
      }
      let json = await risposta.json();
      this.scegliDomandeRandom(json, 30);
      creaquiz();


    } catch (errore) {
      console.error("Impossibile caricare o processare il file JSON:", errore);
      if (this.quizContainer) {
        this.quizContainer.innerHTML = `<p>Errore nel caricamento delle domande: ${errore.message}. Controlla la console per i dettagli.</p>`;
      }
    }
  }
}
let quizz = new Quizz();
quizz.caricaDomande();
function creaquiz() {
  let domande = quizz.domande;
  let i=0;
  function aggiornadomanda(n) {
    document.getElementById("testo").textContent = domande[n].testo;
    if (domande[n].img!== null) {
      document.getElementById("immagine").src = domande[n].img;
      document.getElementById("immagine").style.display = "";
    }
    else {
      document.getElementById("immagine").style.display = "none";
    }
  }
  aggiornadomanda(i);
  for (let s=0;s<document.getElementsByClassName("bottoni").length; s++){
    document.getElementsByClassName("bottoni")[s].addEventListener("click",function(){
      i+=1;
      aggiornadomanda(i);
      document.getElementById("numero-domanda").textContent=i+1
      console.log(document.getElementsByClassName("bottoni")[s].textContent)
      console.log(domande[i].corretta)
      if(document.getElementsByClassName("bottoni")[s].textContent=="Vero" && domande[i].corretta=="true")
      {
        alert("giusto")
      }
      else if(document.getElementsByClassName("bottoni")[s].textContent=="Falso" && domande[i].corretta=="false")
      {
        alert("giusto")
      }
      })
  }
}





