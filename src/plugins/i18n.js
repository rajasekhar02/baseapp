/**
Copyright (C) Eruvaka Technologies Pvt Ltd - All Rights Reserved * Unauthorized copying of this file, via any medium is strictly prohibited * Proprietary and confidential * 2021
**/
/**
File Name: i18n.js
Description: This file registers the vue-i18n plugin to the vuejs object and registers the all the locales to the vue-i18n configuration
*/
import Vue from "vue";
import VueI18n from "vue-i18n";
import enLocale from "element-ui/lib/locale/lang/en";
import esLocale from "element-ui/lib/locale/lang/es";
Vue.use(VueI18n);
function loadLocaleMessages() {
  const locales = require.context(
    "@/locales",
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i
  );
  const messages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  Object.assign(messages.en, enLocale);
  Object.assign(messages.es, esLocale);
  return messages;
}

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  messages: loadLocaleMessages(),
  silentTranslationWarn: ["PROD", "BETA"].includes(process.env.VUE_APP_STAGE),
  silentFallbackWarn: ["PROD", "BETA"].includes(process.env.VUE_APP_STAGE)
});
