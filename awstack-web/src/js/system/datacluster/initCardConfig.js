initCardCtrl.$inject=["$scope", "$http","$timeout", "$location", "$routeParams", "$interval","$translate"];

function initCardCtrl($scope, $http,$timeout, $location, $routeParams, $interval,$translate){
    var self = $scope;
    self.bondsType = [
        {
            name:"主备",
            type:"active-backup"
        },
        {
            name:"LACP",
            type:"balance-tcp"
        },
        {
            name:"负载均衡",
            type:"balance-slb"
        }
    ]

    var cardCheckedItems =null;
    self.cardJson = {
        "nics":[
            {name:"eno1",speed:"1000"},
            {name:"eno2",speed:"1000"},
            {name:"eno3",speed:"10000"},
            {name:"eno4",speed:"10000"},
            {name:"eno5",speed:"100"},
            {name:"eno6",speed:"100"},
            {name:"eno7",speed:"10"},
            {name:"eno8",speed:"10"},
        ],
        "nic_map": {
            "cluster":{bonds:"bond0",speed:"10"},
            "storage": {bonds:"bond0",speed:"10"},
            "public": {bonds:"bond0",speed:"10"},
            "tenant": {bonds:"bond0",speed:"10"},
            "mgmt": {bonds:"bond0",speed:"10"}
        },
        "bonds":[
            {"name":"bond0","nics":[{name:"eno1",speed:1000},{name:"eno2",speed:1000}],"mode":"active-backup","selected":self.bondsType[0]},
        ]
    }
    if(localStorage.initConfigCardCheckedItems){
        cardCheckedItems = JSON.parse(localStorage.initConfigCardCheckedItems)[0];
        var nodeConfig = JSON.parse(localStorage.nodeConfig);
        if(nodeConfig[cardCheckedItems.nodeUid].cardJson){
            self.cardJson = nodeConfig[cardCheckedItems.nodeUid].cardJson;
        }else{
            self.cardJson = {
                //所选节点中的网卡
                "nics":cardCheckedItems.hostInfoMap.nics,
                "nic_map": {
                    "cluster":{},
                    "storage":{},
                    "public": {},
                    "tenant": {},
                    "mgmt":   {}
                },
                "bonds":[
                ]
            }
        }
    }
    var nics = $("#nics")[0];
    var cardIndex = null;
    var bondsIndex = null;
    var dragName = null;
    /*新增是否显示*/
    self.newBondsShow =true;
    self.bondsDelete = function(i){
        /*网卡回到可用状态*/
        self.cardJson.bonds[i].nics.forEach(function(item){
            self.cardJson.nics.push(item)
        })
        for(var k in self.cardJson.nic_map){
            if(self.cardJson.nic_map[k].bonds==self.cardJson.bonds[i].name){
                self.deleteNetcard(k)
            }
        }
        self.cardJson.bonds.splice(i,1);

        /*bonds名字初始化*/
        self.cardJson.bonds.forEach(function(item,i){
            item.id = item.name;
            item.name = "bond"+i;
        })
        self.cardJson.bonds.forEach(function(item){
            for(var k in self.cardJson.nic_map){
                if(self.cardJson.nic_map[k].bonds==item.id){
                    self.cardJson.nic_map[k].bonds=item.name
                }
            }
        })
        if(self.cardJson.bonds.length>=5){
            self.newBondsShow =false;
        }else{
            self.newBondsShow =true;
        }
    }
    self.cardsDelete = function(i,item){
        if(item.nics.length>0){
            var bondsIndexs = item.name.replace("bond",'');
            self.cardJson.nics.push(self.cardJson.bonds[bondsIndexs].nics[i])
            self.cardJson.bonds[bondsIndexs].nics.splice(i,1); 
            /*判断网卡是否删完,删完就去掉bonds*/
            if(self.cardJson.bonds[bondsIndexs].nics.length==0){
                self.bondsDelete(bondsIndexs)
            }
        }
    }
    /*删除网络bonds*/
    self.deleteNetcard=function(i){
        if(self.cardJson.nic_map[i].bonds&&self.cardJson.nic_map[i].bonds.indexOf("bond")==-1){
            var nics ={name:self.cardJson.nic_map[i].bonds,speed:self.cardJson.nic_map[i].speed}
        }
        self.cardJson.nic_map[i].bonds=null;
        self.cardJson.nic_map[i].speed=null;
        
    }
    /*可用网卡添加监听*/
    //$(".no-use")[0].addEventListener('dragstart',function(event){
    $(".no-use")[0].ondragstart = function(event){
        function nicDragStart(event){
            if($(event.target).closest(".no-use").length==1||$(event.target).parent(".bond-merged").length==1||$(event.target).parent(".nic-item").length==1){
                var drag = event.target;
                cardIndex = $(event.target).attr('indexNum');
                dragName = 'cards';
                event.dataTransfer.setData("text/html",$(this).prop("outerHTML"));
            }
        }
        nicDragStart(event);
    }
    //})
    /*新建bond监听*/
    //$(".new-bond")[0].addEventListener('drop',function(event){
    $(".new-bond")[0].ondrop = function(event){
        event.preventDefault();
        function addBonds(event){
            if(dragName != 'cards'){
                return;
            }
            for(var i in self.cardJson.nic_map){
              if(self.cardJson.nic_map[i].bonds&&self.cardJson.nic_map[i].bonds==self.cardJson.nics[cardIndex].name){
                self.toolUsed = true;
                $timeout(function(){
                     self.toolUsed = false;   
                },2000)
                self.$apply();
                return;
              }  
            }
            var newbonds = {"name":"","nics":[self.cardJson.nics[cardIndex]],"mode":"active-backup","selected":self.bondsType[0]}
            self.cardJson.bonds.push(newbonds);
            self.cardJson.nics.splice(cardIndex,1);
            self.cardJson.bonds.forEach(function(item,i){
                item.name = "bond"+i;
            })
            /*判断bonds是否超过5个*/
            if(self.cardJson.bonds.length>=5){
                self.newBondsShow =false;
            }else{
                self.newBondsShow =true;
            }
            self.$apply()
            /*给予drop监听*/
            $(".bond-desc")[$(".bond-desc").length-1].ondrop = function(event){
                event.preventDefault();
                bondsIndex= $(this).attr('indexNum');
                cardSuperposition(bondsIndex);
            }
            /*开始拖动事件*/
            $(".bonddrag")[$(".bonddrag").length-1].ondragstart = function(event){
                dragName = 'bonds';
                event.dataTransfer.setData("text/html",$(this).prop("outerHTML"));
                bondsIndex = $(this).find(".bond-desc").attr('indexNum');
            }

        }
        addBonds(event)
    }
    /*初始化监听网卡叠加合成*/
    function addBondsListen(){
        var allBonds = $(".bond-desc");
        for(var i=0;i<allBonds.length;i++){
            allBonds[i].ondrop = function(event){
                event.preventDefault();
                bondsIndex= $(this).attr('indexNum');
                cardSuperposition(bondsIndex)
            }
        }
        var allBondsLi = $(".bonddrag");
        for(var i=0;i<allBondsLi.length;i++){
            allBondsLi[i].ondragstart = function(event){
                dragName = 'bonds';
                bondsIndex= $(this).find(".bond-desc").attr('indexNum');
                event.dataTransfer.setData("text/html",$(this).prop("outerHTML"));
            }
        }
    }
    $timeout(function(){
        addBondsListen()
    },300)
    /*网卡叠加*/
    self.toolTips = false;
    function cardSuperposition(bondsIndex){
        /*速率相同的网卡才可以叠加*/
        if(dragName == 'cards'){
            for(var i in self.cardJson.nic_map){
              if(self.cardJson.nic_map[i].bonds&&self.cardJson.nic_map[i].bonds==self.cardJson.nics[cardIndex].name){
                self.toolUsed = true;
                $timeout(function(){
                     self.toolUsed = false;   
                },2000)
                self.$apply();
                return;
              }  
            }
            if(self.cardJson.nics[cardIndex].speed==self.cardJson.bonds[bondsIndex].nics[0].speed){
                self.cardJson.bonds[bondsIndex].nics.push(self.cardJson.nics[cardIndex]);
                self.cardJson.nics.splice(cardIndex,1);  
            }else{
                self.toolTips = true;
                $timeout(function(){
                     self.toolTips = false;   
                },2000)
            }
        }
        self.$apply();
    }

    /*拖动bonds监听*/
    var netContent = $(".netcontent");
    for(var i=0;i<netContent.length;i++){
        //netContent[i].addEventListener('drop',function(event){
        netContent[i].ondrop = function(event){
            event.preventDefault();
            var netName = $(this).attr('name');
            if(dragName=='bonds'){
                if(self.cardJson.bonds[bondsIndex].nics.length>1){
                    self.cardJson.nic_map[netName].bonds = self.cardJson.bonds[bondsIndex].name;
                    self.cardJson.nic_map[netName].speed=self.cardJson.bonds[bondsIndex].nics[0].speed;
                }else{
                    self.toolBond = true;
                    $timeout(function(){
                         self.toolBond = false;   
                    },2000)
                }
                //self.cardJson.nic_map[netName].show=true;
            }
            if(dragName=='cards'){
                self.cardJson.nic_map[netName].bonds = self.cardJson.nics[cardIndex].name;
                self.cardJson.nic_map[netName].speed=self.cardJson.nics[cardIndex].speed;
                //self.cardJson.nic_map[netName].show=true;
                //self.cardJson.nics.splice(cardIndex,1);
            }
            self.$apply()
        }
        //})
    }
    // nics.addEventListener('dragenter',function(event){
    // },false)
    // nics.addEventListener('dragover',function(event){
    //     event.preventDefault();
    // },false)
    nics.ondragenter = function(event){
        event.preventDefault();
    }
    nics.ondragover = function(event){
        event.preventDefault();
    }



    /*鼠标移动监听*/
    // nics.addEventListener('mouseover',function(event){
        // if($(event.target).closest(".bond").length==1){
        //     var n = $(event.target).closest(".bond").index();
        //     $(".bond-merged .bond").removeClass("active");
        //     $(".bond-merged .bond").eq(n).addClass("active");
        // }
    // },false)
    nics.onmouseover = function(event){
        if($(event.target).closest(".bond").length==1){
            var n = $(event.target).closest(".bond").index();
            $(".bond-merged .bond").removeClass("active");
            $(".bond-merged .bond").eq(n).addClass("active");
        }
    }
    
    /*保存网卡配置*/
    self.saveCardsConfig = function(){
        self.hasConfigCard=true;
        self.noConfigCard=false;
        //判断是否所有网络都绑定了网卡
        for(var i in self.cardJson.nic_map){
            if(self.cardJson.nic_map[i].bonds==undefined){
                self.toolNoUsed = true;
                self.hasConfigCard=false;
                self.noConfigCard=true;
                $timeout(function(){
                     self.toolNoUsed = false;
                     self.noConfigCard=false; 
                },2000)
                return;
            }  
        }
        if(!self.toolNoUsed){
            self.saveCardsSuccess=true;
            $timeout(function(){
                 self.saveCardsSuccess = false;   
            },1500);
            var cardCheckedItems = JSON.parse(localStorage.initConfigCardCheckedItems)
            cardCheckedItems.forEach(function(item){
                var nodeId = item.nodeUid;
                var nodeConfig = JSON.parse(localStorage.nodeConfig);
                nodeConfig[nodeId].cardJson = self.cardJson;
                localStorage.nodeConfig = JSON.stringify(nodeConfig);
            });
        }else{
            //有网络没有绑定网卡
            self.hasConfigCard=false;
            self.noConfigCard=true;
            $timeout(function(){
                 self.noConfigCard = false;   
            },2000);
        }
        
    };
}
export {
    initCardCtrl
}