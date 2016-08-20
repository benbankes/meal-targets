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

        let allowedMealIntervals = [1.5, 2, 2.5, 3, 3.5];

        if (mealIntervalHours !== 0 && allowedMealIntervals.indexOf(mealIntervalHours) < 0) {
            throw new Error('Meal intervals are only allowed to be ' + allowedMealIntervals.join(', '));
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
            return this.createTargetsGivenMealIntervals();
        }
    }

    private createTargetsGivenMealIntervals() {
        this.nextTargetStartTime = this.startBreakfastAt;

        let mealCount = this.calculateMealCount();

        for (let ithInterval = 1; ithInterval <= mealCount; ithInterval++) {
            let target = new TargetEntity();
            target.setIcon('bagel');
            target.setTime(new Date(this.nextTargetStartTime.getTime()));

            this.targets.push(target);

            let duration = this.mealIntervalHours * 1000 * 60 * 60;

            this.nextTargetStartTime.setTime(this.nextTargetStartTime.getTime() + duration);
        }

        return this.targets;
    }

    private calculateMealCount() {
        return Math.floor(this.calculateDivisibleHours() / this.mealIntervalHours) + 1;
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
            alert('Error: Times need to be in half-hour increments');
            throw new Error('The time between the first feeding (breakfast) and the start of the last feeding (one hour before bedtime) must be divisible into 1/2-hour increments');
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
        let remainingExpandedTargets = countExpandedTargets;

        for (let ithInterval = 1; ithInterval <= this.mealCount; ithInterval++) {
            let target = new TargetEntity();
            let thisIntervalHours = (remainingExpandedTargets) ? intervalHours + 0.5 : intervalHours;

            if (remainingExpandedTargets) {
                remainingExpandedTargets -= 1;
            }

            target.setIcon('bagel');
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
    private icon = 'apple';
    private time: Date;

    getTimeString() {
        let isAm = this.time.getHours() < 12;
        let hours = (this.time.getHours() <= 12) ? this.time.getHours() : this.time.getHours() - 12;
        let doPadMinutes = (this.time.getMinutes() < 10);
        let minutes = (doPadMinutes) ? '0' + this.time.getMinutes() : this.time.getMinutes();
        let amPm = (isAm) ? 'am' : 'pm';

        return hours + ':' + minutes + ' ' + amPm;
    }

    setIcon(icon) {
        this.icon = icon;
    }
    
    getIcon() {
        return this.icon;
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

let Target = React.createClass({
    render: function () {
        let source = "./assets/img/" + this.props.icon + ".png";

        return (
            <div>
                <img height="50px" width="50px" src={source}/>
                <span>{this.props.duration}</span>
            </div>
        );
    }
});

let TargetList = React.createClass({
    render: function () {
        return (
            <div>
                {this.props.items.targets.map(function (item, i) {
                    return (
                        <Target icon={item.getIcon()} duration={item.getTimeString()}/>
                    );
                }, this)}
            </div>
        );
    }
});

$(function() {
    var configs = {
        date: false,
        format: 'HH:mm'
    };

    $('#inpBreakfastAt').bootstrapMaterialDatePicker(configs);
    $('#inpBeInBedAt').bootstrapMaterialDatePicker(configs);
});

document.getElementById('inpNumberOfMeals').onchange = doit;
document.getElementById('inpBreakfastAt').onchange = doit;
document.getElementById('inpBeInBedAt').onchange = doit;

function getDateStingFromDate(date:Date) {
    let month = date.getMonth() + 1;
    let monthString = (month > 9) ? month : '0' + month;
    let day = date.getDate();
    let dayString = (day > 9) ? day : '0' + day;

    return date.getFullYear() + '-' + monthString + '-' + dayString;
}

function doit() {
    let numberOfMeals = document.getElementById('inpNumberOfMeals').value;

    let valBreakfastAt = document.getElementById('inpBreakfastAt').value;
    let valBeInBedAt = document.getElementById('inpBeInBedAt').value;

    let now = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    let breakfastDateString = getDateStingFromDate(now);
    let beInBedAtDateString = breakfastDateString;

    if (valBeInBedAt <= valBreakfastAt) {
        beInBedAtDateString = getDateStingFromDate(tomorrow);
    }

    let dateBreakfastAt = new Date(breakfastDateString + ' ' + valBreakfastAt);
    let dateBeInBedAt = new Date(beInBedAtDateString + ' ' + valBeInBedAt);

    let targets = [];

    try {
        targets = new TargetFactory(dateBreakfastAt, dateBeInBedAt, numberOfMeals).createTargets();
    } catch (e) {
        // Continue
    }

    let theTargetCollection = new TargetCollection(targets);

    ReactDOM.render(
        <TargetList items={theTargetCollection}/>,
        document.getElementById('example')
    );
}

doit();
