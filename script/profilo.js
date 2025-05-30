function noaccesso() {
    localStorage.removeItem('utenteAccesso');
    sessionStorage.removeItem('utenteAccesso');
    window.location.href = "/login.html"
}
avvia()
async function avvia() {
    await getutenti()
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
    document.addEventListener('DOMContentLoaded', function () {
        const userInfoNome = document.getElementById('userInfoNome');
        const userInfoCognome = document.getElementById('userInfoCognome');
        const userInfoEmail = document.getElementById('userInfoEmail');
        const userInfoDataNascita = document.getElementById('userInfoDataNascita');
        const testHistoryContainer = document.getElementById('testHistoryContainer');


        if (accesso) {
            try {

                userInfoNome.textContent = accesso.nome || 'N/D';
                userInfoCognome.textContent = accesso.cognome || 'N/D';
                userInfoEmail.textContent = accesso.email || 'N/D';
                userInfoDataNascita.textContent = accesso.data_nascita ? new Date(accesso.data_nascita).toLocaleDateString('it-IT') : 'N/D';

                if (accesso.test && accesso.test.length > 0) {
                    testHistoryContainer.innerHTML = '';
                    accesso.test.forEach((quizRecord, index) => {
                        if (!quizRecord || !quizRecord.domande) {
                            console.warn('Record test non valido:', quizRecord);
                            return;
                        }

                        let domandeCorrette = 0;
                        const domandeTotali = quizRecord.domande.length;
                        const domandeErrateRecord = [];

                        quizRecord.domande.forEach(domanda => {
                            if (domanda.risposta === domanda.corretta) {
                                domandeCorrette++;
                            } else {
                                domandeErrateRecord.push(domanda);
                            }
                        });

                        const card = document.createElement('div');
                        card.className = 'card mb-3';

                        let dataTestHtml = 'Data non disponibile';
                        if (quizRecord.realizazzione) {
                            try {
                                dataTestHtml = new Date(quizRecord.realizazzione).toLocaleDateString('it-IT', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                            } catch (e) {
                                console.warn("Data test non valida: ", quizRecord.realizazzione);
                            }
                        }

                        let listaDomandeErrateHtml = '<p>Nessuna domanda errata.</p>';
                        if (domandeErrateRecord.length > 0) {
                            listaDomandeErrateHtml = '<h6>Domande errate:</h6><ul class="list-unstyled">';
                            domandeErrateRecord.forEach(d => {
                                listaDomandeErrateHtml += `<li class="incorrect-question">- ${d.testo} (Risposta data: ${d.risposta === null || d.risposta === undefined ? 'Non data' : (d.risposta ? 'Vero' : 'Falso')}, Corretta: ${d.corretta ? 'Vero' : 'Falso'})</li>`;
                            });
                            listaDomandeErrateHtml += '</ul>';
                        }

                        card.innerHTML = `
                                <div class="card-header">
                                    Test #${index + 1} - Sostenuto il: ${dataTestHtml}
                                </div>
                                <div class="card-body">
                                    <p><strong>Punteggio:</strong> ${domandeCorrette} / ${domandeTotali}</p>
                                    ${listaDomandeErrateHtml}
                                </div>
                            `;
                        testHistoryContainer.appendChild(card);
                    });
                } else {
                    testHistoryContainer.innerHTML = '<p>Nessun test sostenuto finora.</p>';
                }
            } catch (error) {
                console.error("Errore nel parsing dei dati utente:", error);
                userInfoNome.textContent = 'Errore nel caricamento dei dati.';
                testHistoryContainer.innerHTML = '<p>Impossibile caricare lo storico dei test.</p>';
            }
        } else {

            document.body.innerHTML = '<div class="container alert alert-danger mt-5" role="alert">Utente non autenticato o dati non disponibili. Effettua il <a href="login.html">login</a>.</div>';
            noaccesso()
            window.location.href = 'login.html';
        }

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
        const bottoni = document.querySelectorAll('.revisione');
        const arrayDiBottoni = Array.from(bottoni);
        const indice=0
        bottoni.forEach(bottone => {
            bottone.addEventListener('click', function (event) {
                const bottoneCliccato = event.currentTarget;
                indice = arrayDiBottoni.indexOf(bottoneCliccato);
            });
        });
        inizializza(indice)
        window.location.href = "/risultati.html"
    });
}