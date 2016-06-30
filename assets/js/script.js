var TargetEntity = (function () {
    function TargetEntity(pojo) {
        this.icon = 'apple';
        this.duration = 0;
        this.icon = (pojo) ? pojo.icon : this.icon;
        this.duration = (pojo) ? pojo.duration : this.duration;
    }
    TargetEntity.prototype.getTime = function () {
        var isAm = this.time.getHours() < 12;
        var hours = (isAm) ? this.time.getHours() : this.time.getHours() - 12;
        var doPadMinutes = (this.time.getMinutes() < 10);
        var minutes = (doPadMinutes) ? '0' + this.time.getMinutes() : this.time.getMinutes();
        var amPm = (isAm) ? 'am' : 'pm';
        return hours + ':' + minutes + ' ' + amPm;
    };
    return TargetEntity;
}());
var TargetCollection = (function () {
    function TargetCollection(targets) {
        this.targets = [];
        var firstTargetTime = new Date();
        firstTargetTime.setHours(6, 0, 0, 0);
        this.targetTime = firstTargetTime;
        this.addTargets(targets);
    }
    TargetCollection.prototype.addTarget = function (target) {
        this.targetTime.setMinutes(this.targetTime.getMinutes() + target.duration * 60);
        target.time = new Date(this.targetTime.getTime());
        this.targets.push(target);
    };
    TargetCollection.prototype.addTargets = function (targets) {
        targets.map(function (target) {
            this.addTarget(target);
        }, this);
    };
    return TargetCollection;
}());
var targets = [
    new TargetEntity({ icon: 'cereal', duration: 2.5 }),
    new TargetEntity({ icon: 'apple', duration: 2.5 }),
    new TargetEntity({ icon: 'bagel', duration: 3 }),
];
var theTargetCollection = new TargetCollection(targets);
var Target = React.createClass({
    render: function () {
        var source = "./assets/img/" + this.props.icon + ".png";
        return (React.createElement("div", null, React.createElement("img", {height: "50px", width: "50px", src: source}), React.createElement("span", null, this.props.duration)));
    }
});
var TargetList = React.createClass({
    render: function () {
        return (React.createElement("div", null, this.props.items.targets.map(function (item, i) {
            return (React.createElement(Target, {icon: item.icon, duration: item.getTime()}));
        }, this)));
    }
});
ReactDOM.render(React.createElement(TargetList, {items: theTargetCollection}), document.getElementById('example'));
//# sourceMappingURL=script.js.map