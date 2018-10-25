import "./mailServerSrv";

var mailServerModule = angular.module("mailServerModule",["ngMessages","mailServerSrvModule"]);
mailServerModule.controller('mailServerCtrl',['$scope','mailServerSrv',
	function($scope,mailServerSrv){
		$scope.mail={
			host:"",
			username:"",
			password:"",
			isUse: false,
			smtp:{
				auth:"",
				sender:"",
				port:"",
				timeout:""
			},
			paramId:""
		};
		mailServerSrv.getMailData().then(function(res){
			if(res && res.data && angular.isArray(res.data) && res.data.length !=0){
				$scope.hasAdd = true;
                var mailData=JSON.parse(res.data[0].paramValue);
                var mailPassword = mailData["mail.password"].split(",").map(item=>{return String.fromCharCode(item)}).join("");
                $scope.mail={
					host:mailData["mail.host"],
					username:mailData["mail.username"],
					//password:mailData["mail.password"],
					password:mailPassword,
					isUse:mailData["mail.isUse"],
					smtp:{
						auth:mailData["mail.smtp.auth"],
						sender:mailData["mail.smtp.sender"],
						port:mailData["mail.smtp.port"],
						timeout:mailData["mail.smtp.timeout"]
					},
					paramId:res.data[0].paramId
				};
				
			}else{
				$scope.mail.smtp.port=25;
				$scope.hasAdd = false;				
			}
		});

		$scope.isSaveConnection = function(auth){
			auth?$scope.mail.smtp.port=465:$scope.mail.smtp.port=25;
		};

		$scope.saveMailServer= function(mail,mailSrvForm){
			$scope.submitValid =false;
			$scope.canSubmit = true;
			if(mailSrvForm.$valid){
				let data={
				"mail.host":mail.host,
				"mail.username":mail.username,
				"mail.password":mail.password,
				"mail.isUse":mail.isUse,
				"mail.smtp.auth":mail.smtp.auth,
				"mail.smtp.sender":mail.smtp.sender,
				"mail.smtp.port":mail.smtp.port
				};
				data=JSON.stringify(data);
				let option={
					"enterpriseUid":localStorage.enterpriseUid,
					"paramValue":data,
					"paramName":"mailserver",
					"parentId":27,
					"regionUid":0
				};
				switch ($scope.hasAdd){
					case true:
						option.paramId = $scope.mail.paramId;
						mailServerSrv.editData(option).finally(function(){
							$scope.canSubmit=false;
						})
						break;
					case false:
						option.paramLevel = 2;
						option.paramDesc = "邮件服务器配置";
						option.regionKey = 0;
						mailServerSrv.addData(option).then(function(res){
							if(res && res.status == "0"){
								$scope.hasAdd = true;
								$scope.mail.paramId = res.data	.paramId;
							}

						}).finally(function(){
							$scope.canSubmit=false;
						})
						break;
				}
			}else{
				$scope.submitValid =true;
			}
		};
	}
]);