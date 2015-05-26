/*
 * David Lettier
 * (C) 2015
 * http://www.lettier.com/
*/

function DataPoint(features) {
  if (features instanceof Array) {
    this.features = features;
  } else {
    this.features = [];
  }
  this.meanId = -1;
}
