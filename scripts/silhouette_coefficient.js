/*
 * David Lettier
 * (C) 2015
 * http://www.lettier.com/
*/

function SilhouetteCoefficient(params) {
  this.dataPointClusterMembersFunction = params.dataPointClusterMembersFunction;
  this.dataPointNearestClusterMembersFunction = params.dataPointNearestClusterMembersFunction;
  this.distanceFunction = params.distanceFunction;
}

SilhouetteCoefficient.prototype.meanDistance = function (dataPointA, dataPoints) {
  var that = this;
  var distances = dataPoints.map(function (dataPointB) {
    return that.distanceFunction(dataPointA, dataPointB);
  });

  if (distances.length === 0) {return 0.0;}

  return distances.reduce(function (x, y) {return x + y;}) / distances.length;
};

SilhouetteCoefficient.prototype.a = function (dataPoint) {
  var dataPointClusterMembers = this.dataPointClusterMembersFunction(dataPoint);

  return this.meanDistance(dataPoint, dataPointClusterMembers);
};

SilhouetteCoefficient.prototype.b = function(dataPoint) {
  var dataPointNearestClusterMembers = this.dataPointNearestClusterMembersFunction(
    dataPoint
  );

  return this.meanDistance(dataPoint, dataPointNearestClusterMembers);
};

SilhouetteCoefficient.prototype.s = function (a, b) {
  var max = Math.max(a, b);
  if (max === 0) {return 0.0;}

  return (b - a) / max;
};

SilhouetteCoefficient.prototype.dataPoint = function (dataPoint) {
  var a = this.a(dataPoint);
  var b = this.b(dataPoint);
  var s = this.s(a, b);

  dataPoint.silhouetteCoefficient = s;

  return s;
};

SilhouetteCoefficient.prototype.dataPoints = function (dataPoints, onComplete) {
  var that = this;
  var cycle = function cycle() {
    var score = 0.0;
    if (that.dataPointsIndex === -1) {
      if (that.scores.length === 0) {return score;}
      score = that.scores.reduce(
        function (x, y) {return x + y;}
      ) / that.scores.length;
      that.onComplete(score);
      return score;
    } else {
      that.scores.push(
        that.dataPoint(
          that.dataPoints[that.dataPointsIndex]
        )
      );
      that.dataPointsIndex -= 1;
      window.requestAnimationFrame(cycle);
    }
  };

  if (typeof onComplete === 'undefined') {
      this.onComplete = function (score) {};
  } else {
    this.onComplete = onComplete;
  }
  if (typeof dataPoints === 'undefined') {this.onComplete(0.0);}

  this.dataPoints = dataPoints;
  this.dataPointsIndex = dataPoints.length - 1;
  this.scores = [];

  window.requestAnimationFrame(cycle);
};

SilhouetteCoefficient.prototype.cluster = function (clusterDataPoints, onComplete) {
  this.dataPoints(clusterDataPoints, onComplete);
};

SilhouetteCoefficient.prototype.model = function (modelDataPoints, onComplete) {
  this.dataPoints(modelDataPoints, onComplete);
};
