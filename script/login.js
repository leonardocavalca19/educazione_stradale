document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("emailInput").addEventListener("input", function () {
        if (document.getElementById("emailInput").checkValidity()) {
            document.getElementById("emailInput").style.borderColor = "green"
        }
        else {
            document.getElementById("emailInput").style.borderColor = "red"
        }
    })
    document.getElementById("passwordInput").addEventListener("input", function () {
        if (document.getElementById("passwordInput").checkValidity() && new RegExp("[ -~]{8}").test(document.getElementById("passwordInput").value)) {
            document.getElementById("passwordInput").style.borderColor = "green"
        }
        else {
            document.getElementById("passwordInput").style.borderColor = "red"
        }
    })
    function noaccesso() {
        localStorage.removeItem('utenteAccesso');
        window.location.href = "/login.html"
    }
    document.getElementById("quizlink").addEventListener("click", function (event) {
        event.preventDefault()
        if (localStorage.getItem('utenteAccesso') == null) {
            noaccesso()
        }
        else{
            window.location.href="/quiz.html"
        }
    })
    const bottoneAccedi = document.getElementById("accedi");
    if (bottoneAccedi) {
        bottoneAccedi.addEventListener("click", function (event) {
            event.preventDefault();
            if (document.getElementById("emailInput").checkValidity() && document.getElementById("passwordInput").checkValidity() && new RegExp("[ -~]{8}").test(document.getElementById("passwordInput").value)) {
                accesso = 1;
                if (document.getElementById("rememberMeCheck").checked) {
                    localStorage.setItem('utenteAccesso', accesso);
                }
                window.location.href = "/quiz.html";
            }
            else {
                document.getElementById("messaggioErrore").style.display = ""

            }

        });
    } else {
        console.warn("Pulsante con id='accedi' non trovato in login.html.");
    }
})
