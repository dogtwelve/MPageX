define(function(require, exports, module) {
    'use strict';

    var UnitConverter = {};

    UnitConverter.ratioXtoPixels = function(ratioX, containerX) {
        if(!containerX) {
            console.log("ratioXtoPixels error!");
        }
        return ratioX * containerX;
    };

    UnitConverter.ratioYtoPixels = function(ratioY, containerY) {
        if(!containerY) {
            console.log("ratioYtoPixels error!");
        }
      return ratioY * containerY;
    };

    UnitConverter.pixelsToRatioX = function(pixels, containerX) {
        if(!containerX) {
            console.log("pixelsToRatioX error!");
        }
        return pixels / containerX;
    };

    UnitConverter.pixelsToRatioY = function(pixels, containerY) {
        if(!containerY) {
            console.log("pixelsToRatioY error!");
        }
        return pixels / containerY;
    };

    UnitConverter.degreesToRadians = function(degrees) {
      return degrees * (Math.PI / 180);
    };

    UnitConverter.radiansToDegrees = function(radians) {
      return radians * (180 / Math.PI);
    };

    UnitConverter.percentageToPixelsX = function(percentage, containerX) {
        if(!containerX) {
            console.log("percentageToPixelsX error!");
        }
        return Math.round(UnitConverter.ratioXtoPixels(percentage / 100, containerX));
    };

    UnitConverter.percentageToPixelsY = function(percentage, containerY) {
        if(!containerY) {
            console.log("percentageToPixelsY error!");
        }
        return Math.round(UnitConverter.ratioYtoPixels(percentage / 100, containerY));
    };

    UnitConverter._unitsToPixels = function(initial, containerSize) {
        if(!containerSize) {
            console.log("_unitsToPixels error!");
        }
        var result =[];
        for (var i = 0; i <= 1; i++) {
            var checkVal = '' + initial[i]; // cast to string
            // Check if units are percentages and adjust is necessary
            // otherwise units are assumed to be pixels.
            if (checkVal.charAt(checkVal.length - 1) === '%') {
                if (i === 0) {
                    result[i] = UnitConverter.percentageToPixelsX(parseFloat(checkVal.slice(0, checkVal.length - 1)), containerSize[0]);
                }
                if (i === 1) {
                    result[i] = UnitConverter.percentageToPixelsY(parseFloat(checkVal.slice(0, checkVal.length - 1)), containerSize[1]);
                }
            } else {
                result[i] = Math.round(initial[i]);
            }
        }
        return result;
    }

    module.exports = UnitConverter;
});
