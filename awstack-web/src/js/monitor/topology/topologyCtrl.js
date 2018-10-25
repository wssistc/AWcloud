angular.module("topologyCtrl", [])
    .controller("TopologyCtrl", function ($scope, $rootScope, backendSrv) {

        var height = $(document).height()-60;
        $("#topoDiagram").height(height);
        var $_go = go.GraphObject.make;
        window.myDiagram =
            $_go(go.Diagram, "topoDiagram",
                { initialContentAlignment: go.Spot.Center, "undoManager.isEnabled": true });

        function init() {
            myDiagram.addDiagramListener("Modified", function(e) {
                var button = document.getElementById("SaveButton");
                if (button) button.disabled = !myDiagram.isModified;
                var idx = document.title.indexOf("*");
                if (myDiagram.isModified) {
                    if (idx < 0) document.title += "*";
                } else {
                    if (idx >= 0) document.title = document.title.substr(0, idx);
                }
            });

            var nodeMenu =  // context menu for each Node
                $_go(go.Adornment, "Vertical",
                    $_go("ContextMenuButton",
                        $_go(go.TextBlock, "Add top port"),
                        { click: function (e, obj) { addPort("top"); } }),
                    $_go("ContextMenuButton",
                        $_go(go.TextBlock, "Add left port"),
                        { click: function (e, obj) { addPort("left"); } }),
                    $_go("ContextMenuButton",
                        $_go(go.TextBlock, "Add right port"),
                        { click: function (e, obj) { addPort("right"); } }),
                    $_go("ContextMenuButton",
                        $_go(go.TextBlock, "Add bottom port"),
                        { click: function (e, obj) { addPort("bottom"); } })
                );

            var portSize = new go.Size(4, 4);

            var portMenu =
                $_go(go.Adornment, "Vertical",
                    $_go("ContextMenuButton",
                        $_go(go.TextBlock, "Remove port"),
                        // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
                        { click: function (e, obj) { removePort(obj.part.adornedObject); } }),
                    $_go("ContextMenuButton",
                        $_go(go.TextBlock, "Change color"),
                        { click: function (e, obj) { changeColor(obj.part.adornedObject); } }),
                    $_go("ContextMenuButton",
                        $_go(go.TextBlock, "Remove side ports"),
                        { click: function (e, obj) { removeAll(obj.part.adornedObject); } })
                );

            // the node template
            myDiagram.nodeTemplate =
                $_go(go.Node, "Table",
                    { locationObjectName: "BODY",
                        locationSpot: go.Spot.Center,
                        selectionObjectName: "BODY",
                        contextMenu: nodeMenu
                    },
                    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

                    // the body
                    $_go(go.Panel, "Auto",
                        { row: 1, column: 1, name: "BODY",
                            stretch: go.GraphObject.Fill },
                        $_go(go.Shape, "Rectangle",
                            {
                                fill: "#fff",
                                stroke: null,
                                strokeWidth: 1,
                                minSize: new go.Size(100, 100)
                            },
                            new go.Binding("minSize", "size").makeTwoWay()),
                        $_go(go.Picture,
                            {
                                width: 60,
                                height: 60,
                                alignment: go.Spot.Top
                            },
                            new go.Binding("source", "img")),
                        $_go(go.TextBlock,
                            {
                                margin: 0,
                                textAlign: "center",
                                font: "14px  Segoe UI,sans-serif",
                                stroke: "#434445",
                                alignment: go.Spot.MiddleBottom
                            },
                            new go.Binding("text", "text").makeTwoWay())
                    ),

                    $_go(go.Panel, "Vertical",
                        new go.Binding("itemArray", "leftArray"),
                        { row: 1, column: 0,
                            itemTemplate:
                                $_go(go.Panel,
                                    {
                                        _side: "left",  // internal property to make it easier to tell which side it's on
                                        fromSpot: go.Spot.Left,
                                        toSpot: go.Spot.Left,
                                        fromLinkable: true,
                                        toLinkable: true,
                                        cursor: "pointer",
                                        contextMenu: portMenu },
                                    new go.Binding("portId", "portId"),
                                    $_go(go.Shape, "Rectangle",
                                        {
                                            stroke: null,
                                            strokeWidth: 0,
                                            desiredSize: portSize,
                                            margin: new go.Margin(1,0)
                                        },
                                        new go.Binding("fill", "portColor"))
                                )  // end itemTemplate
                        }
                    ),

                    $_go(go.Panel, "Horizontal",
                        new go.Binding("itemArray", "topArray"),
                        { row: 0, column: 1,
                            itemTemplate:
                                $_go(go.Panel,
                                    { _side: "top",
                                        fromSpot: go.Spot.Top, toSpot: go.Spot.Top,
                                        fromLinkable: true, toLinkable: true, cursor: "pointer",
                                        contextMenu: portMenu },
                                    new go.Binding("portId", "portId"),
                                    $_go(go.Shape, "Rectangle",
                                        { stroke: null, strokeWidth: 0,
                                            desiredSize: portSize,
                                            margin: new go.Margin(0, 1) },
                                        new go.Binding("fill", "portColor"))
                                )  // end itemTemplate
                        }
                    ),

                    $_go(go.Panel, "Vertical",
                        new go.Binding("itemArray", "rightArray"),
                        { row: 1, column: 2,
                            itemTemplate:
                                $_go(go.Panel,
                                    { _side: "right",
                                        fromSpot: go.Spot.Right, toSpot: go.Spot.Right,
                                        fromLinkable: true, toLinkable: true, cursor: "pointer",
                                        contextMenu: portMenu },
                                    new go.Binding("portId", "portId"),
                                    $_go(go.Shape, "Rectangle",
                                        { stroke: null, strokeWidth: 0,
                                            desiredSize: portSize,
                                            margin: new go.Margin(1, 0) },
                                        new go.Binding("fill", "portColor"))
                                )  // end itemTemplate
                        }
                    ),

                    $_go(go.Panel, "Horizontal",
                        new go.Binding("itemArray", "bottomArray"),
                        { row: 2, column: 1,
                            itemTemplate:
                                $_go(go.Panel,
                                    { _side: "bottom",
                                        fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,
                                        fromLinkable: true, toLinkable: true, cursor: "pointer",
                                        contextMenu: portMenu },
                                    new go.Binding("portId", "portId"),
                                    $_go(go.Shape, "Rectangle",
                                        { stroke: null, strokeWidth: 0,
                                            desiredSize: portSize,
                                            margin: new go.Margin(0, 1) },
                                        new go.Binding("fill", "portColor"))
                                )  // end itemTemplate
                        }
                    )
                );

            // an orthogonal link template, reshapable and relinkable
            myDiagram.linkTemplate =
                $_go(CustomLink,
                    {
                        routing: go.Link.AvoidsNodes,
                        corner: 4,
                        //curve: go.Link.JumpGap,
                        reshapable: true,
                        resegmentable: true,
                        relinkableFrom: true,
                        relinkableTo: true
                    },
                    new go.Binding("points").makeTwoWay(),
                    $_go(go.Shape, { stroke: "#2F4F4F", strokeWidth: 2 },
                        new go.Binding("stroke", "color").makeTwoWay())
                );

            // support double-clicking in the background to add a copy of this data as a node
            myDiagram.toolManager.clickCreatingTool.archetypeNodeData = {
                key: "Unit",
                leftArray: [],
                rightArray: [],
                topArray: [],
                bottomArray: []
            };

            window.myOverview =
                $_go(go.Overview, "myOverview",
                    { observed: myDiagram, contentAlignment: go.Spot.Center });

            load();
        }

        function CustomLink() {
            go.Link.call(this);
        }

        go.Diagram.inherit(CustomLink, go.Link);

        CustomLink.prototype.findSidePortIndexAndCount = function(node, port) {
            var nodedata = node.data;
            var portdata = port.data;
            var side = port._side;
            var arr = nodedata[side + "Array"];
            var len = arr.length;
            for (var i = 0; i < len; i++) {
                if (arr[i] === portdata) return [i, len];
            }
            return [-1, len];
        };

        /** @override */
        CustomLink.prototype.computeEndSegmentLength = function(node, port, spot, from) {
            var esl = go.Link.prototype.computeEndSegmentLength.call(this, node, port, spot, from);
            var thispt = port.getDocumentPoint(this.computeSpot(from));
            var otherpt = this.getOtherPort(port).getDocumentPoint(this.computeSpot(!from));
            if (Math.abs(thispt.x - otherpt.x) > 20 || Math.abs(thispt.y - otherpt.y) > 20) {
                var info = this.findSidePortIndexAndCount(node, port);
                var idx = info[0];
                var count = info[1];
                if (port._side == "top" || port._side == "bottom") {
                    if (otherpt.x < thispt.x) {
                        return esl + 4 + idx * 8;
                    } else {
                        return esl + (count - idx - 1) * 8;
                    }
                } else {  // left or right
                    if (otherpt.y < thispt.y) {
                        return esl + 4 + idx * 8;
                    } else {
                        return esl + (count - idx - 1) * 8;
                    }
                }
            }
            return esl;
        };

        /** @override */
        CustomLink.prototype.hasCurviness = function() {
            if (isNaN(this.curviness)) return true;
            return go.Link.prototype.hasCurviness.call(this);
        };

        /** @override */
        CustomLink.prototype.computeCurviness = function() {
            if (isNaN(this.curviness)) {
                var fromnode = this.fromNode;
                var fromport = this.fromPort;
                var fromspot = this.computeSpot(true);
                var frompt = fromport.getDocumentPoint(fromspot);
                var tonode = this.toNode;
                var toport = this.toPort;
                var tospot = this.computeSpot(false);
                var topt = toport.getDocumentPoint(tospot);
                if (Math.abs(frompt.x - topt.x) > 20 || Math.abs(frompt.y - topt.y) > 20) {
                    if ((fromspot.equals(go.Spot.Left) || fromspot.equals(go.Spot.Right)) &&
                        (tospot.equals(go.Spot.Left) || tospot.equals(go.Spot.Right))) {
                        var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
                        var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
                        var c = (fromseglen - toseglen) / 2;
                        if (frompt.x + fromseglen >= topt.x - toseglen) {
                            if (frompt.y < topt.y) return c;
                            if (frompt.y > topt.y) return -c;
                        }
                    } else if ((fromspot.equals(go.Spot.Top) || fromspot.equals(go.Spot.Bottom)) &&
                        (tospot.equals(go.Spot.Top) || tospot.equals(go.Spot.Bottom))) {
                        var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
                        var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
                        var c = (fromseglen - toseglen) / 2;
                        if (frompt.x + fromseglen >= topt.x - toseglen) {
                            if (frompt.y < topt.y) return c;
                            if (frompt.y > topt.y) return -c;
                        }
                    }
                }
            }
            return go.Link.prototype.computeCurviness.call(this);
        };


// Add a port to the specified side of the selected nodes.
        function addPort(side) {
            myDiagram.startTransaction("addPort");
            myDiagram.selection.each(function(node) {
                // skip any selected Links
                if (!(node instanceof go.Node)) return;
                // compute the next available index number for the side
                var i = 0;
                while (node.findPort(side + i.toString()) !== node) i++;
                // now this new port name is unique within the whole Node because of the side prefix
                var name = side + i.toString();
                // get the Array of port data to be modified
                var arr = node.data[side + "Array"];
                if (arr) {
                    // create a new port data object
                    var newportdata = {
                        portId: name,
                        portColor: go.Brush.randomColor()
                        // if you add port data properties here, you should copy them in copyPortData above
                    };
                    // and add it to the Array of port data
                    myDiagram.model.insertArrayItem(arr, -1, newportdata);
                }
            });
            myDiagram.commitTransaction("addPort");
        }

// Remove the clicked port from the node.
// Links to the port will be redrawn to the node's shape.
        function removePort(port) {
            myDiagram.startTransaction("removePort");
            var pid = port.portId;
            var arr = port.panel.itemArray;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].portId === pid) {
                    myDiagram.model.removeArrayItem(arr, i);
                    break;
                }
            }
            myDiagram.commitTransaction("removePort");
        }

// Remove all ports from the same side of the node as the clicked port.
        function removeAll(port) {
            myDiagram.startTransaction("removePorts");
            var nodedata = port.part.data;
            var side = port._side;  // there are four property names, all ending in "Array"
            myDiagram.model.setDataProperty(nodedata, side + "Array", []);  // an empty Array
            myDiagram.commitTransaction("removePorts");
        }

// Change the color of the clicked port.
        function changeColor(port) {
            myDiagram.startTransaction("colorPort");
            var data = port.data;
            myDiagram.model.setDataProperty(data, "portColor", go.Brush.randomColor());
            myDiagram.commitTransaction("colorPort");
        }


// Save the model to / load it from JSON text shown on the page itself, not in a database.
        function save() {
            document.getElementById("mySavedModel").value = myDiagram.model.toJson();
            myDiagram.isModified = false;
        }

        function getColor (type, a, b) {
            switch (type){
            case "cloud":
                return "#3189B4";
                break;
            case "firewall":
                return "#d488a2";
                break;
            default :
                return go.Brush.randomColor(a, b);
                break;
            }
        }

        function drawServer (key, name, loc){
            return {
                "key": key,
                "text": name,
                "img": "/images/server.png",
                "loc": loc,
                "size": new go.Size(100, 60),
                "topArray": [],
                "bottomArray": []
            };
        }

        function load() {
            //myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);

            var cswitch1Color = getColor("", 0,50);
            var cswitch2Color = getColor("", 100, 150);
            var switch1Color = getColor("", 0, 50);
            var switch2Color = getColor("", 80, 120);
            var switch3Color = getColor("", 150, 180);
            var switch4Color = getColor("", 0, 150);
            var switch5Color = getColor("", 50, 200);
            var _model = {
                "class": "go.GraphLinksModel",
                "copiesArrays": true,
                "copiesArrayObjects": true,
                "linkFromPortIdProperty": "fromPort",
                "linkToPortIdProperty": "toPort",
                "nodeDataArray": [
                    {
                        "key": "cloud",
                        "text": "Internet",
                        "img": "/images/cloud.png",
                        "loc": "460 150",
                        size: new go.Size(100, 70),
                        "leftArray": [{
                            "portColor": "#3189B4",
                            "portId": "left0"
                        }],
                        "rightArray": [{
                            "portColor": "#3189B4",
                            "portId": "right0"
                        }]
                    },
                    {
                        "key": "firewall1",
                        "text": "防火墙",
                        "img": "/images/firewall.png",
                        "loc": "220 210",
                        size: new go.Size(100, 80),
                        "topArray": [{
                            "portColor": getColor("cloud"),
                            "portId": "top0"
                        }],
                        "bottomArray": [{
                            "portColor": getColor("firewall"),
                            "portId": "bottom0"
                        }]
                    },
                    {
                        "key": "firewall2",
                        "text": "防火墙",
                        "img": "/images/firewall.png",
                        "loc": "700 210",
                        size: new go.Size(100, 80),
                        "topArray": [{
                            "portColor": getColor("cloud"),
                            "portId": "top0"
                        }],
                        "bottomArray": [{
                            "portColor": getColor("firewall"),
                            "portId": "bottom0"
                        }]
                    },
                    {
                        "key": "coreswitch1",
                        "text": "核心交换机",
                        "img": "/images/coreswitch.png",
                        "loc": "220 330",
                        size: new go.Size(100, 80),
                        "topArray": [{
                            "portColor": getColor("firewall"),
                            "portId": "top0"
                        }],
                        "bottomArray": [{
                            "portColor": cswitch1Color,
                            "portId": "bottom0"
                        }]
                    },
                    {
                        "key": "coreswitch2",
                        "text": "核心交换机",
                        "img": "/images/coreswitch.png",
                        "loc": "700 330",
                        size: new go.Size(100, 80),
                        "topArray": [{
                            "portColor": getColor("firewall"),
                            "portId": "top0"
                        }],
                        "bottomArray": [{
                            "portColor": cswitch2Color,
                            "portId": "bottom0"
                        }]
                    }
                ],
                "linkDataArray": [{
                    "from": "cloud",
                    "to": "firewall1",
                    "fromPort": "left0",
                    "toPort": "top0",
                    color: "#3189B4"
                },{
                    "from": "cloud",
                    "to": "firewall2",
                    "fromPort": "right0",
                    "toPort": "top0",
                    color: "#3189B4"
                },{
                    "from": "firewall1",
                    "to": "coreswitch1",
                    "fromPort": "bottom0",
                    "toPort": "top0",
                    color: getColor("firewall")
                },{
                    "from": "firewall2",
                    "to": "coreswitch2",
                    "fromPort": "bottom0",
                    "toPort": "top0",
                    color: getColor("firewall")
                },{
                    "from": "coreswitch1",
                    "to": "switch1",
                    "fromPort": "bottom0",
                    "toPort": "left0",
                    color: cswitch1Color
                },{
                    "from": "coreswitch2",
                    "to": "switch1",
                    "fromPort": "bottom0",
                    "toPort": "right0",
                    color: cswitch2Color
                }]
            };

            var switches = [{
                "key": "switch2",
                "text": "管理网交换机*2",
                "img": "/images/switch.png",
                "loc": "150 450",
                type: "normal",
                "pos": "top",
                size: new go.Size(100, 60),
                "bottomArray": [{
                    "portColor": switch2Color,
                    "portId": "bottom0"
                }]
            },
                {
                    "key": "switch3",
                    "text": "远程管理网交换机*2",
                    "img": "/images/switch.png",
                    "loc": "250 420",
                    "pos": "top",
                    type: "normal",
                    size: new go.Size(100, 80),
                    "bottomArray": [{
                        "portColor": switch3Color,
                        "portId": "bottom0"
                    }]
                },
                {
                    "key": "switch4",
                    "text": "存储网络交换机万兆*2",
                    "img": "/images/switch.png",
                    "loc": "150 750",
                    "pos": "bottom",
                    type: "normal",
                    size: new go.Size(100, 80),
                    "topArray": [{
                        "portColor": switch4Color,
                        "portId": "top0"
                    }]
                }, {
                    "key": "switch5",
                    "text": "租户网络交换机万兆*2",
                    "img": "/images/switch.png",
                    "loc": "250 780",
                    "pos": "bottom",
                    type: "normal",
                    size: new go.Size(100, 80),
                    "topArray": [{
                        "portColor": switch5Color,
                        "portId": "top0"
                    }]
                },{
                    "key": "switch1",
                    "text": "业务网交换机*2",
                    "img": "/images/switch.png",
                    "loc": "460 390",
                    type: "business",
                    size: new go.Size(100, 60),
                    "leftArray": [{
                        "portColor": cswitch1Color,
                        "portId": "left0"
                    }],
                    "rightArray":[{
                        "portColor": cswitch2Color,
                        "portId": "right0"
                    }],
                    "bottomArray": [{
                        "portColor": switch1Color,
                        "portId": "bottom0"
                    }]
                }
            ];

            _model.nodeDataArray = _model.nodeDataArray.concat(switches);


            // backendSrv.get("topo").then(function (results) {
            var results = {"message": "Success", "code": 200, "data": [{"ip":
            "240.0.0.1;192.168.138.52;192.168.0.3;192.168.1.2;192.168.122.1;10.20.0.3",
                "hostname": "node-1", "role": "manage"}, {"ip":
            "240.0.0.1;192.168.138.52;192.168.0.3;192.168.1.2;192.168.122.1;10.20.0.3",
                    "hostname": "node-1", "role": "compute"}, {"ip":
            "240.0.0.1;192.168.138.52;192.168.0.3;192.168.1.2;192.168.122.1;10.20.0.3",
                        "hostname": "node-1", "role": "manage"}, {"ip":
            "240.0.0.1;192.168.138.52;192.168.0.3;192.168.1.2;192.168.122.1;10.20.0.3",
                            "hostname": "node-1", "role": "compute"}, {"ip": "192.168.137.14;192.168.122.1",
                                "hostname": "node14", "role": "compute"},{"ip": "192.168.137.15;192.168.122.1",
                                    "hostname": "node15", "role": "compute"}]};
            var hostInfo = results.data;
            _.forEach(hostInfo, function (item, index) {
                var loc = (200+200*(index+1)) + " 620";
                if(hostInfo.length > 5){
                    loc = (200+100*(index+1)) + " 620";
                }

                var prefixS = item.role === "compute"?"计算":"管理";
                var node = drawServer(item.hostname+index , item.hostname+"("+prefixS+")", loc);
                _.forEach(switches, function (sw, x) {
                    if(sw.type === "business"){
                        if(item.role === "manage"){
                            node.topArray.push({
                                "portColor": sw.bottomArray[0].portColor,
                                "portId": "top"+x
                            });
                            var link = {
                                "from": sw.key,
                                "to": node.key,
                                "fromPort": "bottom0",
                                "toPort": "top"+x,
                                color: sw.bottomArray[0].portColor
                            };
                            _model.linkDataArray.push(link);
                        }
                    }else{
                        if(sw.pos === "top"){
                            node.topArray.push({
                                "portColor": sw.bottomArray[0].portColor,
                                "portId": "top"+x
                            });
                            var link = {
                                "from": sw.key,
                                "to": node.key,
                                "fromPort": "bottom0",
                                "toPort": "top"+x,
                                color: sw.bottomArray[0].portColor
                            };
                            _model.linkDataArray.push(link);
                        }else{
                            node.bottomArray.push({
                                "portColor": sw.topArray[0].portColor,
                                "portId": "bottom"+x
                            });
                            var link = {
                                "from": sw.key,
                                "to": node.key,
                                "fromPort": "top0",
                                "toPort": "bottom"+x,
                                color: sw.topArray[0].portColor
                            };
                            _model.linkDataArray.push(link);
                        }
                    }
                });
                _model.nodeDataArray.push(node);
            });
            _.extend(myDiagram.model, _model);
            // });
        }

        init();
    });
