function googleTranslateElementInit()
{
    new google.translate.TranslateElement({
        pageLanguage: 'it',
        includedLanguages: 'en,fr,de,es,ru,zh-CN',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
};