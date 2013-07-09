define(['class'], function () {

	var Collision = Collision || {};

	Collision.Detector = Class.extend({
		originals: [],
		objects: [],

		collisions: {},

		init: function(objects) {
		 	this.objects = [];
		 	this.originals = objects;
			for (prop in objects) {
  				this.objects.push(objects[prop]);
			}
		},
		
		count: function() {
			return this.objects.length;
		},

		test: function() {
			for (var i = 0; i < this.count(); i++) {
				var objectA = this.objects[i];
				for (var j = (i+1); j < this.count() ; j++) {
					var objectB = this.objects[j];
					this.collisionCheck(objectA, objectB);
				}
			};
		},

		resolve: function() {
			for(name in this.collisions) {
				var resolution = this.collisions[name];
				for (var i = resolution.length - 1; i >= 0; i--) {
					// remove the other object from the list
					delete(this.collisions[resolution[i].with]);
					//console.log(name+' vs '+resolution[i].with)
					var a = (this.originals[name]);
					var b = (this.originals[resolution[i].with]);
					var change = this.collisions[name][i].result;
					
					// @todo calculate speed difference
					var percentage = 0.5;
					
					a.position.x += change[0]*percentage;
					a.position.y += change[1]*percentage;
					b.position.x -= change[0]*(1-percentage);
					b.position.y -= change[1]*(1-percentage);
				};
				delete(this.collisions[name]);
			}
		},

		num_collisions: function() {
			return Object.keys(this.collisions).length;
		},

		reset: function() {
			this.collisions = {};
		},

		collisionCheck: function(a, b) {
			var testA = a.get_collision();
			var testB = b.get_collision();
			var result = false;
			if(!testA || !testB) {
				return false;
			}
			if(testB instanceof Collision.Circle) {
				result = testA.vs_circle(testB);
			}

			if(!result) {
				return;
			}
			
			if(typeof this.collisions[a.name] === 'undefined') {
				this.collisions[a.name] = [];
			}
			if(typeof this.collisions[b.name] === 'undefined') {
				this.collisions[b.name] = [];	
			}

			this.collisions[a.name].push({'with': b.name, result: result});
			this.collisions[b.name].push({'with': a.name, result: [-result[0],-result[1]]});
		},

		who_collided_with: function(a) {
			if(typeof this.collisions[a.name] === 'undefined') {
				return {};
			}
			return this.collisions[a.name]
		}

	});

	Collision.Circle = Class.extend({
		object : false,

		init: function(radius) {
			this.radius = radius;
		},
		get_radius: function() {
			return this.radius;
		},
		set_object: function(object) {
			this.object = object;
		},
		get_position: function() {
			if(!this.object) {
				return false;
			}
			return {x: this.object.position.x, y: this.object.position.y};
		},

		colliding: function() {
			var others = window.engine.graph['all'].nearest({ x: this.object.position.x, y: this.object.position.y}, 8);
			this.collisions = [];
			for(var key in others) {
				var other = others[key][0].node;
				// Should not collide with myself
				if(this.object.name === other.name) {
					continue;
				}
				// Dont have a collision
				if(!other.get_collision()) {
					continue;
				}

				if(!other.get_collision().get_position()) {
					continue;
				}

				var translation = this.circle_vs_circle(other);
				if(translation !== false) {
					this.collisions.push(translation);
				}
			}
			return this.collisions.length > 0;
		},


		translation: function() {
			var mtd = {x:0, y:0};
			for(var key in this.collisions) {
				mtd.x =+ this.collisions[key][0];
				mtd.y =+ this.collisions[key][1];
			}
			return mtd;
		},

		vs_circle: function(other) {
			var totalRadius = this.get_radius() + other.get_radius();
			var x = other.get_position().x - this.get_position().x;
			var y = other.get_position().y - this.get_position().y;
			if(isNaN(x)) {
				throw "position x is NaN";
			}
			if(isNaN(x)) {
				throw "position y is NaN";
			}
			var distanceSquared = (x*x)+(y*y);

			if((totalRadius*totalRadius) - distanceSquared <= 0) {
				return false;
			}
			
			var distance = Math.sqrt(distanceSquared);
			
			var transX = 0;
			if(x!==0) {
				transX = (x/distance)*(totalRadius-distance);
			}
			var transY = 0;
			if(y!==0) {
				transY = (y/distance)*(totalRadius-distance);
			}

			return [-transX, -transY];
		},

		circle_vs_circle: function(other) {
			var totalRadius = this.get_radius() + other.get_collision().get_radius();
			var x = other.get_collision().get_position().x - this.get_position().x;
			var y = other.get_collision().get_position().y - this.get_position().y;
			var distanceSquared = (x*x)+(y*y);

			if((totalRadius*totalRadius) - distanceSquared <= 0) {
				return false;
			}
			
			var distance = Math.sqrt(distanceSquared);
			
			var transX = 0;
			if(x!==0) {
				transX = (x/distance)*(totalRadius-distance);
			}
			var transY = 0;
			if(y!==0) {
				transY = (y/distance)*(totalRadius-distance);
			}
			
			return [-transX, -transY];
		}
	});



	return Collision;

});