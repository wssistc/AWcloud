"use strict";
import { zh_CN } from "./i18n/zh_CN";
import { en_US } from "./i18n/en_US";

export default function translateConfig($translateProvider){
        $translateProvider.translations("en", en_US);
        $translateProvider.translations("zh", zh_CN);
        $translateProvider.preferredLanguage("zh");
}
translateConfig.$inject = ["$translateProvider"]
