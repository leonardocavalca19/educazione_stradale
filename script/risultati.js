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
            if (utenti[i].test != null) {
                let tests = []
                for (let j = 0; j < utenti[i].test.length; j++) {
                    tests.push(new Quiz(utenti[i].test[j].domande));
                    tests[j].realizazzione = utenti[i].test[j].realizazzione;
                    let domande = []
                    for (let k = 0; k < tests[j].domande.length; k++) {
                        domande.push(new Domanda(tests[j].domande[k].testo, tests[j].domande[k].corretta, null));
                        domande[k].risposta = tests[j].domande[k].risposta;
                        if (tests[j].domande[k].img != null) {
                            domande[k].img = tests[j].domande[k].img;
                        }
                    }
                    tests[j].domande = domande;
                }
                utenti[i].test = tests;
            }
        }

    } catch (error) {
        console.error("Impossibile caricare il file utenti.json:", error);
        utenti = [];
    }
}
crea()
async function crea() {
    await getutenti()
    function noaccesso() {
        localStorage.removeItem('utenteAccesso');
        sessionStorage.removeItem('utenteAccesso');
        window.location.href = "/login.html"
    }
    let accesso
    if (sessionStorage.getItem('utenteAccesso') == null) {
        accesso = localStorage.getItem('utenteAccesso')
    }
    else if (sessionStorage.getItem('utenteAccesso') != null) {
        accesso = sessionStorage.getItem('utenteAccesso')
    }
    if (accesso) {
        try {
            for (let i = 0; i < utenti.length; i++) {
                if (utenti[i].email == JSON.parse(accesso).email) {
                    accesso = utenti[i]
                }
            }
        } catch (e) {
            console.error("Errore nel parsing dell'utente da localStorage:", e);
            noaccesso();
        }
    } else {
        noaccesso();
    }
    if (!accesso instanceof Utente){
        noaccesso()
    }
    function creaGraficoConfrontoPerDomandaErrata(canvasId, statisticheAltri) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas con ID ${canvasId} non trovato per il grafico.`);
            return;
        }
        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Altri Utenti'],
                datasets: [
                    {
                        label: 'Hanno Risposto "Vero"',
                        data: [statisticheAltri.conteggioVero],
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Hanno Risposto "Falso"',
                        data: [statisticheAltri.conteggioFalso],
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Numero di Risposte Date dagli Altri Utenti'
                        }
                    },
                    y: {
                        stacked: false
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribuzione Risposte Altri Utenti'
                    }
                }
            }
        });
    }
    document.addEventListener("DOMContentLoaded", function () {
        if (localStorage.getItem('utenteAccesso') != null) {
            document.getElementById("nome").textContent = "Ciao " + JSON.parse(localStorage.getItem('utenteAccesso')).nome + " " + JSON.parse(localStorage.getItem('utenteAccesso')).cognome
        }
        else if (sessionStorage.getItem('utenteAccesso') != null) {
            document.getElementById("nome").textContent = "Ciao " + JSON.parse(sessionStorage.getItem('utenteAccesso')).nome + " " + JSON.parse(sessionStorage.getItem('utenteAccesso')).cognome
        }
        document.getElementById("profilo").addEventListener("click", function () {
            window.location.href = "/profilo.html"
        })

        document.getElementById("logoutBtn").addEventListener("click", function () {
            noaccesso()
            window.location.href = "/login.html";
        })
        const quiz = accesso.test[accesso.test.length - 1]
        let errate = []
        let vero = 0
        let falso = 0
        for (let i = 0; i < quiz.domande.length; i++) {
            if (!quiz.domande[i].controllagiusta()) {
                errate.push(quiz.domande[i])
            }
        }
        let n=0
        if (errate.length <= 3) {
            document.getElementById("risposta").textContent = "Promosso! 🥳🥳"
            document.getElementById("divrisposta").style.backgroundColor = "green"
        }
        else {
            document.getElementById("risposta").textContent = "Bocciato 😓😓"
            document.getElementById("divrisposta").style.backgroundColor = "red"
        }
        function aggiorna(n) {
            if (n>0){
                if (document.getElementById("domandaPrecedenteRevisione").disabled){
                    document.getElementById("domandaPrecedenteRevisione").disabled=false
                }
            }
            if (n<errate.length){
                if (document.getElementById("domandaSuccessivaRevisione").disabled){
                    document.getElementById("domandaSuccessivaRevisione").disabled=false
                }
            }
            if (n==errate.length){
                document.getElementById("domandaSuccessivaRevisione").disabled=true
            }
            if (n==0){
                document.getElementById("domandaPrecedenteRevisione").disabled=true
            }
            for (let j = 0; j < utenti.length; j++) {
                if (utenti[j].test[utenti[j].test.length-1].domande.includes(quiz.domande[n])) {
                    if (utenti[j].test[utenti[j].test.length-1].domande[utenti[j].test[utenti[j].test.length-1].domande.findIndex(quiz.domande[n])].risposta == true && utenti[j] != accesso) {
                        vero++
                    }
                    else if (utenti[j].test[utenti[j].test.length-1].domande[utenti[j].test[utenti[j].test.length-1].domande.findIndex(quiz.domande[n])].risposta == false && utenti[j] != accesso) {
                        falso++
                    }
                }
            }
            if (window.myComparisonChart instanceof Chart) {
                window.myComparisonChart.destroy();
            }
            let statistche = {
                conteggioVero: vero,
                conteggioFalso: falso

            }
            creaGraficoConfrontoPerDomandaErrata("graficoConfrontoDomanda", statistche)
        }
        aggiorna(n)
        document.getElementById("domandaSuccessivaRevisione").addEventListener("click",function(){
            n+=1
            aggiorna(n)
        })
        document.getElementById("domandaPrecedenteRevisione").addEventListener("click",function(){
            n-=1
            aggiorna(n)
        })




    })
}
