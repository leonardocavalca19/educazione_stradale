let utenti = []
function displayMessage(message, type) {
            const messageArea = document.getElementById('messageArea');
            messageArea.innerHTML = '';

            const wrapper = document.createElement('div');
            wrapper.innerHTML = [
                `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
                `   <div>${message}</div>`,
                '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
                '</div>'
            ].join('');

            messageArea.append(wrapper);
        }
async function getutenti() {
    try {
        const response = await fetch("/json/utenti.json");
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }
        const datiJSON = await response.json();
        for(let i=0;i<datiJSON.length;i++){
            utenti.push(new Utente(datiJSON[i].nome,datiJSON[i].cognome,datiJSON[i].email,datiJSON[i].passwordHash,datiJSON[i].dataNascita,datiJSON[i].test))
        }

    } catch (error) {
        console.error("Impossibile caricare il file utenti.json:", error);
        utenti = [];
    }
}
async function inviaDatiNuovoUtenteAlServer(datiUtente) {
    try {
        const response = await fetch('/registra-utente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datiUtente),
        });
        const risultato = await response.json();
        if (!response.ok) {
            throw new Error(risultato.message || `Errore HTTP: ${response.status}`);
        }
        displayMessage(risultato.message || 'Utente registrato con successo!', risultato.type || 'success');
    } catch (error) {
        console.error('CLIENT: Errore durante l_invio dei dati utente:', error);
    }
}

getutenti()
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("registrazioneForm").addEventListener("submit", async function (event) {
        event.preventDefault()
        let nomecorretto = false
        let cognomecorretto = false
        let mailcorretta = false
        let password = false
        let password2 = false
        let datacorretta = false
        if (!new RegExp("^[a-zA-Z ]+$").test(document.getElementById("nomeInput").value)) {
            nomeInput.classList.add("is-invalid");
            nomeInput.classList.remove("is-valid")
            nomecorretto = false
        }
        else {
            nomeInput.classList.remove("is-invalid");
            nomeInput.classList.add("is-valid");
            nomecorretto = true
        }
        if (!new RegExp("^[a-zA-Z ]+$").test(document.getElementById("cognomeInput").value)) {
            cognomeInput.classList.add("is-invalid");
            cognomeInput.classList.remove("is-valid")
            cognomecorretto = false
        }
        else {
            cognomeInput.classList.remove("is-invalid");
            cognomeInput.classList.add("is-valid");
            cognomecorretto = true
        }
        if (!document.getElementById("emailRegistrazioneInput").checkValidity()) {
            emailRegistrazioneInput.classList.add("is-invalid");
            emailRegistrazioneInput.classList.remove("is-valid")
            mailcorretta = false
        }
        else {
            emailRegistrazioneInput.classList.remove("is-invalid");
            emailRegistrazioneInput.classList.add("is-valid");
            mailcorretta = true
        }
        if (!new RegExp("[ -~]{8}").test(document.getElementById("passwordRegistrazioneInput").value) || !document.getElementById("passwordRegistrazioneInput").checkValidity()) {
            passwordRegistrazioneInput.classList.add("is-invalid");
            passwordRegistrazioneInput.classList.remove("is-valid")
            password = false
        }
        else {
            passwordRegistrazioneInput.classList.remove("is-invalid");
            passwordRegistrazioneInput.classList.add("is-valid");
            password = true
        }
        if (!(document.getElementById("confermaPasswordInput").value === document.getElementById("passwordRegistrazioneInput").value && new RegExp("[ -~]{8}").test(document.getElementById("passwordRegistrazioneInput").value))) {
            confermaPasswordInput.classList.add("is-invalid");
            confermaPasswordInput.classList.remove("is-valid")
            password2 = false
        }
        else {
            confermaPasswordInput.classList.remove("is-invalid");
            confermaPasswordInput.classList.add("is-valid");
            password2 = true
        }
        if (document.getElementById("dataNascitaInput").value == "" || new Date(document.getElementById("dataNascitaInput").value) > new Date()) {
            dataNascitaInput.classList.add("is-invalid");
            dataNascitaInput.classList.remove("is-valid")
            datacorretta = false
        }
        else {
            dataNascitaInput.classList.remove("is-invalid");
            dataNascitaInput.classList.add("is-valid");
            datacorretta = true
        }
        if (!document.getElementById("terminiCheck").checked) {
            terminiCheck.classList.add("is-invalid");
            terminiCheck.classList.remove("is-valid")
        }
        else {
            terminiCheck.classList.remove("is-invalid");
            terminiCheck.classList.add("is-valid");
        }
        if (nomecorretto && cognomecorretto && mailcorretta && password && password2 && datacorretta && document.getElementById("terminiCheck").checked) {
            let nuovoutente = new Utente(document.getElementById("nomeInput").value, document.getElementById("cognomeInput").value, document.getElementById("emailRegistrazioneInput").value, document.getElementById("passwordRegistrazioneInput").value, new Date(document.getElementById("dataNascitaInput").value),[])
            let contenuto = false
            for (let i = 0; i < utenti.length - 1; i++) {
                if (JSON.stringify(nuovoutente) == JSON.stringify(utenti[i])) {
                    contenuto = true
                    break
                }
            }
            if (!contenuto) {
                utenti.push(nuovoutente)
                await inviaDatiNuovoUtenteAlServer(nuovoutente)
            }

        }
    })
})