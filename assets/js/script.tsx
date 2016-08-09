class TargetFactory {
    private nextTargetStartTime:Date;
    private startBreakfastAt:Date;
    private beInBedAt:Date;
    private mealCount:Number;
    private mealIntervalHours:Number;
    private targets = [];

    constructor(startBreakfastAt:Date, beInBedAt:Date, mealCount:Number = 0, mealIntervalHours:Number = 0) {
        if (mealCount === 0 && mealIntervalHours === 0) {
            throw new Error('Either mealCount or mealIntervalHours must be specified');
        }

        if (mealCount !== 0 && mealIntervalHours !== 0) {
            throw new Error('Specifying mealCount and mealIntervalHours simultaneously is not allowed');
        }

        if (startBreakfastAt > beInBedAt) {
            throw new Error('Time to be in bed must be after the start of breakfast');
        }

        this.startBreakfastAt = startBreakfastAt;
        this.nextTargetStartTime = startBreakfastAt;
        this.beInBedAt = beInBedAt;
        this.mealCount = mealCount;
        this.mealIntervalHours = mealIntervalHours;
    }

    createTargets() {
        if (this.useMealCountStrategy()) {
            return this.createTargetsGivenMealCount();
        } else {
            // this.createTargetsGivenMealIntervals();
        }
    }

    private calculateLastMealStartTime() {
        let oneHoursOfMilliseconds = 1000 * 60 * 60;
        return new Date(this.beInBedAt.getTime() - oneHoursOfMilliseconds);
    }

    private calculateDivisibleHours() {
        let waketime = this.calculateLastMealStartTime() - this.startBreakfastAt;
        let waketimeMinutes = new Date(waketime).getMinutes();
        let waketimeSeconds = new Date(waketime).getSeconds();
        let waketimeMilliseconds = new Date(waketime).getMilliseconds();

        if ([0, 30].indexOf(waketimeMinutes) < 0 || waketimeSeconds !== 0 || waketimeMilliseconds !== 0) {
            throw new Error('The time between the first feeding (breakfast) and the start of the last feeding (one hour before bedtime) must be divisible into 1/4-hour increments');
        }

        return waketime / (1000 * 60 * 60);
    }

    private countIntervalCutsToMake() {
        return this.mealCount - 1;
    }

    private calculateMealIntervalHours() {
        let unroundedIntervalHours = this.calculateDivisibleHours() / this.countIntervalCutsToMake();

        return Math.floor(unroundedIntervalHours * 2) / 2;
    }

    private createTargetsGivenMealCount() {
        let intervalHours = this.calculateMealIntervalHours();
        let remainderHours = this.calculateDivisibleHours() - intervalHours * this.countIntervalCutsToMake();
        let countExpandedTargets = remainderHours * 2;

        for (let ithInterval = 1; ithInterval <= this.mealCount; ithInterval++) {
            let target = new TargetEntity();
            let remainingIntervals = this.mealCount - ithInterval + 1;
            let thisIntervalHours = (remainingIntervals > countExpandedTargets) ? intervalHours : intervalHours + 0.5;

            target.icon = 'bagel';
            target.setTime(new Date(this.nextTargetStartTime.getTime()));

            this.targets.push(target);

            this.nextTargetStartTime.setTime(this.nextTargetStartTime.getTime() + thisIntervalHours * 60 * 60 * 1000);
        }

        return this.targets;
    }

    private useMealCountStrategy() {
        return (this.mealCount);
    }
}

class TargetEntity {
    icon = 'apple';
    duration = 0;
    private time: Date;

    getTimeString() {
        var isAm = this.time.getHours() < 12;
        var hours = (isAm) ? this.time.getHours() : this.time.getHours() - 12;
        var doPadMinutes = (this.time.getMinutes() < 10);
        var minutes = (doPadMinutes) ? '0' + this.time.getMinutes() : this.time.getMinutes();
        var amPm = (isAm) ? 'am' : 'pm';

        return hours + ':' + minutes + ' ' + amPm;
    }

    setIcon(icon) {
        this.icon = icon;
    }

    setTime(time:Date) {
        this.time = time;
    }
}

class TargetCollection {
    targets = [];

    constructor(targets:Array) {
        this.addTargets(targets);
    }

    addTarget(target: TargetEntity) {
        this.targets.push(target);
    }

    addTargets(targets: Array) {
        targets.map(function(target) {
            this.addTarget(target);
        }, this);
    }
}

var targets = new TargetFactory(new Date('2016-08-08 03:30'), new Date('2016-08-08 21:30'), 7).createTargets();

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
                        <Target icon={item.icon} duration={item.getTimeString()}/>
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
