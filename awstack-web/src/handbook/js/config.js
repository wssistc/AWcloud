//API SOURCE
window.GLOBALCONFIG = {
    APIHOST:{
    }
};

//global setting
window.SETTING = {
    "pageNum":"10"
};

// STATIC URL
window.STATIC_URL = "/frontend_static/"

;(function(){
var config = document.getElementById("page-config");
if(config){
    var js,css;
    if(config.getAttribute("data-css")){
        css = config.getAttribute("data-css").replace(/^\s+|\s+$/g, "").split(/\s+/).map(function(i){
            return "<link rel=\"stylesheet\" href=\"" + STATIC_URL + i + "\">";
        });
        document.write(css.join(""));
    } 
    if(config.getAttribute("data-js")){
       js = config.getAttribute("data-js").replace(/^\s+|\s+$/g, "").split(/\s+/).map(function(i){
           return "<script src=\"" + STATIC_URL + i + "\"></" + "script>";
        });
        document.write(js.join("")); 
    } 
}
})();