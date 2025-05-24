
(function() { 

   
    function getUtenteSalvato() {
        let datiUtenteString = localStorage.getItem('utenteAccesso');
        let storageType = 'localStorage';
        if (!datiUtenteString) {
            datiUtenteString = sessionStorage.getItem('utenteAccesso');
            storageType = 'sessionStorage';
        }
        if (datiUtenteString) {
            return { dati: datiUtenteString, tipoStorage: storageType };
        }
        return null;
    }

    let infoUtenteStorage = getUtenteSalvato();
    let accesso = infoUtenteStorage ? infoUtenteStorage.dati : null;
    let utenteCorrente = null; 

    function noaccesso(messaggioLog = "Accesso negato o utente non valido.") {
        console.error(messaggioLog + " Reindirizzamento a login.html.");
        localStorage.removeItem('utenteAccesso');
        sessionStorage.removeItem('utenteAccesso');
        window.location.href = "/login.html"; 
        throw new Error(messaggioLog + " Reindirizzamento in corso."); 
    }

    if (accesso) {
        try {
            utenteCorrente = JSON.parse(accesso);
            if (!utenteCorrente || !utenteCorrente.email) { 
                noaccesso("Oggetto utente in storage non valido o email mancante.");
            }

            console.log("Utente corrente caricato da " + infoUtenteStorage.tipoStorage + ":", JSON.parse(JSON.stringify(utenteCorrente)));
        } catch (e) {
            noaccesso("Errore nel parsing dell'utente da " + (infoUtenteStorage ? infoUtenteStorage.tipoStorage : "storage") + ". Dati corrotti?");
        }
    } else {
        noaccesso("Nessun 'utenteAccesso' trovato in localStorage o sessionStorage.");
    }


    if (typeof Quizz === 'undefined' || typeof Domanda === 'undefined' || typeof Utente === 'undefined') {
        console.error("Le classi Quizz, Domanda o Utente non sono definite. Assicurati che libreriaclassi.js sia caricato prima di quiz.js.");
        alert("Errore critico: impossibile caricare le componenti del quiz. Contatta l'assistenza.");
        return; 
    }

    let quizz = new Quizz();

   
    function creaquiz() {
        if (!document.getElementById("navigazione") || !document.getElementById("resettaLinguaBtn") ||
            !document.getElementById("logoutBtn") || !document.getElementById("testo") ||
            !document.getElementById("immagine") || !document.getElementById("numero-domanda") ||
            document.getElementsByClassName("bottoni").length === 0) {
            console.error("Elementi HTML necessari per il quiz non trovati. Verifica l'HTML.");
            alert("Errore nell'inizializzazione dell'interfaccia quiz.");
            return;
        }
        
        document.getElementById("navigazione").addEventListener('wheel', function(event) {
            event.preventDefault();
            this.scrollLeft += event.deltaY;
        });

        document.getElementById("resettaLinguaBtn").addEventListener("click", function() {
            document.cookie = "googtrans=/it/it; path=/; SameSite=Lax";
            window.location.reload();
        });

        document.getElementById("logoutBtn").addEventListener("click", function() {
            noaccesso("Logout effettuato dall'utente.");
        });

        const domande = quizz.domande;
        if (!domande || domande.length === 0) {
            console.error("Nessuna domanda caricata nel quiz.");
            document.getElementById("testo").textContent = "Errore: nessuna domanda caricata. Riprova o contatta l'assistenza.";
            return;
        }

        let indiceDomandaCorrente = 0;
        const bottoniNavigazione = [];

        const navContainer = document.getElementById("navigazione");
        navContainer.innerHTML = ''; 
        for (let j = 0; j < domande.length; j++) {
            let bottone = document.createElement("button");
            bottone.textContent = j + 1;
            bottone.dataset.indice = j; 
            bottone.addEventListener("click", function() {
                indiceDomandaCorrente = parseInt(this.dataset.indice);
                aggiornaMostraDomanda();
            });
            bottoniNavigazione.push(bottone);
            navContainer.appendChild(bottone);
        }
        
       
        let altezzaMassimaTesto = 0;
        const testoDomandaEl = document.getElementById("testo");
        domande.forEach(d => {
            testoDomandaEl.textContent = d.testo;
            if (testoDomandaEl.scrollHeight > altezzaMassimaTesto) {
                altezzaMassimaTesto = testoDomandaEl.scrollHeight;
            }
        });
        if (altezzaMassimaTesto > 0) {
            testoDomandaEl.style.minHeight = altezzaMassimaTesto + "px";
        }


        function aggiornaMostraDomanda() {
            if (indiceDomandaCorrente < 0 || indiceDomandaCorrente >= domande.length) return;

            const domandaAttuale = domande[indiceDomandaCorrente];
            testoDomandaEl.textContent = domandaAttuale.testo;
            document.getElementById("numero-domanda").textContent = indiceDomandaCorrente + 1;

            const imgEl = document.getElementById("immagine");
            if (domandaAttuale.img) {
                imgEl.src = domandaAttuale.img;
                imgEl.style.display = "block";
            } else {
                imgEl.style.display = "none";
            }

            bottoniNavigazione.forEach((btn, idx) => {
                btn.classList.toggle('active', idx === indiceDomandaCorrente);

                if (domande[idx].risultato !== null) {
                     btn.style.backgroundColor = domande[idx].risultato === true ? "#7CFC00" : "#FF6347";
                } else {
                    btn.style.backgroundColor = "";
                }
            });


            const bottoniRisposta = document.getElementsByClassName("bottoni");
            for (let btn of bottoniRisposta) {
                btn.disabled = (domandaAttuale.risultato !== null);
            }
        }

        const bottoniRisposta = document.getElementsByClassName("bottoni");
        for (let btn of bottoniRisposta) {
            btn.addEventListener("click", function() {
                if (domande[indiceDomandaCorrente].risultato !== null) return;

                const rispostaDataEParsata = (this.value === "true");
                domande[indiceDomandaCorrente].controllagiusta(rispostaDataEParsata); 

                aggiornaMostraDomanda(); 
                if (indiceDomandaCorrente < domande.length - 1) {

                    let prossimaNonRisposta = -1;
                    for (let k = indiceDomandaCorrente + 1; k < domande.length; k++) {
                        if (domande[k].risultato === null) {
                            prossimaNonRisposta = k;
                            break;
                        }
                    }
                    if (prossimaNonRisposta !== -1) {
                         indiceDomandaCorrente = prossimaNonRisposta;
                    } else {
                        for (let k = 0; k < indiceDomandaCorrente; k++) {
                             if (domande[k].risultato === null) {
                                prossimaNonRisposta = k;
                                break;
                            }
                        }
                        if(prossimaNonRisposta !== -1) indiceDomandaCorrente = prossimaNonRisposta;
                        else indiceDomandaCorrente++; 
                    }
                    
                    if(indiceDomandaCorrente < domande.length) aggiornaMostraDomanda();
                    else controllaSeFinito();

                } else {
                    controllaSeFinito();
                }
            });
        }
        
        function controllaSeFinito() {
            let tutteRisposte = true;
            for (let j = 0; j < domande.length; j++) {
                if (domande[j].risultato === null) {
                    tutteRisposte = false;
                    indiceDomandaCorrente = j;
                    aggiornaMostraDomanda();
                    alert("Per favore, rispondi a tutte le domande per completare il quiz.");
                    break;
                }
            }

            if (tutteRisposte) {
                console.log("QUIZ COMPLETATO! Tutte le domande hanno una risposta.");
                let utentePerSalvataggio = new Utente(
                    utenteCorrente.nome,
                    utenteCorrente.cognome,
                    utenteCorrente.email,
                    null, 
                    utenteCorrente.data_nascita, 
                    utenteCorrente.test || [] 
                );


                utentePerSalvataggio.test.push(quizz);
                try {
                    localStorage.setItem("utenteAccesso", JSON.stringify(utentePerSalvataggio));
                    console.log("Utente aggiornato con il nuovo quiz e salvato in localStorage:", JSON.parse(JSON.stringify(utentePerSalvataggio)));
                   
                } catch (e) {
                    console.error("Errore durante il salvataggio dell'utente aggiornato in localStorage:", e);
                    alert("Si è verificato un errore nel salvataggio locale dei tuoi progressi.");
                }

                const emailPerServer = utentePerSalvataggio.email;
                const aggiornamentiDaInviare = {
                   
                    test: utentePerSalvataggio.test
                 
                };

                console.log("Payload pronto per il server:", JSON.parse(JSON.stringify(aggiornamentiDaInviare)));

                if (emailPerServer) {
                    modificaDatiUtente(emailPerServer, aggiornamentiDaInviare);
                } else {
                    console.error("ERRORE CRITICO: Email utente non disponibile per il salvataggio sul server.");
                    alert("Impossibile salvare i risultati sul server: utente non riconosciuto.");
                }

                alert("Quiz completato e risultati salvati! Puoi rivedere le risposte o tornare alla home.");

                const bottoniRispostaFine = document.getElementsByClassName("bottoni");
                for (let btn of bottoniRispostaFine) { btn.disabled = true; }
            }
        }

        if (domande.length > 0) {
            aggiornaMostraDomanda();
        }
    }

    async function modificaDatiUtente(email, updates) {
        console.log(`Tentativo di inviare aggiornamenti per ${email} al server:`, updates);
        try {
            const response = await fetch('/modifica-utente', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailDaModificare: email,
                    aggiornamenti: updates
                })
            });


            const responseData = await response.json().catch(() => ({ message: "Risposta non JSON o vuota dal server", status: response.status }));

            if (response.ok) {
                console.log('SUCCESS: Utente aggiornato con successo sul server.', responseData);

            } else {
                console.error(`ERRORE dal server (${response.status}): ${responseData.message || 'Errore sconosciuto.'}`);
                alert(`Errore nel salvataggio dei risultati sul server: ${responseData.message || 'Riprova più tardi.'}`);
            }
        } catch (error) {

            console.error("ERRORE FETCH: Impossibile inviare la richiesta di modifica dati utente:", error.message, error);
            alert("Impossibile comunicare con il server per salvare i risultati. Controlla la tua connessione o riprova più tardi. Dettagli: " + error.message);
        }
    }
    quizz.caricaDomande();

})(); 