//API SOURCE
window.GLOBALCONFIG = {
    APIHOST:{
        "BASE":"http://192.168.138.134:9080/awstack-user",
        "RESOURCE":"http://192.168.138.134:9080/awstack-resource",
        "WEBSOCKET":"ws://192.168.138.134:9080/awstack-websocket",
        "MONITOR":"http://192.168.138.134:9080/awstack-monitor",
        "MONITORWS":"ws://192.168.138.134:9080/awstack-monitor",
        "LOG":"http://192.168.138.134:9080/awstack-log",
        "QCLOUD":"http://192.168.138.41:9080/awcloud-qcloud",
        "WORKFLOW":"http://192.168.138.134:9080/awstack-workflow",
        "HOMEPAGE":"http://console.rctest.com",
        "Recharge":"http://console.rctest.com/portal/action?action=/portal/cloud/recharge/remit"
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