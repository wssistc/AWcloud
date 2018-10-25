export default  function httpConfig($httpProvider, $translateProvider){
  $httpProvider.interceptors.push([
      "$q", "$rootScope","API_HOST","$translate",
      function(q, $rootScope,api_host,$translate) {
          return {
              request(config) {
                  if (config.url.indexOf("awstack-vmware") > -1) {
                      var res_url = config.url.split("awstack-vmware");
                      config.url = api_host.VMWARE + res_url[1];
                  }
                  if (config.url.indexOf("awstack-user") > -1) {
                      var res_url = config.url.split("awstack-user");
                      config.url = api_host.BASE + res_url[1];
                  }
                  let auth_token = localStorage.$AUTH_TOKEN;
                  config.headers["X-Auth-Token"] = auth_token;
                  config.headers["Content-Type"] = "application/json;charset=UTF-8";
                  return config;
              },
              response(res) {
                  if (/\.html/.test(res.config.url)) {
                      return res;
                  }
                  if(res.data){
                    if(res.data.code!=0){
                      let resCode = res.data.code;
                      if(res.data.data&&res.data.data.type){
                          let errorFromList = res.data.data.type.split(".");
                          if (errorFromList[0] == "vmware"){
                            switch (errorFromList[1]) { 
                              case "vm":
                                if(res.data.data.data){
                                  if(res.data.data.data.indexOf("Unable to access the virtual machine configuration")!=-1){
                                    resCode="00000101";
                                  }else if(res.data.data.data.indexOf("A specified parameter was not correct")!=-1){
                                    resCode="00000102";
                                  }
                                  $rootScope.$broadcast("alert-error",resCode);
                                }
                                break;
                              default:
                                  if(res.data.data){
                                    let error_info=res.data.data.data;
                                    $rootScope.$broadcast("alert-error",resCode,error_info);
                                  }
                            }
                          }
                      }else{
                        $rootScope.$broadcast("alert-error",resCode);
                      }
                      
                      /*if(res.data.data){
                        let error_info=res.data.data.data;
                        $rootScope.$broadcast("alert-error",resCode,error_info);
                      }else{
                        
                      }*/
                      
                    }else{
                      let resCode = res.data.code;
                      if(res.config.method!="GET"){
                        //创建虚拟机
                        if(res.config.method=="POST"){
                          if(res.config.url.indexOf("v1/servers") > -1){
                            if(res.config.url.indexOf("servers/verify") >-1){

                            }else if(res.config.url.indexOf("v1/servers/snapshotlist") ==-1 
                              && res.config.url.indexOf("v1/servers/console") ==-1){
                              $rootScope.$broadcast("alert-success",resCode);
                            }
                          }
                        }else{
                          $rootScope.$broadcast("alert-success",resCode);
                        }
                        return res.data.data
                        
                      }
                    }
                  }
                  /*if (res.headers("X-Auth-Token")) {
                      localStorage.$AUTH_TOKEN = res.headers("X-Auth-Token");
                  }*/
                  /*if(res.data.data.data.ctoken){
                      let list=[];
                      list=res.data.data.data.ctoken.split('\"');
                      localStorage.$AUTH_TOKEN = list[1];
                  }*/
                  return res.data.data;
              },
              requestError(rej) {

                  //$rootScope.$broadcast("ui-tag-bubble",{msg:rej.status});
                  return rej;
              },
              responseError(rej) {
                $rootScope.$broadcast("ui-tag-bubble",{msg:rej.status});
              }
          };
      }
  ]);
}
httpConfig.$inject = ["$httpProvider"];
