let utenti = []
async function getutenti() {
    try {
        const response = await fetch("/json/utenti.json");
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }
        const datiJSON = await response.json();
        utenti = datiJSON;

    } catch (error) {
        console.error("Impossibile caricare il file utenti.json:", error);
        utenti = [];
    }
}
async function inviaListaAlServer(listaDaInviare) {
    try {
        const response = await fetch('/salva-lista-utenti', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(listaDaInviare),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Errore dal server: ${response.status} - ${errorData.message}`);
        }

        const risultato = await response.json();
        console.log('Risposta dal server:', risultato.message);
        alert('Dati registrati e lista inviata con successo!');
    } catch (error) {
        console.error('Errore durante l_invio della lista al server:', error);
        alert(`Errore durante l_invio dei dati: ${error.message}`);
    }
}
async function hashPasswordConSHA256(password) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    } catch (error) {
        console.error("Errore durante l'hashing della password:", error);
        throw error;
    }
}

async function gethashedpassword(password) {
    if (password) {
        try {
            const hashedPassword = await hashPasswordConSHA256(password);
            return hashedPassword

        } catch (error) {
            console.error("Impossibile procedere con la registrazione a causa di un errore di hashing.");
        }
    } else {
        console.log("La password è vuota.");
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
            let passwordcriptata = await gethashedpassword(document.getElementById("passwordRegistrazioneInput").value)
            utenti.push(new Utente(document.getElementById("nomeInput").value, document.getElementById("cognomeInput").value, document.getElementById("emailRegistrazioneInput").value, passwordcriptata, new Date(document.getElementById("dataNascitaInput").value)))
        }
    })
})