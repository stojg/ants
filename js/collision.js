define(['class'], function () {

	var Collision = Collision || {};

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