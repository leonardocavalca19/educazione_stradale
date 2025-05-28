document.addEventListener('DOMContentLoaded', function () {
    const userInfoNome = document.getElementById('userInfoNome');
    const userInfoCognome = document.getElementById('userInfoCognome');
    const userInfoEmail = document.getElementById('userInfoEmail');
    const userInfoDataNascita = document.getElementById('userInfoDataNascita');
    const testHistoryContainer = document.getElementById('testHistoryContainer');

    const datiSalvati = getUtenteSalvato();

    if (datiSalvati && datiSalvati.dati) {
        try {
            const utente = JSON.parse(datiSalvati.dati);

            userInfoNome.textContent = utente.nome || 'N/D';
            userInfoCognome.textContent = utente.cognome || 'N/D';
            userInfoEmail.textContent = utente.email || 'N/D';
            userInfoDataNascita.textContent = utente.data_nascita ? new Date(utente.data_nascita).toLocaleDateString('it-IT') : 'N/D';

            if (utente.test && utente.test.length > 0) {
                testHistoryContainer.innerHTML = '';
                utente.test.forEach((quizRecord, index) => {
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
        window.location.href = 'login.html';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('utenteAccesso');
            sessionStorage.removeItem('utenteAccesso');
            window.location.href = 'login.html';
        });
    }
    document.getElementById("profilo").addEventListener("click",function(){
        window.location.href="/profilo.html"
    })
});