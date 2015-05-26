/*
 * David Lettier
 * (C) 2015
 * http://www.lettier.com/
*/

function KMeans(params) {
  var defaultParams = {
    maxIterations: 10,
    k: 10,
    dataPoints: [],
    means: [],
    onIterate: function (that) {},
    onComplete: function (that) {}
  };

  for (var key in defaultParams) {
    this[key] = defaultParams[key];
    if (params[key] !== undefined) this[key] = params[key];
  }

  this.maxIterations = Math.round(this.maxIterations);
  this.k = Math.round(this.k);

  this.converged = false;
  this.clusters = [];
}

KMeans.prototype.featureBounds = function () {
  if (this.dataPoints.length === 0) {
    this.featuresMin = 0;
    this.featuresMax = 0;
    return;
  }
  this.featureLength = this.dataPoints[0].features.length;
  var k = this.k;

  var featuresMin = [];
  var featuresMax = [];
  var i = this.featureLength;
  while (i--) {
    featuresMin.push([]);
    featuresMax.push([]);
  }

  for (i=0; i<this.dataPoints.length; ++i) {
    var dataPoint = this.dataPoints[i];
    for (var j=0; j<this.featureLength; ++j) {
      featuresMin[j].push(
        dataPoint.features[j]
      );
      featuresMax[j].push(
        dataPoint.features[j]
      );
    }
  }
  i = this.featureLength;
  while (i--) {
    min = Math.min.apply(null, featuresMin[i]);
    max = Math.max.apply(null, featuresMax[i]);
    featuresMin[i] = min;
    featuresMax[i] = max;
  }

  this.featuresMin = featuresMin;
  this.featuresMax = featuresMax;
};

KMeans.prototype.euclideanDistance = function (a, b) {
  var sum = 0;
  var size = a.features.length;
  var i = 0;
  while (size--) {
    var delta = Math.pow((a.features[i] - b.features[i]), 2);
    sum += delta;
    i += 1;
  }
  return Math.sqrt(sum);
};

KMeans.prototype.compareEuclideanDistances = function (a, b) {
  if (a.euclideanDistance < b.euclideanDistance) {
    return -1;
  }
  if (a.euclideanDistance > b.euclideanDistance) {
    return 1;
  }
  return 0;
};

KMeans.prototype.meanFeatures = function (dataPoints) {
  var averages = [];
  var i = this.featureLength;

  if (dataPoints.length === 0) {

    while (i--) {
      var min = this.featuresMin[i];
      var max = this.featuresMax[i];
      var value = randomValueInRange(max, min);
      averages.unshift(value);
    }

    return averages;
  }

  for (i=0; i<this.featureLength; ++i) {
    averages.push([]);
  }

  for (i=0; i<dataPoints.length; ++i) {
    var dataPoint = dataPoints[i];
    for (var j=0; j<this.featureLength; ++j) {
      var feature = dataPoint.features[j];
      averages[j].push(feature);
    }
  }

  function sum(a, b) {
    return a + b;
  }

  for (i=0; i<averages.length; ++i) {
    var length = averages[i].length;
    var sum_ = averages[i].reduce(sum);
    var average = sum_ / length;
    averages[i] = average;
  }

  return averages;
};

KMeans.prototype.initializeMeans = function (method) {
  if (method === 0) {
    this.initializeMeansMethod0();
  } else {
    this.initializeMeansMethod1();
  }
};

KMeans.prototype.initializeMeansMethod0 = function () {
  if (this.means.length == this.k) {
    return;
  }

  this.means.length = 0;

  var k = this.k;
  while (k--) {
    var i = this.featureLength;
    var mean = new Mean();
    mean.id = k;
    while (i--) {
      var min = this.featuresMin[i];
      var max = this.featuresMax[i];
      var value = randomValueInRange(max, min);
      mean.features.unshift(value);
    }
    this.means.push(mean);
  }
};

/*
* An initial seed selection algorithm for
* k-means clustering of georeferenced data
* to improve replicability of cluster
* assignments for mapping application
*
* By: Fouad Khan
*
* https://www.academia.edu/5988806/
* An_initial_seed_selection_algorithm_
* for_k-means_clustering_of_georeferenced_
* data_to_improve_replicability_of_cluster_
* assignments_for_mapping_application
*/

KMeans.prototype.initializeMeansMethod1 = function () {
  var mean = null;
  var magnitudeSortedDataPoints = [];
  var consecutiveDataPointDistances = [];
  var sortedConsecutiveDataPointDistances = [];
  var upperBoundIndexes = [];
  var lowerBoundIndexes = [];
  var upperLowerBoundDataPoints = [];
  var i = 0;

  function ConsecutiveDataPointDistance(dataPoint, distance, index) {
    this.dataPoint = dataPoint;
    this.distance = distance;
    this.index = index;
  }

  function magnitude(dataPoint) {
    var squareSum = 0;
    var i = 0;
    for (i=0; i<dataPoint.features.length; ++i) {
      squareSum += Math.pow(dataPoint.features[i], 2);
    }
    return Math.sqrt(squareSum);
  }

  function compareDataPointMagnitudes(a, b) {
    if (a.magnitude < b.magnitude) {
      return -1;
    }
    if (a.magnitude > b.magnitude) {
      return 1;
    }
    return 0;
  }

  function compareConsecutiveDataPointDistances(a, b) {
    if (a.distance < b.distance) {
      return 1;
    }
    if (a.distance > b.distance) {
      return -1;
    }
    return 0;
  }

  if (this.means.length == this.k) {
    return;
  }

  this.means.length = 0;

  this.dataPoints.forEach(function (dataPoint) {
    dataPoint.magnitude = magnitude(dataPoint);
  });

  magnitudeSortedDataPoints = this.dataPoints.sort(
    compareDataPointMagnitudes
  );

  if (magnitudeSortedDataPoints.length === 0) {return;}

  if (magnitudeSortedDataPoints.length === 1) {
      mean = new Mean();
      mean.id = 0;
      mean.features = magnitudeSortedDataPoints[0].features;
      this.means.push(mean);
      return;
  }

  for (i=1; i<magnitudeSortedDataPoints.length; ++i) {
    var d1 = magnitudeSortedDataPoints[i];
    var d0 = magnitudeSortedDataPoints[i-1];
    var consecutiveDataPointDistance = new ConsecutiveDataPointDistance(
      d0,
      this.euclideanDistance(d1, d0),
      i-1
    );
    consecutiveDataPointDistances.push(consecutiveDataPointDistance);
  }

  sortedConsecutiveDataPointDistances = consecutiveDataPointDistances.sort(
    compareConsecutiveDataPointDistances
  );

  for (i=0; i<(this.k - 1); ++i) {
    upperBoundIndexes.push(
      sortedConsecutiveDataPointDistances[i].index
    );
  }
  upperBoundIndexes.push(magnitudeSortedDataPoints.length - 1);
  upperBoundIndexes = upperBoundIndexes.sort(function (a, b){ return a - b; });

  lowerBoundIndexes.push(0);
  for (i=0; i<(upperBoundIndexes.length - 1); ++i) {
    lowerBoundIndexes.push(upperBoundIndexes[i] + 1);
  }

  for (i=0; i<upperBoundIndexes.length; ++i) {
    var temp = [];
    temp.push(
      magnitudeSortedDataPoints[upperBoundIndexes[i]]
    );
    temp.push(
      magnitudeSortedDataPoints[lowerBoundIndexes[i]]
    );
    upperLowerBoundDataPoints.push(temp);
  }

  for (i=0; i<upperLowerBoundDataPoints.length; ++i) {
    mean = new Mean();
    mean.id = i;
    mean.features = this.meanFeatures(
      upperLowerBoundDataPoints[i]
    );
    this.means.push(mean);
  }
};

KMeans.prototype.assignmentStep = function () {
  for (var i=0; i<this.dataPoints.length; ++i) {
    var dataPoint = this.dataPoints[i];
    var euclideanDistances = [];
    for (var j=0; j<this.means.length; ++j) {
      var mean = this.means[j];
      euclideanDistances.push(
          {
            euclideanDistance: this.euclideanDistance(
              dataPoint,
              mean
            ),
            meanId: mean.id
          }
      );
    }
    this.dataPoints[i].meanId = euclideanDistances.sort(
      this.compareEuclideanDistances
    )[0].meanId;
  }
};

KMeans.prototype.updateStep = function () {
  var newMeans = [];
  var clusters = [];
  var k = this.k;
  var converged = 0;
  var that = this;

  while (k--) {
    clusters.push([]);
  }

  for (i=0; i<this.dataPoints.length; ++i) {
    dataPoint = this.dataPoints[i];
    clusters[dataPoint.meanId].push(dataPoint);
  }

  this.clusters = clusters;
  this.converged = false;

  for (i=0; i<this.means.length; ++i) {
    var equal = 0;
    var newMeanFeatures = this.meanFeatures(
      clusters[this.means[i].id]
    );

    for (var j=0; j<this.featureLength; ++j) {
      if (newMeanFeatures[j] === this.means[i].features[j]) {
        equal +=1;
      }
    }

    if (equal === this.featureLength) {converged += 1;}

    this.means[i].features = newMeanFeatures;
  }

  if (converged === this.k) {this.converged = true;}
};

KMeans.prototype.iterate = function () {
  var iterations = 0;
  var that = this;

  if (this.dataPoints.length === 0) {return;}

  this.featureBounds();
  this.initializeMeans(1);

  var cycle = function () {
    if (that.dataPoints.length === 0) {return;}

    if (iterations <= that.maxIterations && that.converged === false) {
      that.assignmentStep();
      that.updateStep();
      that.onIterate(that);
      iterations += 1;
      window.requestAnimationFrame(cycle);
    } else {
      that.onComplete(that);
      return;
    }
  };
  window.requestAnimationFrame(cycle);
};

KMeans.prototype.assign = function (dataPoint) {
  var distancesToMeans = [];
  var minMeanDistanceIndex = 0;
  var closestMean = null;
  var that = this;

  if (typeof this.means === 'undefined') {return null;}
  if (this.means.length === 0) {return null;}

  distancesToMeans = this.means.map(function (mean) {
    return that.euclideanDistance(mean, dataPoint);
  });

  if (distancesToMeans.length === 0) {return null;}

  minMeanDistanceIndex = distancesToMeans.indexOf(
    Math.min.apply(Math, distancesToMeans)
  );

  closestMean = this.means[minMeanDistanceIndex];
  dataPoint.meanId = closestMean.id;

  return dataPoint;
};

KMeans.prototype.clusterMembers = function (meanId) {
  var members = [];

  if (this.dataPoints.length === 0) {return members;}

  members = this.dataPoints.filter(function (dataPoint) {
    return dataPoint.meanId === meanId;
  });

  return members;
};

KMeans.prototype.notClusterMembers = function (meanId) {
  var members = [];
  var membersIds = [];
  var notMembers = [];

  if (this.dataPoints.length === 0) {return notMembers;}

  members = this.clusterMembers(meanId);
  membersIds = members.map(function (member) {
    return member.id;
  });

  notMembers = this.dataPoints.filter(function (dataPoint) {
    if (membersIds.indexOf(dataPoint.id) === -1) {return true;}
    return false;
  });

  return notMembers;
};

KMeans.prototype.dataPointClusterMembers = function (dataPoint) {
  var dataPointClusterMembers = [];

  if (typeof dataPoint === 'undefined') {return dataPointClusterMembers;}
  if (!dataPoint.hasOwnProperty('meanId')) {return dataPointClusterMembers;}
  if (this.dataPoints.length === 0) {return dataPointClusterMembers;}

  dataPointClusterMembers = this.clusterMembers(dataPoint.meanId).filter(
    function (dataPointClusterMember) {
      return dataPoint.id !== dataPointClusterMember.id;
    }
  );

  return dataPointClusterMembers;
};

KMeans.prototype.dataPointNearestClusterMembers = function (dataPoint) {
  var dataPointNearestClusterMembers = [];
  var notMembers = [];
  var distances = [];
  var minDistance = 0;
  var minDistanceIndex = 0;
  var minMeanId = 0;
  var that = this;

  if (typeof dataPoint === 'undefined') {return dataPointNearestClusterMembers;}
  if (!dataPoint.hasOwnProperty('meanId')) {return dataPointNearestClusterMembers;}
  if (this.dataPoints.length === 0) {return dataPointNearestClusterMembers;}

  notMembers = this.notClusterMembers(dataPoint.meanId);

  if (notMembers.length === 0) {return dataPointNearestClusterMembers;}

  distances = notMembers.map(function (notMember) {
    return that.euclideanDistance(dataPoint, notMember);
  });

  minDistance = Math.min.apply(Math, distances);
  minDistanceIndex = distances.indexOf(minDistance);

  minMeanId = notMembers[minDistanceIndex].meanId;

  return this.clusterMembers(minMeanId);
};
