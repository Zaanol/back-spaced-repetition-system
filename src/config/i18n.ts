import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        backend: {
            loadPath: './src/locales/{{lng}}/{{ns}}.json',
        },
        fallbackLng: 'en',
        preload: ['en', 'ptbr'],
        saveMissing: true,
        ns: ['translation'],
        defaultNS: 'translation',
        keySeparator: false,
        detection: {
            order: ['header'],
            lookupHeader: 'Accept-Language',
            caches: false,
            checkWhitelist: true,
        },
        supportedLngs: ['en', 'ptbr'],
        load: 'languageOnly',
        lowerCaseLng: true
    });

export default i18next;