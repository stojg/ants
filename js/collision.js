"use strict";
define(['class'], function () {

	var Collision = Collision || {};

	Collision.Detector = Class.extend({
		init: function(objects, quad) {
		 	this.objects = [];
		 	this.originals = objects;
			this.checked_pairs = [];
			this.quad = quad;
			this.collisions = {};
			for(var prop in objects) {
  				this.objects.push(objects[prop]);
			}
		},
		
		test: function() {
			for (var i = 0; i < this.objects.length; i++) {
				var objectA = this.objects[i];

				if(objectA.static) {
					continue;
				}

				var neighbours = this.quad.retrieve({
					x: objectA.position.x,
					y: objectA.position.y,
					height: objectA.size.x*2,
					width: objectA.size.y*2
				});

				for (var j = 0; j < neighbours.length ; j++) {
					var objectB = neighbours[j].node;
					if(this.has_been_checked(objectA, objectB)) {
						continue;
					}
					this.add_to_checked(objectA, objectB);

					if(objectA.name === objectB.name) {
						continue;
					}

					this.hitTest(objectA, objectB);
				}
			};
		},

		add_to_checked: function(a, b) {
			if(typeof this.checked_pairs[a.name] === 'undefined') {
				this.checked_pairs[a.name] = [];
			}
			if(typeof this.checked_pairs[a.name][b.name] === 'undefined') {
				this.checked_pairs[a.name][b.name] = true;
			}
			if(typeof this.checked_pairs[b.name] === 'undefined') {
				this.checked_pairs[b.name] = [];
			}
			if(typeof this.checked_pairs[a.name][a.name] === 'undefined') {
				this.checked_pairs[b.name][a.name] = true;
			}
		},

		has_been_checked: function(a, b) {
			if(typeof this.checked_pairs[a.name] === 'undefined') {
				return false;
			}

			if(typeof this.checked_pairs[b.name] === 'undefined') {
				return false;
			}

			return this.checked_pairs[b.name];
		},

		resolve: function() {
			for(name in this.collisions) {
				var resolution = this.collisions[name];
				for (var i = resolution.length - 1; i >= 0; i--) {
					var a = this.originals[name];
					var aRadius = a.get_collision().get_radius();
					var response = this.collisions[name][i].result;
					a.position.x = response.position.x+response.normal.x*aRadius;
					a.position.y = response.position.y+response.normal.y*aRadius;
				};
				delete(this.collisions[name]);
			}
		},

		reset: function() {
			this.collisions = {};
			this.checked_pairs = [];
		},

		hitTest: function(a, b) {
			var testA = a.get_collision();
			var testB = b.get_collision();
			
			if(!testA) {
				console.log('No Collision.Shape on A '+a.type);
				return false;
			}

			if(!testB) {
				console.log('No Collision.Shape on B '+b.type);
				return false;
			}
			
			var result = false;
			if(testB instanceof Collision.Circle) {
				result = testA.vs_circle(testB);
			} else {
				throw new Error('Missed to implement a Collision.Shape check.', testB);
			}
			
			if(typeof result !== 'object') {
				return false;
			}

			if(typeof this.collisions[a.name] === 'undefined') {
				this.collisions[a.name] = [];
			}
			if(typeof this.collisions[b.name] === 'undefined') {
				this.collisions[b.name] = [];
			}
			this.collisions[a.name].push({'with': b.name, result: result});
			// Dont add B back until movement is back
			//this.collisions[b.name].push({'with': a.name, result: result});
		},

		who_collided_with: function(name) {
			if(typeof this.collisions[name] === 'undefined') {
				return {};
			}
			return this.collisions[name];
		},

		get_collisions: function() {
			return this.collisions;
		}

	});

	Collision.Shape = Class.extend({

		_vcheck: function() {
			for(var i=0;i<arguments.length;i++) {
				if(typeof arguments[i] !== 'object') {
					throw new Error('Vector is not a proper vector: "'+arguments[i]+'"');
				}
				if(isNaN(arguments[i].x)) {
					throw new Error('Vector.x is not a proper vector: "'+arguments[i]+'"');
				}
				if(isNaN(arguments[i].y)) {
					throw new Error('Vector.y is not a proper vector: "'+arguments[i]+'"');
				}
			}
		},

		subtract_vector: function(v1, v2) {
			this._vcheck(v1,v2);
			return {
				x: v1.x - v2.x,
				y: v1.y - v2.y
			};
		},
		add_vector: function(a, b) {
			this._vcheck(a,b);
			return {
				x: a.x + b.x,
				y: b.y + b.y
			};
		},
		multiply_vector: function(v1, scalar) {
			this._vcheck(v1);
			return {
				x: v1.x*scalar,
				y: v1.y*scalar
			};
		},
		divide_vector: function(vector, scalar) {
			this._vcheck(vector);
			return {
				x: vector.x/scalar,
				y: vector.y/scalar
			};
		},
		project_vector: function(project, onto) {
			this._vcheck(project,onto);
			var d = this.dot_product(onto, onto);
			if(0 < d) {
				var dp = this.dot_product(project, onto);
				return this.multiply_vector(onto, dp/d);
			}
			return onto;
		},
		dot_product: function(v1, v2) {
			this._vcheck(v1,v2);
			return v1.x*v2.x + v1.y*v2.y;
		},
		vector_length: function(vector) {
			this._vcheck(vector);
			return Math.sqrt(this.vector_length_squared(vector));
		},
		vector_length_squared: function(vector) {
			this._vcheck(vector);
			return this.dot_product(vector, vector);
		},
		vector_to_length: function(vector, length) {
			this._vcheck(vector);
			return this.multiply_vector(this.normalize_vector(vector), length);
		},
		normalize_vector: function(vector) {
			this._vcheck(vector);
			var length = this.vector_length(vector);
			if(0 < length) {
				return this.divide_vector(vector, length);
			}
			return vector;
		},
		negate_vector: function(vector) {
			this._vcheck(vector);
			return {
				x: -vector.x,
				y: -vector.y
			};
		}
	});

	Collision.Circle = Collision.Shape.extend({

		init: function(position, radius) {
			if(isNaN(radius)) {
				throw new Error('Radius has not been set');
			}
			this.position = position;
			this.radius = radius;
		},
		get_radius: function() {
			return this.radius;
		},
		
		get_position: function() {
			return this.position;
		},

		update: function(object) {
			this.position = object.position;
		},

		vs_circle: function(other) {
			
			var direction = this.subtract_vector(this.position, other.position);
			var distSqr = this.vector_length_squared(direction);

			// Edgecase 1. Circles are on top of each other
			if(distSqr === 0) {
				return {
					position: this.position,
					normal: {x:0, y:0}
				};
			}
			
			// Circle center is inside the other cirlce
			if(other.get_radius()*other.get_radius() >= distSqr) {
				var norm = this.normalize_vector(direction)
				var normDirection = this.multiply_vector(norm, other.get_radius());
				return {
					position: this.add_vector(normDirection, other.get_position()),
					normal: norm
				};
			}

			var combinedRadius = this.get_radius() + other.get_radius();
			var circle = new Collision.Circle(other.get_position(), combinedRadius);
			var hit = circle.vs_point(this.get_position());
			if(hit !== false) {
				var line = new Collision.Segment(other.get_position(), this.get_position());
				return line.vs_circle(other);
			}
			return false;
		},

		vs_point: function(point) {
			var direction = this.subtract_vector(point, this.get_position());
			var distance = this.vector_length(direction);
			if(distance <= this.get_radius()) {
				var normal = this.normalize_vector(this.negate_vector(point));
				return {
					position: { x: point.x, y: point.y },
					normal: normal
				};
			}
			return false;
		}
	});

	Collision.Segment = Collision.Shape.extend({

		init: function(start, end) {
			this.start = start;
			this.end = end;
		},

		get_start_position: function() {
			return this.start;
		},

		get_end_position: function() {
			return this.end;
		},

		vs_circle: function(circle) {
				// The line between start and end
				var lineDirVec = this.subtract_vector(this.start, this.end);
				// vector from sphere to start
				var startToCenterVec = this.subtract_vector(circle.get_position(), this.start);

				var lineSqrDist = this.dot_product(lineDirVec, lineDirVec);

				var b = 2*this.dot_product(startToCenterVec, lineDirVec);

				var radiusSqr = circle.get_radius()*circle.get_radius();

				var startCenterDist = this.dot_product(startToCenterVec,startToCenterVec) - radiusSqr;

				var discriminant = b*b-4*lineSqrDist*startCenterDist;
				
				// Segment is pointing away from the circle
				if(discriminant < 0 ) {
					console.log('Segment pointing away from circle');
					return false;
				}

				// ray didn't totally miss sphere, so there is a solution to the equation.
				discriminant = Math.sqrt(discriminant);
				
				// either solution may be on or off the ray so need to test both
				// t1 is always the smaller value, because BOTH discriminant and
				// a are nonnegative.
				var t1 = (-b - discriminant)/(2*lineSqrDist);
				var t2 = (-b + discriminant)/(2*lineSqrDist);
				
				var hit = false;
				var collision = {};
				
				// 3x HIT cases:
				//          -o->             --|-->  |            |  --|->
				// Impale(t1 hit,t2 hit), Poke(t1 hit,t2>1), ExitWound(t1<0, t2 hit),

				// 3x MISS cases:
				//       ->  o                     o ->              | -> |
				// FallShort (t1>1,t2>1), Past (t1<0,t2<0), CompletelyInside(t1<0, t2>1)
				
				// t1 is an intersection, and if it hits, it's closer than t2 would be Impale, Poke
				if( t1 >= 0 && t1 <= 1 ) {
					hit = this.multiply_vector(lineDirVec, t1);
					collision.position = this.subtract_vector(this.start, hit);
				// here t1 didn't intersect so we are either started inside the sphere or completely past it
				} else if( t2 >= 0 && t2 <= 1 ) {
					hit = this.multiply_vector(lineDirVec, t2);
					collision.position = this.subtract_vector(this.start, hit);
				// totally inside and smack in the middle
				} else if(t1<0 && t2 > 0 && t1 === t2) {
					console.log('smack!');
					return false;
				} else if(t1<0 && t2 > 0) {
					//console.log('Fully inside', t1, t2);
					return false;
				} else if(t1<0 && t2<0) {
					//console.log('Past',t1,t2);
					return false;
				} else {
					//console.log('Fell short',t1,t2);
					return false;
				}
				
				collision.normal = this.normalize_vector(this.subtract_vector(collision.position, circle.get_position()));
				return collision;
		}
	});

	return Collision;

});