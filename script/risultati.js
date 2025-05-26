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
        for (let i = 0; i < utenti.length; i++) {
            if (utenti[i].test != null){
                let tests=[]
                for (let j = 0; j < utenti[i].test.length; j++) {
                    tests.push(new Test(utenti[i].test[j].domande));
                    tests[j].realizazzione = utenti[i].test[j].realizazzione;
                }
                utenti[i].test = tests;
            }
        }

    } catch (error) {
        console.error("Impossibile caricare il file utenti.json:", error);
        utenti = [];
    }
}
getutenti()