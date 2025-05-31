document.addEventListener("DOMContentLoaded", function(){
    let utterance;
    const synth = window.speechSynthesis;

    document.getElementById("leggi").addEventListener("click", function(){
        if (synth.speaking) return;

        document.getElementById("leggi").innerText = "Playing";
        document.getElementById("leggi").disabled = true;

        const paragrafi = document.querySelectorAll(".read");                      //QUI METTE INSIEME IL VARIO TESTO, SE NON RIESCI A METTERE LA STESSA CLASSE/ID
                                                                                    //METTI SEMPLCIMENTE PIU' VARIBILI
        const testo = Array.from(paragrafi).map(p => p.textContent).join(". ");

        utterance = new SpeechSynthesisUtterance(testo);
        utterance.lang = 'it-IT';
        synth.speak(utterance);
    });

    document.getElementById("ferma").addEventListener("click", function(){
        document.getElementById("leggi").innerText = "Play";
        document.getElementById("leggi").disabled = false;
        if (synth.speaking) synth.cancel();
    });
    window.addEventListener('beforeunload', function (e) {
        if(synth.speaking) synth.cancel();
});
});