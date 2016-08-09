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
            target.icon = 'bagel';
            target.setTime(new Date(this.nextTargetStartTime.getTime()));
            this.targets.push(target);
            var duration = this.mealIntervalHours * 1000 * 60 * 60;
            this.nextTargetStartTime.setTime(this.nextTargetStartTime.getTime() + duration);
        }
        return this.targets;
    };
    TargetFactory.prototype.calculateMealCount = function () {
        console.log(this.calculateDivisibleHours());
        console.log(this.mealIntervalHours);
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
            throw new Error('The time between the first feeding (breakfast) and the start of the last feeding (one hour before bedtime) must be divisible into 1/4-hour increments');
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
        for (var ithInterval = 1; ithInterval <= this.mealCount; ithInterval++) {
            var target = new TargetEntity();
            var remainingIntervals = this.mealCount - ithInterval + 1;
            var thisIntervalHours = (remainingIntervals > countExpandedTargets) ? intervalHours : intervalHours + 0.5;
            target.icon = 'bagel';
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
        this.duration = 0;
    }
    TargetEntity.prototype.getTimeString = function () {
        var isAm = this.time.getHours() < 12;
        var hours = (isAm) ? this.time.getHours() : this.time.getHours() - 12;
        var doPadMinutes = (this.time.getMinutes() < 10);
        var minutes = (doPadMinutes) ? '0' + this.time.getMinutes() : this.time.getMinutes();
        var amPm = (isAm) ? 'am' : 'pm';
        return hours + ':' + minutes + ' ' + amPm;
    };
    TargetEntity.prototype.setIcon = function (icon) {
        this.icon = icon;
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
var targets = new TargetFactory(new Date('2016-08-08 03:30'), new Date('2016-08-08 22:30'), undefined, 2.5).createTargets();
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
            return (React.createElement(Target, {icon: item.icon, duration: item.getTimeString()}));
        }, this)));
    }
});
ReactDOM.render(React.createElement(TargetList, {items: theTargetCollection}), document.getElementById('example'));
//# sourceMappingURL=script.js.map