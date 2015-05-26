/*
 * David Lettier
 * (C) 2015
 * http://www.lettier.com/
*/

function uniqueNumber() {
  var time = new Date().getTime();

  while (time === new Date().getTime());

  return new Date().getTime();
}

function randomValueInRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function RGBToHex(r, g, b) {
  function pad(string) {
    return (string.length < 2) ? '0' + string : string;
  }

  return '#' + pad(r.toString(16)) + pad(g.toString(16)) + pad(b.toString(16));
}

function HSVToRGB(h, s, v) {
  var c = null;
  var h_prime = null;
  var x = null;
  var m = null;

  h = h % 360;

  if (s > 1) {s = 1;}
  if (s < 0) {s = 0;}

  if (v > 1) {v = 1;}
  if (v < 0) {v = 0;}

  c = v * s;
  h_prime = h / 60;
  x = c * (1 - Math.abs(h_prime % 2 - 1));

  rgb_temp = [0,0,0];

  switch (true) {
    case (h_prime >= 0 && h_prime < 1):
      rgb_temp = [c, x, 0];
      break;
    case (h_prime >= 1 && h_prime < 2):
      rgb_temp = [x, c, 0];
      break;
    case (h_prime >= 2 && h_prime < 3):
      rgb_temp = [0, c, x];
      break;
    case (h_prime >= 3 && h_prime < 4):
      rgb_temp = [0, x, c];
      break;
    case (h_prime >= 4 && h_prime < 5):
      rgb_temp = [x, 0, c];
      break;
    case (h_prime >= 5 && h_prime < 6):
      rgb_temp = [c, 0, x];
      break;
  }

  m = v - c;

  return rgb_temp.map(
    function (component) {return parseInt((component + m) * 255, 10);}
  );
}

function uniqueRandomColorGenerator(minHueDistance, saturation, value) {
  var hues = [];

  minHueDistance %= 360;

  return function () {
    var hue = null;
    var rgb = null;
    var color = null;

    if (hues.length === 0) {
      hue = 0;
      hues.push(hue);
    } else {
      hue = (hues[hues.length - 1] + minHueDistance + Math.random()) % 360;
      hues.push(hue);
    }

    rgb = HSVToRGB(hue, saturation, value);

    return RGBToHex(rgb[0], rgb[1], rgb[2]);
  };
}

function uniqueColors(number, minHueDistance) {
  var i = number;
  var colors = [];
  var color = uniqueRandomColorGenerator(minHueDistance, 0.6, 1.0);

  while (i--) {
    colors.push(color());
  }

  return colors;
}

