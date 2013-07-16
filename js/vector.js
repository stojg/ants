"use strict";
define(function() {
	var Vector = Vector || {};

	Vector._vcheck = function() {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] !== 'object') {
				throw new Error('Vector is not a proper vector: "' + arguments[i] + '"');
			}
			if (isNaN(arguments[i].x)) {
				throw new Error('Vector.x is not a proper vector: "' + arguments[i] + '"');
			}
			if (isNaN(arguments[i].y)) {
				throw new Error('Vector.y is not a proper vector: "' + arguments[i] + '"');
			}
		}
	};

	Vector.add = function(a, b) {
		this._vcheck(a, b);
		return {
			x: a.x + b.x,
			y: a.y + b.y
		};
	};

	Vector.subtract = function(v1, v2) {
		this._vcheck(v1, v2);
		return {
			x: v1.x - v2.x,
			y: v1.y - v2.y
		};

	};

	Vector.multiply = function(v1, scalar) {
		this._vcheck(v1);
		return {
			x: v1.x * scalar,
			y: v1.y * scalar
		};
	};

	Vector.length = function(vector) {
		this._vcheck(vector);
		return Math.sqrt(Vector.dot(vector, vector));
	};

	Vector.dot = function(v1, v2) {
		this._vcheck(v1, v2);
		return v1.x * v2.x + v1.y * v2.y;
	};

	Vector.negate = function(vector) {
		this._vcheck(vector);
		return {
			x: -vector.x,
			y: -vector.y
		};
	};

	return Vector;

})