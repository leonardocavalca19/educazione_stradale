document.addEventListener("DOMContentLoaded", function () {
    //Script per navbar
    function getInfoUtenteLoggatoPerNavbar() {
        if (localStorage.getItem('utenteAccesso')) {
            return localStorage.getItem('utenteAccesso');
        }
        return sessionStorage.getItem('utenteAccesso'); // Restituisce la stringa dati o null
    }

    function noaccessoNavbar() { // Funzione specifica per questo contesto
        localStorage.removeItem('utenteAccesso');
        sessionStorage.removeItem('utenteAccesso');
        window.location.href = "/login.html";
    }
    let open = false;
    document.getElementById("menu-toggle").addEventListener("click", function () {
        if (!open) {
            document.getElementById("nav-content").style.display = "block";
            open = true;
            document.getElementById("nav-content").style.transition = "width 0.5s ease-in-out";
        }
        else {
            document.getElementById("nav-content").style.display = "none";
            open = false;
        }
    });

    /**
     * Quando la navbar torna fissa in alto il contenuto si nasconde
     * questa funzione è fatta per riaggiornare la navbar in modo da risolvere il problema
     */
    let dimensionePrecedente = window.innerWidth;
    window.addEventListener("resize", function () {
        const dimensioneCorrente = window.innerWidth;

        if (dimensionePrecedente < 1024 && dimensioneCorrente >= 1024) {
            document.getElementById("nav-content").style.display = "block";
        }
    });
    open = false;
})