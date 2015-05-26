/*
 * David Lettier
 * (C) 2015
 * http://www.lettier.com/
*/

var DATAPOINTSIZE = 15;
var DATAPOINTCOLOR = '#999';

var VISUALMEANCOLOR = '#000';
var VISUALMEANSIZE = 8;

var MAXKMEANSITERATIONS = 20000;
var MAXKMEANSK = 10;

var canvas = document.createElement('canvas');
var stage = null;

var kmeans = null;

var clusterColors = uniqueColors(MAXKMEANSK, 360 / MAXKMEANSK);

var makeVisualDataPoint = function (position) {
  var id = uniqueNumber();
  var shape = new createjs.Shape();
  var dataPoint = new DataPoint(
    [position.x, position.y]
  );
  if (kmeans !== null) {
    kmeans.assign(dataPoint);
    color = clusterColors[dataPoint.meanId];
    shape.graphics.setStrokeStyle(
      1
    ).beginFill(
      color
    ).drawCircle(
      0,
      0,
      DATAPOINTSIZE
    );
  } else {
    shape.graphics.setStrokeStyle(
      1
    ).beginFill(
      DATAPOINTCOLOR
    ).drawCircle(
      0,
      0,
      DATAPOINTSIZE
    );
  }
  shape.x = dataPoint.features[0];
  shape.y = dataPoint.features[1];
  shape.id = id;
  dataPointLayer.addChild(shape);
  shape.on('click', function (event) {
    var id = this.id;
    dataPointsTemp = dataPoints.filter(function (dataPoint) {
      return dataPoint.id !== id;
    });
    dataPoints = dataPointsTemp;
    dataPointLayer.removeChild(this);
    stage.update();
    event.stopImmediatePropagation();
  });
  dataPoint.id = id;
  dataPoint.shape = shape;
  dataPoints.push(dataPoint);
  stage.update();
};

var dataPointLayer = new createjs.Container();
var dataPointLayerBase = new createjs.Shape();
var dataPoints = [];
var visualMeans = [];

var guiControls = null;
var gui = null;

var GUIControls = function () {
  var that = this;

  this.k = MAXKMEANSK;
  this.maxIterations = MAXKMEANSITERATIONS;

  this.reset = function () {
    dataPoints.forEach(function (dataPoint) {
      dataPointLayer.removeChild(dataPoint.shape);
    });
    visualMeans.forEach(function (visualMean) {
      dataPointLayer.removeChild(visualMean);
    });
    kmeans = null;
    that.silhouetteCoefficient = 'Press runKMeans.';
    dataPoints.length = 0;
    visualMeans.length = 0;
    stage.update();
  };

  this.scatter = function () {
    var minX = 0 + (DATAPOINTSIZE * 2);
    var minY = 0 + (DATAPOINTSIZE * 2);
    var maxX = canvas.width - (DATAPOINTSIZE * 2);
    var maxY = canvas.height - (DATAPOINTSIZE * 2);
    for (var i=0; i<15; ++i) {
      var valueX = randomValueInRange(minX, maxX);
      var valueY = randomValueInRange(minY, maxY);
      makeVisualDataPoint({x: valueX, y: valueY});
    }
  };

  this.runKMeans = function () {
    var updateSilhouetteCoefficient = function (silhouetteCoefficient) {
      that.silhouetteCoefficient = silhouetteCoefficient;
    };
    var calculateSilhouetteCoefficient = function (kmeans) {
      silhouetteCoefficient = new SilhouetteCoefficient(
        {
          dataPointClusterMembersFunction: kmeans.dataPointClusterMembers.bind(
            kmeans
          ),
          dataPointNearestClusterMembersFunction: kmeans.dataPointNearestClusterMembers.bind(
            kmeans
          ),
          distanceFunction: kmeans.euclideanDistance.bind(kmeans)
        }
      );

      that.silhouetteCoefficient = 'Calculating...';

      silhouetteCoefficient.model(kmeans.dataPoints, updateSilhouetteCoefficient);
    };
    var onIterate = function (kmeans) {
      var i = 0;
      if (dataPoints.length === 0) {return;}
      kmeans.clusters.forEach(function (cluster) {
        var color = clusterColors[i];
        if (cluster.length === 0) {return;}
        cluster.forEach(function (dataPoint) {
          dataPoint.shape.graphics.clear();
          dataPoint.shape.graphics.beginFill(color).drawCircle(
            0, 0, DATAPOINTSIZE
          );
        });
        stage.update();
        i += 1;
      });
      visualMeans.forEach(function (visualMean) {
        dataPointLayer.removeChild(visualMean);
      });
      visualMeans.length = 0;
      kmeans.means.forEach(function (mean) {
        var shape = new createjs.Shape();
        shape.graphics.beginFill(VISUALMEANCOLOR).drawRect(0, 0, VISUALMEANSIZE, VISUALMEANSIZE);
        shape.x = mean.features[0];
        shape.y = mean.features[1];
        dataPointLayer.addChild(shape);
        visualMeans.push(shape);
      });
      stage.update();
    };

    if (dataPoints.length === 0) {return;}

    if (that.k > dataPoints.length) {that.k = dataPoints.length;}

    kmeans = new KMeans({
      dataPoints: dataPoints,
      maxIterations: Math.round(that.maxIterations),
      k: Math.round(that.k),
      onIterate: onIterate,
      onComplete: calculateSilhouetteCoefficient
    });

    kmeans.iterate();
  };

  this.silhouetteCoefficient = 'Press runKMeans.';
};

guiControls = new GUIControls();
gui = new dat.GUI({width: 330});

canvas.id = 'canvas';
document.body.appendChild(canvas);
stage = new createjs.Stage('canvas');
stage.canvas.width = window.innerWidth;
stage.canvas.height = window.innerHeight;

gui.add(guiControls, 'k', 1, MAXKMEANSK).listen();
gui.add(guiControls, 'maxIterations', 1, MAXKMEANSITERATIONS);
gui.add(guiControls, 'reset');
gui.add(guiControls, 'scatter');
gui.add(guiControls, 'runKMeans');
gui.add(guiControls, 'silhouetteCoefficient').listen();

dataPointLayer.name = 'dataPointLayer';
dataPointLayer.x = 0;
dataPointLayer.y = 0;
dataPointLayerBase.graphics.beginFill('#3C3C3C').drawRect(
  0, 0, window.innerWidth, window.innerHeight
);
dataPointLayer.addChild(dataPointLayerBase);
stage.addChild(dataPointLayer);
dataPointLayer.on('click', function (event) {
  makeVisualDataPoint({x: event.stageX, y: event.stageY});
});

stage.update();
