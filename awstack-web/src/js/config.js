//API SOURCE
window.GLOBALCONFIG = {
    APIHOST:{
        "BASE":"http://172.16.12.41/awstack-user",
        "RESOURCE":"http://172.16.12.41/awstack-resource",
        "WEBSOCKET":"ws://172.16.12.41/awstack-websocket",
        "MONITOR":"http://172.16.12.41/awstack-monitor",
        "MONITORWS":"ws://172.16.12.41/awstack-monitor",
        "LOG":"http://172.16.12.41/awcloud-log",
        "QCLOUD":"http://172.16.12.41/awstack-qcloud",
        "WORKFLOW":"http://172.16.12.41/awstack-workflow",
        "VMWARE":"http://172.16.12.41/awstack-vmware",
        "SCHEDULE":"http://172.16.12.41/awstack-schedule",
        "HOMEPAGE":"/#/view",
        "Recharge":"/#/view",
        "BILL":"http://172.16.12.41/awstack-boss",
    }
};

//WORKFLOW 
window.ACTIVITI = {
    CONFIG:{
        "contextRoot":"http://172.16.12.41/awstack-workflow/service"
    }
};

//PUBLIC CLOUD
window.PUBLICCLOUD = [
    {
        paramName:"QCLOUD_API_KEY",
        paramDesc:"腾讯云",
        paramValue:[{"SecretId":"","SecretKey":"","Active":false}],
        status:"ADD"
    },{
        paramName:"VMWARE_API_KEY",
        paramDesc:"VMware vSphere",
        paramValue:[{"vCenterName":"","vCenterUrl":"","vCenterUserName":"","vCenterPassword":"","vmConsoleUrl":"https","Active":false,"sslThumbprint":""}],
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
    //"SITETITLE":"AWSTACK",//网站标题
    //"COPYRIGHT":"Copyright © 2012-2017 北京海云捷迅科技有限公司 京ICP备14031291号《中华人民共和国增值电信业务经营许可证》编号: 京B2-20140382"//网站版权信息
};

// STATIC URL 
window.STATIC_URL = "/frontend_static/";
var browser=navigator.appName 
var b_version=navigator.appVersion 
var version=b_version.split(";"); 
var trim_Version;
if(version[1]){
    trim_Version=version[1].replace(/[ ]/g,"");
}
if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE8.0"){
    alert("您的浏览器暂不支持云平台，请使用Internet explorer v10.0 及以上版本浏览器")
    document.execCommand("Stop");
}else{
    (function(){
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
}
