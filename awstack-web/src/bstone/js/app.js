"use strict";
import route from "./route";
import app from "../../js/index"

app.config(route);
console.log(angular.injector(app.name));
console.log(app);
