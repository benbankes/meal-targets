var TargetFactory = (function () {
    function TargetFactory(startBreakfastAt, beInBedAt, mealCount, mealIntervalHours) {
        if (mealCount === void 0) { mealCount = 0; }
        if (mealIntervalHours === void 0) { mealIntervalHours = 0; }
        this.targets = [];
        if (mealCount === 0 && mealIntervalHours === 0) {
            throw new Error('Either mealCount or mealIntervalHours must be specified');
        }
        if (mealCount !== 0 && mealIntervalHours !== 0) {
            throw new Error('Specifying mealCount and mealIntervalHours simultaneously is not allowed');
        }
        if (startBreakfastAt > beInBedAt) {
            throw new Error('Time to be in bed must be after the start of breakfast');
        }
        var allowedMealIntervals = [1.5, 2, 2.5, 3, 3.5];
        if (mealIntervalHours !== 0 && allowedMealIntervals.indexOf(mealIntervalHours) < 0) {
            throw new Error('Meal intervals are only allowed to be ' + allowedMealIntervals.join(', '));
        }
        this.startBreakfastAt = startBreakfastAt;
        this.nextTargetStartTime = startBreakfastAt;
        this.beInBedAt = beInBedAt;
        this.mealCount = mealCount;
        this.mealIntervalHours = mealIntervalHours;
    }
    TargetFactory.prototype.createTargets = function () {
        if (this.useMealCountStrategy()) {
            return this.createTargetsGivenMealCount();
        }
        else {
            return this.createTargetsGivenMealIntervals();
        }
    };
    TargetFactory.prototype.createTargetsGivenMealIntervals = function () {
        this.nextTargetStartTime = this.startBreakfastAt;
        var mealCount = this.calculateMealCount();
        for (var ithInterval = 1; ithInterval <= mealCount; ithInterval++) {
            var target = new TargetEntity();
            target.setIcon('bagel');
            target.setTime(new Date(this.nextTargetStartTime.getTime()));
            this.targets.push(target);
            var duration = this.mealIntervalHours * 1000 * 60 * 60;
            this.nextTargetStartTime.setTime(this.nextTargetStartTime.getTime() + duration);
        }
        return this.targets;
    };
    TargetFactory.prototype.calculateMealCount = function () {
        return Math.floor(this.calculateDivisibleHours() / this.mealIntervalHours) + 1;
    };
    TargetFactory.prototype.calculateLastMealStartTime = function () {
        var oneHoursOfMilliseconds = 1000 * 60 * 60;
        return new Date(this.beInBedAt.getTime() - oneHoursOfMilliseconds);
    };
    TargetFactory.prototype.calculateDivisibleHours = function () {
        var waketime = this.calculateLastMealStartTime() - this.startBreakfastAt;
        var waketimeMinutes = new Date(waketime).getMinutes();
        var waketimeSeconds = new Date(waketime).getSeconds();
        var waketimeMilliseconds = new Date(waketime).getMilliseconds();
        if ([0, 30].indexOf(waketimeMinutes) < 0 || waketimeSeconds !== 0 || waketimeMilliseconds !== 0) {
            alert('Error: Times need to be in half-hour increments');
            throw new Error('The time between the first feeding (breakfast) and the start of the last feeding (one hour before bedtime) must be divisible into 1/2-hour increments');
        }
        return waketime / (1000 * 60 * 60);
    };
    TargetFactory.prototype.countIntervalCutsToMake = function () {
        return this.mealCount - 1;
    };
    TargetFactory.prototype.calculateMealIntervalHours = function () {
        var unroundedIntervalHours = this.calculateDivisibleHours() / this.countIntervalCutsToMake();
        return Math.floor(unroundedIntervalHours * 2) / 2;
    };
    TargetFactory.prototype.createTargetsGivenMealCount = function () {
        var intervalHours = this.calculateMealIntervalHours();
        var remainderHours = this.calculateDivisibleHours() - intervalHours * this.countIntervalCutsToMake();
        var countExpandedTargets = remainderHours * 2;
        var remainingExpandedTargets = countExpandedTargets;
        for (var ithInterval = 1; ithInterval <= this.mealCount; ithInterval++) {
            var target = new TargetEntity();
            var thisIntervalHours = (remainingExpandedTargets) ? intervalHours + 0.5 : intervalHours;
            if (remainingExpandedTargets) {
                remainingExpandedTargets -= 1;
            }
            target.setIcon('bagel');
            target.setTime(new Date(this.nextTargetStartTime.getTime()));
            this.targets.push(target);
            this.nextTargetStartTime.setTime(this.nextTargetStartTime.getTime() + thisIntervalHours * 60 * 60 * 1000);
        }
        return this.targets;
    };
    TargetFactory.prototype.useMealCountStrategy = function () {
        return (this.mealCount);
    };
    return TargetFactory;
}());
var TargetEntity = (function () {
    function TargetEntity() {
        this.icon = 'apple';
    }
    TargetEntity.prototype.getTimeString = function () {
        var isAm = this.time.getHours() < 12;
        var hours = (this.time.getHours() <= 12) ? this.time.getHours() : this.time.getHours() - 12;
        var doPadMinutes = (this.time.getMinutes() < 10);
        var minutes = (doPadMinutes) ? '0' + this.time.getMinutes() : this.time.getMinutes();
        var amPm = (isAm) ? 'am' : 'pm';
        return hours + ':' + minutes + ' ' + amPm;
    };
    TargetEntity.prototype.setIcon = function (icon) {
        this.icon = icon;
    };
    TargetEntity.prototype.getIcon = function () {
        return this.icon;
    };
    TargetEntity.prototype.setTime = function (time) {
        this.time = time;
    };
    return TargetEntity;
}());
var TargetCollection = (function () {
    function TargetCollection(targets) {
        this.targets = [];
        this.addTargets(targets);
    }
    TargetCollection.prototype.addTarget = function (target) {
        this.targets.push(target);
    };
    TargetCollection.prototype.addTargets = function (targets) {
        targets.map(function (target) {
            this.addTarget(target);
        }, this);
    };
    return TargetCollection;
}());
var Target = React.createClass({
    render: function () {
        var source = "./assets/img/" + this.props.icon + ".png";
        return (React.createElement("div", null, React.createElement("img", {height: "50px", width: "50px", src: source}), React.createElement("span", null, this.props.duration)));
    }
});
var TargetList = React.createClass({
    render: function () {
        return (React.createElement("div", null, this.props.items.targets.map(function (item, i) {
            return (React.createElement(Target, {icon: item.getIcon(), duration: item.getTimeString()}));
        }, this)));
    }
});
$(function () {
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
function getDateStingFromDate(date) {
    var month = date.getMonth() + 1;
    var monthString = (month > 9) ? month : '0' + month;
    var day = date.getDate();
    var dayString = (day > 9) ? day : '0' + day;
    return date.getFullYear() + '-' + monthString + '-' + dayString;
}
function doit() {
    var numberOfMeals = document.getElementById('inpNumberOfMeals').value;
    var valBreakfastAt = document.getElementById('inpBreakfastAt').value;
    var valBeInBedAt = document.getElementById('inpBeInBedAt').value;
    var now = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    var breakfastDateString = getDateStingFromDate(now);
    var beInBedAtDateString = breakfastDateString;
    if (valBeInBedAt <= valBreakfastAt) {
        beInBedAtDateString = getDateStingFromDate(tomorrow);
    }
    var dateBreakfastAt = new Date(breakfastDateString + ' ' + valBreakfastAt);
    var dateBeInBedAt = new Date(beInBedAtDateString + ' ' + valBeInBedAt);
    var targets = [];
    try {
        targets = new TargetFactory(dateBreakfastAt, dateBeInBedAt, numberOfMeals).createTargets();
    }
    catch (e) {
    }
    var theTargetCollection = new TargetCollection(targets);
    ReactDOM.render(React.createElement(TargetList, {items: theTargetCollection}), document.getElementById('example'));
}
doit();
//# sourceMappingURL=script.js.map