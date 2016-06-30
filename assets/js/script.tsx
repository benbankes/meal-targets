class TargetEntity {
    icon = 'apple';
    duration = 0;
    time: Date;

    constructor(pojo) {
        this.icon = (pojo) ? pojo.icon : this.icon;
        this.duration = (pojo) ? pojo.duration : this.duration;
    }

    getTime() {
        var isAm = this.time.getHours() < 12;
        var hours = (isAm) ? this.time.getHours() : this.time.getHours() - 12;
        var doPadMinutes = (this.time.getMinutes() < 10);
        var minutes = (doPadMinutes) ? '0' + this.time.getMinutes() : this.time.getMinutes();
        var amPm = (isAm) ? 'am' : 'pm';

        return hours + ':' + minutes + ' ' + amPm;
    }
}

class TargetCollection {
    targetTime: Date;
    targets = [];

    constructor(targets:Array) {
        var firstTargetTime = new Date();
        firstTargetTime.setHours(6, 0, 0, 0);
        this.targetTime = firstTargetTime;
        this.addTargets(targets);
    }

    addTarget(target: TargetEntity) {
        this.targetTime.setMinutes(this.targetTime.getMinutes() + target.duration * 60);
        target.time = new Date(this.targetTime.getTime());
        this.targets.push(target);
    }

    addTargets(targets: Array) {
        targets.map(function(target) {
            this.addTarget(target);
        }, this);
    }
}

var targets = [
    new TargetEntity({icon: 'cereal', duration: 2.5}),
    new TargetEntity({icon: 'apple', duration: 2.5}),
    new TargetEntity({icon: 'bagel', duration: 3}),
];

var theTargetCollection = new TargetCollection(targets);

var Target = React.createClass({
    render: function () {
        var source = "./assets/img/" + this.props.icon + ".png";

        return (
            <div>
                <img height="50px" width="50px" src={source}/>
                <span>{this.props.duration}</span>
            </div>
        );
    }
});

var TargetList = React.createClass({
    render: function () {
        return (
            <div>
                {this.props.items.targets.map(function (item, i) {
                    return (
                        <Target icon={item.icon} duration={item.getTime()}/>
                    );
                }, this)}
            </div>
        );
    }
});

ReactDOM.render(
    <TargetList items={theTargetCollection}/>,
    document.getElementById('example')
);
