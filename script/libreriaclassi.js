class Utente {
  constructor(nome, cognome, email, password, data_nascita,test) {
    this.nome = nome;
    this.cognome = cognome;
    this.email = email;
    this.password = password;
    this.data_nascita = data_nascita;
    if (test!=null){
      this.test = test;
    }
    else{
      test=[]
    }
    
  }
  getdomandecorrette() {
    let domandeCorrette = []
    for (let i = 0; i < this.quiz.domande.length; i++) {
      if (this.quiz.domande[i].risultato == true) {
        domandeCorrette.push(this.quiz.domande[i]);
      }
    }
    return domandeCorrette;
  }
  getdomandeerrate() {
    let domandeErrate = []
    for (let i = 0; i < this.quiz.domande.length; i++) {
      if (this.quiz.domande[i].risultato == false) {
        domandeErrate.push(this.quiz.domande[i]);
      }
    }
    return domandeErrate;
  }
}
class Domanda {
  constructor(testo, corretta, img = null) {
    this.testo = testo;
    this.corretta = corretta;
    this.img = img;
    this.risultato = null;
  }
  controllagiusta(risposta){
    if (this.corretta == true) {
      this.risultato = true;
    }
    else {
      this.risultato = false;
    }
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