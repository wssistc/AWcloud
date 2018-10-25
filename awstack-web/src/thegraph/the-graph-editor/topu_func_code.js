
function getGraphNode(){
    return ReactDOM.findDOMNode(editor.$.graph.graphView)
}
//修改node的颜色
function updateNodeClassName(nodeId, className1,className2,className3){
    var graph = getGraphNode();
    var node = graph.querySelector('g[name="' + nodeId + '"]');
    //border的颜色
    var bgNodeBorder=node.querySelector('rect:nth-child(2)');
    //node的填充色
    var bgNode = node.querySelector('rect:nth-child(3)');
    //node的icon颜色
    var bgNodeIcon=node.querySelector('text');
    if(bgNode){
        bgNode.setAttribute('class', className1);
    }
    if(bgNodeBorder){
        bgNodeBorder.setAttribute('class', className2);
    }
    if(bgNodeIcon){
        bgNodeIcon.setAttribute('class', className3);
    }


}
//修改edge的颜色
function updateEdgeClassName(edge,className){
    var graph = getGraphNode();
    var edgeTitle=edge.from.node+":"+edge.from.port+"->"+edge.to.node+":"+edge.to.port;
    var edge = graph.querySelector('g[title="' + edgeTitle + '"]');
    var bgEdge=edge.querySelector('path:nth-child(3)');
    if(bgEdge){
        bgEdge.setAttribute('class',className);
    }
}
//修改group的颜色
function updateGroupClassName(group,className){
    var graph = getGraphNode();
    var data_reactid=".0.1.0.0.0.$group=1"+group.name;
    var group = graph.querySelector('g[data-reactid="' + data_reactid + '"]');
    var bgGroup=group.querySelector('rect:nth-child(1)');
    if(bgGroup){
        bgGroup.setAttribute('class',className);
    }
}
//websocket函数
function lickFuc(){
    var url = window.GLOBALCONFIG.APIHOST.MONITORWS+"/v1/event?regionKey="+localStorage.regionKey+"&userUid="+localStorage.userUid;
    if ("WebSocket" in window) {
        ws = new WebSocket(url);
    } else if ("MozWebSocket") {
        ws = new MozWebsocket;
    }
    ws.onopen = function() {
        //console.log(url+"sss");       
    };
    ws.onmessage = function(e) {
        //开机成功
        if(JSON.parse(e.data).eventType=="compute.instance.power_on.end"){
            var vm_message=JSON.parse(e.data);
            var vm_meta=JSON.parse(vm_message.meta);
            var vm_id=vm_meta.instance_id;
            var vm_status=vm_meta.status;
            /*editor.nofloGraph.nodes.forEach(function(node){
                if(node.id==("vm/"+vm_id)){
                    node.metadata.vm_status=vm_status;
                }
            })*/
            updateNodeClassName("vm/"+vm_id,"node-rect drag","node-border drag","icon node-icon drag");
            //editor.updateIcon("vm/"+vm_id,"vm");
        }

        //关机成功
        if(JSON.parse(e.data).eventType=="compute.instance.power_off.end"){
            var vm_message=JSON.parse(e.data);
            var vm_meta=JSON.parse(vm_message.meta);
            var vm_id=vm_meta.instance_id;
            var vm_status=vm_meta.status;
            updateNodeClassName("vm/"+vm_id,"node-rect-shutdown drag","shut-down-node-border drag","icon shut-down-node-icon drag");
            /*editor.nofloGraph.nodes.forEach(function(node){
                if(node.id==("vm/"+vm_id)){
                    node.metadata.vm_status=vm_status;
                }
            })*/
            //editor.updateIcon("vm/"+vm_id,"vm");
        }
    };
    ws.onclose = function(){};
}
lickFuc();
//虚拟机关机操作
var shutDownFunc=function(graph,itemKey,item){
    var aa=item.id.split("/");
    var url=window.GLOBALCONFIG.APIHOST.RESOURCE;
    var auth_token = localStorage.$AUTH_TOKEN;
    $.ajax({  
      type: 'POST',  
      url:url+"/v1/server/os-stop?ids="+aa[1],
      beforeSend: function(request) {
        request.setRequestHeader("X-Auth-Token", auth_token);
      },
      success: function(data){  
      },
      error:function(e){  
      }
    });
}
//虚拟机开机操作
var startUpFunc=function(graph,itemKey,item){
    var aa=item.id.split("/");
    var url=window.GLOBALCONFIG.APIHOST.RESOURCE;
    var auth_token = localStorage.$AUTH_TOKEN;
    $.ajax({  
      type: 'POST',  
      url:url+"/v1/server/os-start?ids="+aa[1],
      beforeSend: function(request) {
        request.setRequestHeader("X-Auth-Token", auth_token);
      },
      success: function(data){  
      },
      error:function(e){  
      }
    });
}
//虚拟机重启操作
var reBootFunc=function(graph,itemKey,item){
    var aa=item.id.split("/");
    var url=window.GLOBALCONFIG.APIHOST.RESOURCE;
    var auth_token = localStorage.$AUTH_TOKEN;
    $.ajax({  
      type: 'POST',  
      url:url+"/v1/server/os-reboot?ids="+aa[1],
      beforeSend: function(request) {
        request.setRequestHeader("X-Auth-Token", auth_token);
      },
      success: function(data){  
      },
      error:function(e){  
      }
    });
}
//group右键展开分组
var showAllGroupFun=function(graph,itemKey,item){
    updateGroupClassName(item,"group-box color4")
    if(item.moreNodes==undefined){
        item.moreNodes=[];
    }
    if(item.moreEdges==undefined){
        item.moreEdges=[];
    }
    item.moreNodes.forEach(function(node){
        //防止节点被重复添加
        var k=0;
        for(k;k<graph.nodes.length;k++){
            if(node.component==graph.nodes[k].component){
                break;
            }
        }
        if(k==graph.nodes.length){
            //显示印章、藏的节点
            editor.nofloGraph.addNode(node.component,node.component,node.metadata);
            //还原原来的group
            /*node.metadata.network_id.forEach(function(netid){
                window.switchGroup[netid].push(node.component);          
            })*/
            var netid=node.metadata.network_id[0];
            window.switchGroup[netid].push(node.component);
        }
    });
    //还原原来的连线
    item.moreEdges.forEach(function(edge){
        var meta={route:0};
        editor.nofloGraph.addEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port, meta);
    })
    var iframeWidth=document.getElementById("editor").width;
    var iframeHeight=document.getElementById("editor").height;
    var groupLength=0;
    editor.nofloGraph.groups.forEach(function(group){
        if(group.nodes.length!=0){
            groupLength++;
        }
    })
    nodeType=3+parseInt(groupLength/6)+(groupLength%6==0 ? 0:1)
    var y_distance=(iframeHeight/nodeType).toFixed(2);
    vmLocation(editor.nofloGraph,iframeWidth,y_distance);
}
           
//group右键隐藏分组
var hideGroupFunc=function (graph, itemKey, item) {
    //graph.removeGroup(itemKey);
    updateGroupClassName(item,"group-box color3")
    var moreNodes=[];
    var moreEdges=[];
    for(var i=0;i<item.nodes.length;i++){
      for(var j=0;j<graph.nodes.length;j++){
        if(item.nodes[i]==graph.nodes[j].component){
            moreNodes.push(graph.nodes[j]);
        }
      }
    }
    item.moreNodes=moreNodes;
    for(var i=0;i<item.nodes.length;i++){
        for(var j=0;j<graph.edges.length;j++){
            if(item.nodes[i]==graph.edges[j].to.node){
                moreEdges.push(graph.edges[j]);
            }
        }
    }
    item.moreEdges=moreEdges;
    var nodesLength=item.nodes.length-1;
    for(var i=0;i<nodesLength;i++){
        graph.removeNode(item.nodes[item.nodes.length-1]);
    }
    var iframeWidth=document.getElementById("editor").width;
    var iframeHeight=document.getElementById("editor").height;
    var groupLength=0;
    editor.nofloGraph.groups.forEach(function(group){
        if(group.nodes.length!=0){
            groupLength++;
        }
    })
    nodeType=3+parseInt(groupLength/6)+(groupLength%6==0 ? 0:1)
    var y_distance=(iframeHeight/nodeType).toFixed(2);
    vmLocation(editor.nofloGraph,iframeWidth,y_distance);
}
//初始化虚拟机的坐标
var nodeLocation=function(nofloGraph){
    var vm_x_init=100;
    //var x_group_num=-1;
    for(var k in window.switchGroup){
        if(window.switchGroup[k].length>0){
            //x_group_num++;
            vm_x_init=vm_x_init+100;
            /*if(x_group_num%3===0){
            vm_x_init=100;
            } */
        }
        window.switchGroup[k].forEach(function(node){
            nofloGraph.nodes.forEach(function (item) {
                if(node==item.component){
                    //item.metadata.y=parseInt(x_group_num/3)*200+700;
                    item.metadata.y=y_distance*3-97;
                    item.metadata.x=vm_x_init;
                    vm_x_init=vm_x_init+100;
                }
            })
        })
    }
}
//初始化vm的坐标
var vmLocation=function(nofloGraph,iframeWidth,y_distance){
    var vm_num=0;//vm的总数量
    var groupLength=0;
    for(var k in window.switchGroup){
        if(window.switchGroup[k].length>0){
            vm_num=vm_num+window.switchGroup[k].length;
        }
    }
    
    nofloGraph.groups.forEach(function(group){
        if(group.nodes.length!=0){
            groupLength++;
        }
    })
    var group_distance=144*groupLength+56*(groupLength-1)+(vm_num-groupLength)*100
   //var group_distance=vm_num*100+36
    //第四排第一个vm的初始坐标
    var vm_x_init=Number((iframeWidth/2).toFixed(2)-(group_distance/2).toFixed(2)+36);
    for(var k in window.switchGroup){
        if(window.switchGroup[k].length>0){
            vm_x_init=vm_x_init+100;
        }
        window.switchGroup[k].forEach(function(node){
            //console.log(editor)
            nofloGraph.nodes.forEach(function (item) {
                if(node==item.component){
                    if(localStorage.permission!="enterprise"){
                        item.metadata.y=y_distance*3-97;
                    }else{
                        item.metadata.y=y_distance*4-97;
                    }
                    
                    item.metadata.x=vm_x_init;
                    vm_x_init=vm_x_init+280;
                }
            })
        })
    }
}
//初始化node坐标
var nodeCoordinates=function(nofloGraph){
    var iframeWidth=document.getElementById("editor").width;
    var iframeHeight=document.getElementById("editor").height;
    var groupLength=0;
    //按照switch给虚拟机分组
    window.switchGroup={};
    nofloGraph.groups.forEach(function(group){
      window.switchGroup[group.metadata.switch_id]=group.nodes;
    })

    //获取每种类型的node的数量
    var switch_num=0;
    var router_external_num=0;
    var router_num=0;
    nofloGraph.nodes.forEach(function(node){
        if(node.metadata.router_external=="true"){
            router_external_num++;
        }else if(node.metadata.type=="router"){
            router_num++
        }else if(node.metadata.type=="switch"&&!node.metadata.router_external){
            switch_num++;
        }else if(node.metadata.type=="vm"){
            /*node.metadata.network_id.forEach(function(netid){
              window.switchGroup[netid].push(node.component)
            })*/
            if(node.metadata.network_id.length>0){
                var netid=node.metadata.network_id[0];
                window.switchGroup[netid].push(node.component);  
            }
        }
    })
    //判断vm一共有多少不为null的组
    for(var k in window.switchGroup){
        if(window.switchGroup[k].length>0){
            groupLength++;
        }
    }
    //计算除vm之外的node的坐标
    var switch_x_init=Number((iframeWidth/2).toFixed(2)-((switch_num*100-28)/2).toFixed(2));
    var router_external_x_init=Number((iframeWidth/2).toFixed(2)-((router_external_num*100-28)/2).toFixed(2));
    var router_x_init=Number((iframeWidth/2).toFixed(2)-((router_num*100-28)/2).toFixed(2));
    var y_distance=(iframeHeight/4).toFixed(2);
    if(localStorage.permission!="enterprise"){
        nofloGraph.nodes.forEach(function(node){
            /*if(node.metadata.router_external=="true"){
                node.metadata.y=y_distance-97;
                node.metadata.x=router_external_x_init;
                router_external_x_init=router_external_x_init+100;
            }else if(node.metadata.type=="router"){
                node.metadata.y=y_distance*1-97;   
                node.metadata.x=router_x_init;
                router_x_init=router_x_init+100;
            }else*/ if(node.metadata.type=="switch"&&!node.metadata.router_external){
                node.metadata.y=y_distance-97;
                node.metadata.x=switch_x_init;
                switch_x_init=switch_x_init+280;
            }
        });
    }else{
        nofloGraph.nodes.forEach(function(node){
            if(node.metadata.router_external=="true"){
                node.metadata.y=y_distance-97;
                node.metadata.x=router_external_x_init;
                router_external_x_init=router_external_x_init+280;
            }else if(node.metadata.type=="router"){
                node.metadata.y=y_distance*2-97;   
                node.metadata.x=router_x_init;
                router_x_init=router_x_init+280;
            }else if(node.metadata.type=="switch"&&!node.metadata.router_external){
                node.metadata.y=y_distance*3-97;
                node.metadata.x=switch_x_init;
                switch_x_init=switch_x_init+280;
            }
        });
    }
    
    
    vmLocation(nofloGraph,iframeWidth,y_distance);
}
