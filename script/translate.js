document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("resettaLinguaBtn").addEventListener("click", function () {
        document.cookie = "googtrans=/it/it; path=/; SameSite=Lax";
        window.location.reload();
    })
});

function googleTranslateElementInit()
{
    new google.translate.TranslateElement({
        pageLanguage: 'it',
        includedLanguages: 'en,fr,de,es,ru,zh-CN,ja,ar',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
};