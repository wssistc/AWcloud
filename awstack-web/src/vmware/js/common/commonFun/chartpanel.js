let PiePanelDefault = function() {
    this.panels = {
        colors: ["#51a3ff", "#4e80f5", "#1bbc9d", "#b6a2dd", "#e67f23", "#c0392b", "#ff754a", "#f39c12", "#b675de"],
        type: "pie",
        width: 200,
        height: 200,
        outerRadius: 75,
        innerRadius: 50,
        data: [],
        title: "",
        id: "",
        pieType: "",
        progressRate: true
    };
};

let AreaPanelDefault = function() {
    this.panels = {
        colors: ["#4e80f5", "#1bbc9d", "#b6a2dd", "#e67f23"],
        type: "area",
        width: 550,
        height: 220,
        margin: {
            left: 60,
            right: 15,
            top: 15,
            bottom: 30
        },
        unit: "",
        data: [],
        title: "",
        subTitle: "",
        priority: ""
    };
};

export {PiePanelDefault,AreaPanelDefault};