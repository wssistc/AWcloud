window.GLOBALCONFIG = {
    APIHOST:{
        "BASE":"http://103.227.79.221:9080/awstack-user",
        "RESOURCE":"http://103.227.79.221:9080/awstack-resource",
        "WEBSOCKET":"ws://103.227.79.221:9080/awstack-websocket",
        "MONITOR":"http://103.227.79.221:9080/awstack-monitor",
        "MONITORWS":"ws://103.227.79.221:9080/awstack-monitor",
        "LOG":"http://103.227.79.221:9080/awcloud-log",
        "QCLOUD":"http://103.227.79.221:9080/awstack-qcloud",
        "WORKFLOW":"http://103.227.79.221:9080/awstack-workflow",
        "HOMEPAGE":"/#/view",
        "Recharge":"/#/view"
    }
};

//WORKFLOW 
window.ACTIVITI = {
  CONFIG:{
    "contextRoot":"http://103.227.79.221:9080/awstack-workflow/service"
  }
};

//PUBLIC CLOUD
window.PUBLICCLOUD = [
    {
        paramName:"QCLOUD_API_KEY",
        paramDesc:"腾讯云",
        paramValue:{"SecretId":"","SecretKey":"","Active":false},
        status:"ADD"
    },{
        paramName:"VMWARE_API_KEY",
        paramDesc:"VMWARE",
        paramValue:{"vCenterUrl":"","vCenterName":"","vCenterPassword":"","Active":false},
        status:"ADD"
    }/*,{
        paramName:"ALIYUN_API_KEY",
        paramDesc:"阿里云",
        paramValue:{"AccessKeyID":"","AccessKeySecret":"","Active":false},
        status:"ADD"
    },{
        paramName:"AWS_API_KEY",
        paramDesc:"AWS",
        paramValue:{"AccessKeyID":"","AccessKeySecret":"","Active":false},
        status:"ADD"
    }*/
];
//global setting
window.SETTING = {
    "pageNum":"10",
    "SITETITLE":"AWSTACK",//网站标题
    "COPYRIGHT":"Copyright © 2012-2017 北京海云捷迅科技有限公司 京ICP备14031291号《中华人民共和国增值电信业务经营许可证》编号: 京B2-20140382"//网站版权信息
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