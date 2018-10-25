accountManageCtrl.$inject=['$scope','$rootScope','$timeout','NgTableParams','$uibModal',"GLOBAL_CONFIG",'checkedSrv','tdsqlSrv','TableCom','$translate','$filter']
createAccountCtrl.$inject=['$scope','$rootScope','$timeout','NgTableParams','$uibModal',"GLOBAL_CONFIG",'checkedSrv','tdsqlSrv','TableCom','$translate','context']
copyAccountCtrl.$inject=['$scope','$rootScope','$timeout','NgTableParams','$uibModal',"GLOBAL_CONFIG",'checkedSrv','tdsqlSrv','TableCom','$translate','context']
modifyAuthorityCtrl.$inject=['$scope','$rootScope','$timeout','NgTableParams','$uibModal',"GLOBAL_CONFIG",'checkedSrv','tdsqlSrv','TableCom','$translate','context']
resetPasswordCtrl.$inject=['$scope','$rootScope','$timeout','NgTableParams','$uibModal',"GLOBAL_CONFIG",'checkedSrv','tdsqlSrv','TableCom','$translate','context']
function accountManageCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModal,GLOBAL_CONFIG,checkedSrv,tdsqlSrv,TableCom,$translate,$filter) {
    var self = $scope;
    self.account_search={};
    self.accountCheckbox={
        checked:false,
        items:{}
    };
    //设置项的初始化
    self.titleName="tdsqlAccountManage";
    if(sessionStorage["tdsqlAccountManage"]){
       self.titleData=JSON.parse(sessionStorage["tdsqlAccountManage"]);
    }else{
       self.titleData=[
          {name:'tdsql.accountName',value:true,disable:true,search:'user'},
          {name:'tdsql.hosts',value:true,disable:false,search:'host'},
          {name:'tdsql.accountType',value:true,disable:false,search:'readonly'},
          {name:'tdsql.createTime',value:true,disable:false,search:'create_time'}, 
          {name:'tdsql.updateTime',value:true,disable:false,search:'update_time'},
          {name:'tdsql.remarks',value:true,disable:false,search:'remark'}
       ];
    }
    
    self.refreshAccount=function(){
    	self.getAccount();
    }
    self.accountSearchTearm=function(obj){
        var tableData = obj.tableData;
        var titleData = obj.titleData;
        tableData.map(function(item){
           item.searchTerm="";
           titleData.forEach(function(showTitle){[1,2,3]
                 if(showTitle.value){
                     item.searchTerm+=item[showTitle.search]+"\b";
                 }
           });
        });
    };
    
    self.test=function(){
    	alert('1111')
    }

    self.applyGlobalSearch=function(aaa){
        self.accountTable.filter({          
          searchTerm: aaa
        });
    };
    self.getAccount=function(){
        self.account_search.searchTearm="";
        self.loadAcconutData=false;
        self.accountTable = new NgTableParams({
           count: GLOBAL_CONFIG.PAGESIZE
        }, {
           counts: [],
           dataset: []
        });
        tdsqlSrv.getAccount().then(function(res){
            res ? self.loadTdsqlData  = true : "";
            if(res&&res.data&&angular.isArray(res.data.returnData.users)){
               successFunc(res.data.returnData.users); 
            }
        });
    }

    self.refreshAccount=self.getAccount();

    function successFunc(data){
        self.accountData=data;
        self.accountSearchTearm({tableData:self.accountData,titleData:self.titleData});
        //$filter("date")(item.createTime, "yyyy-MM-dd HH:mm:ss");  
        self.accountData.forEach(function(opt,index){
        	opt.create_time=$filter("date")(opt.create_time, "yyyy-MM-dd HH:mm:ss");  
        	opt.update_time=$filter("date")(opt.update_time, "yyyy-MM-dd HH:mm:ss");
        	if(opt.create_time==null){
        		opt.create_time="无"
        	}
        	if(opt.update_time==null){
        		opt.update_time="无"
        	}
        	opt.id=index;
        	opt.readonly==0?opt.readonly='普通账户':opt.readonly='只读账户';
        	
        })
        self.accountSearchTearm({tableData:self.accountData,titleData:self.titleData});
        TableCom.init(self,'accountTable',self.accountData,'id',10,'accountCheckbox');
    }

    //监听页面勾选框变化
    self.$watch(function() {
        return self.accountCheckbox.items;//监控checkbox
    }, function(val) {
        self.accountCheckedItems = [];
        var arr=[];
        for(var i in self.accountCheckbox.items){
            arr.push(self.accountCheckbox.items[i]);
        }
        if(val && arr.length>=0){
            for(var key in val){
                if(val[key]){
                    self.accountData.forEach(item=>{
                        if(item.id==key){
                            self.accountCheckedItems.push(item);
                        }
                    });
                }
            }
        }
        //判断各个按钮是否可以点击
        if(!self.accountCheckedItems||self.accountCheckedItems.length!=1){
        	self.canClone=true;
        }else{
        	self.canClone=false;
        }
        
    },true);

    self.createAccount=function(){
        self.createAccountModal=$uibModal.open({
            animation: true,
            templateUrl: "createAccount.html",
            controller: "createAccountCtrl",
            resolve: {
                context: function() {
                    return self;
                }
            }
        });
    };


    self.copyAccount=function(){
        self.copyAccountModal=$uibModal.open({
            animation: true,
            templateUrl: "copyAccount.html",
            controller: "copyAccountCtrl",
            resolve: {
                context: function() {
                    return self;
                }
            }
        });
    };

    self.deleteAccount= function() {
        var content = {
            target: "delAccount",
            msg: "<div>" + $translate.instant("aws.tdsql.confirmDelAccount") + "</div><div class='tdsql-delAccount'>"+$translate.instant("aws.tdsql.delAccount")+"["+self.accountCheckedItems[0].user+"]</div>",
            data: self.accountCheckedItems[0]
        };
        self.$emit("delete", content);
    };
    self.$on("delAccount", function(e,data) {
    	var content={id:"",groupid:"group_1539864169_83199",user:"",host:""};
    	content.user=data.user;
    	content.host=data.host;
		tdsqlSrv.delAccount(content).then(function(res){
			self.getAccount();
		})
    });

    self.modifyAuthority=function(){
        self.createAccountModal=$uibModal.open({
            animation: true,
            templateUrl: "modifyAuthority.html",
            controller: "modifyAuthorityCtrl",
            resolve: {
                context: function() {
                    return self;
                }
            }
        });
    };

    self.resetPassword=function(){
         self.resetPasswordModal=$uibModal.open({
            animation: true,
            templateUrl: "resetPassword.html",
            controller: "resetPasswordCtrl",
            resolve: {
                context: function() {
                    return self;
                }
            }
        });
    };
}
function createAccountCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModal,GLOBAL_CONFIG,checkedSrv,tdsqlSrv,TableCom,$translate,context) {
    var self = $scope;
    self.hostsErrorMsg=$translate.instant("aws.tdsql.placeholder.hostsMsg");
    self.pwdErrorMsg=$translate.instant("aws.tdsql.placeholder.passwordMsg");
    self.accountSubmintted=false;
    self.account={
        user:"",
        readonly:"0",
        host:"",
        pwd:"",
        confirmPwd:"",
        remark:"",
        id:"",
        groupid:"group_1539864169_83199",
        expiretime:0,
    };
    self.interactedAccount = function(field) {
        if (field) {
            return self.accountSubmintted || field.$dirty;
        }
    };
    self.createAccountConfirm=function(createAccountForm){
        if(createAccountForm.$valid){
        	delete self.account.confirmPwd;
        	self.account.readonly=parseInt(self.account.readonly);
        	if(self.account.host==""){
        		self.account.host="%";
        	}
        	tdsqlSrv.createAccountConfirm(self.account).then(function(res){
        		//查询数据
        		context.createAccountModal.close();
        		context.getAccount();
        	})
        }else{
            self.accountSubmintted=true;
        }
    };
}

function copyAccountCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModal,GLOBAL_CONFIG,checkedSrv,tdsqlSrv,TableCom,$translate,context) {
    var self = $scope;
    self.hostsErrorMsg=$translate.instant("aws.tdsql.placeholder.hostsMsg");
    self.pwdErrorMsg=$translate.instant("aws.tdsql.placeholder.passwordMsg");
    self.accountSubmintted=false;
    self.copyAccount=context.accountCheckedItems[0];
    self.account={
        user:"",
        readonly:"0",
        host:"",
        pwd:"",
        confirmPwd:"",
        remark:"",
        id:"",
        groupid:"group_1539864169_83199",
        expiretime:0,
        src:{"user":"","host":""},
        dst:{"user":"","host":""}
    };
    self.interactedAccount = function(field) {
        if (field) {
            return self.accountSubmintted || field.$dirty;
        }
    };
    
    self.copyAccountConfirm=function(copyAccountForm){
        if(copyAccountForm.$valid){
        	delete self.account.confirmPwd;
        	self.account.readonly=parseInt(self.account.readonly);
        	if(self.account.host==""){
        		self.account.host="%";
        	}
        	self.account.src.user=self.copyAccount.user;
        	self.account.src.host=self.copyAccount.host;
        	self.account.dst.user=self.account.user;
        	self.account.dst.host=self.account.host;
        	tdsqlSrv.copyAccountConfirm(self.account).then(function(res){
        		//查询数据
        		context.copyAccountModal.close();
        		context.getAccount();
        	})
        }else{
            self.accountSubmintted=true;
        }
    };
}
function modifyAuthorityCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModal,GLOBAL_CONFIG,checkedSrv,tdsqlSrv,TableCom,$translate,context) {
    var self = $scope;
    self.modifySubmintted=false;
    self.interactedModify = function(field) {
        if (field) {
            return self.modifySubmintted || field.$dirty;
        }
    };
    self.modifyData={
       authorizedObject:{
          library:"",
          object:"",
          owner:"",
       },
       selectedAll:false
    };
    self.libraryList=[
        {name:"所有库"},
        {name:"所有库"},
        {name:"所有库"},
        {name:"所有库"}
    ];
    self.objectList=[
        {name:"所有对象"},
        {name:"所有对象"},
        {name:"所有对象"},
        {name:"所有对象"}
    ];
    self.owner=[
        {name:"所有"}
    ];
    self.selectItem=[
        {name:'SELECT',value:false},
        {name:'SELECT',value:false},
        {name:'SELECT',value:false},
        {name:'SELECT',value:false},
        {name:'SELECT',value:false},
        {name:'SELECT',value:false},
        {name:'SELECT',value:false},
        {name:'SELECT',value:false},
        {name:'SELECT',value:false},
        {name:'SELECT',value:false},
        {name:'SELECT',value:false},
    ];

    self.$watch(function(){
        return self.modifyData.selectedAll;
    },function(selectedAll){
        if(selectedAll){
           self.selectItem.forEach(function(item){
               item.value=true;
           }); 
        }else{
           self.selectItem.forEach(function(item){
               item.value=false;
           });  
        }
    });
    self.$watch(function(){
        return self.selectItem;
    },function(values){
        if(values){
           var selectedArr=[];
           values.forEach(function(item){
               if(item.value){
                  selectedArr.push(item);
               }
           });
           if(selectedArr.length==0){
               self.modifyData.selectedAll=false;
           }
        }
    },true);
}
function resetPasswordCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModal,GLOBAL_CONFIG,checkedSrv,tdsqlSrv,TableCom,$translate,context) {
    var self = $scope;
    self.resetSubmintted=false;
    self.verificationErrorMsg=$translate.instant("aws.tdsql.placeholder.verificationErrorMsg");
    self.phoneErrorMsg=$translate.instant("aws.tdsql.placeholder.phoneErrorMsg");
    self.account={
    	groupid:"group_1539864169_83199",
    	id:"",
    	user:context.accountCheckedItems[0].user,
    	host:context.accountCheckedItems[0].host,
    	pwd:"",
    	confirmPwd:""
    }
    self.interactedReset = function(field) {
        if (field) {
            return self.resetSubmintted || field.$dirty;
        }
    };
    self.resetPwd=function(resetPasswordForm){
    	if(resetPasswordForm.$valid){
    		delete self.account.confirmPwd;
			  tdsqlSrv.resetPwd(self.account).then(function(res){
			  	//查询数据
        		context.resetPasswordModal.close();
        		context.getAccount();
			  })
    	}
    }
    
}
export{accountManageCtrl,createAccountCtrl,modifyAuthorityCtrl,copyAccountCtrl,resetPasswordCtrl};