"use strict";
import en from "./i18n/en_US";
import zh from "./i18n/zh_CN";
export default function translateConfig($translateProvider){
  $translateProvider.translations("en", en);
  $translateProvider.translations("zh", zh);
  $translateProvider.preferredLanguage("zh");
}
translateConfig.$inject = ["$translateProvider"];
