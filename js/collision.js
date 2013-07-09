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
		},

		aabb_vs_aabb : function(that) {
			return (Math.abs(this.cbox().x - that.cbox().x) * 2 < (this.cbox().width + that.cbox().width)) && (Math.abs(this.cbox().y - that.cbox().y) * 2 < (this.cbox().height + that.cbox().height));
		},

		cbox : function() {

			if(this.rotation === 0) {
				return {
					x: this.position.x, y: this.position.y,
					width: this.collision.width, height: this.collision.height
				};
			}

			var bottom_right_x = this.collision.width/2;
			var top_right_x = bottom_right_x;
			var bottom_right_y = this.collision.height;
			var top_right_y = -this.collision.height;

			var radians = this.rotation * (Math.PI / 180);

			var sin_o = Math.sin(radians);
			var cos_o = Math.cos(radians);

			var new_top_right_x = top_right_x * cos_o - top_right_y * sin_o;
			var new_top_right_y = top_right_x * sin_o + top_right_y * cos_o;
			var new_bottom_right_x = bottom_right_x * cos_o - bottom_right_y * sin_o;
			var new_bottom_right_y = bottom_right_x * sin_o + bottom_right_y * cos_o;

			var half_width = Math.max(Math.abs(new_top_right_x), Math.abs(new_bottom_right_x));
			var half_height = Math.max(Math.abs(new_top_right_y), Math.abs(new_bottom_right_y));

			return {
				x: this.position.x, y: this.position.y,
				width: half_width*2, height: half_height*2
			};
		},

		minimumTranslation: function(that) {
            var amin = [this.cbox().x - this.cbox().width/2, this.cbox().y - this.cbox().height/2];
			var bmin = [that.cbox().x - that.cbox().width/2, that.cbox().y - that.cbox().height/2];

			var bmax = [that.cbox().x + that.cbox().width/2, that.cbox().y + that.cbox().height/2];
            var amax = [this.cbox().x + this.cbox().width/2, this.cbox().y + this.cbox().height/2];

            var mtd = [0,0];

			// float
            var left = (bmin[0] - amax[0]);
            var right = (bmax[0] - amin[0]);
            var top = (bmin[1] - amax[1]);
            var bottom = (bmax[1] - amin[1]);
            // Boxes intersect, work out the mtd on both x and y axes.
            if(Math.abs(left) < right) {
				mtd[0] = left;
			} else {
                mtd[0] = right;
			}
            if(Math.abs(top) < bottom) {
				mtd[1] = top;
			} else {
                mtd[1] = bottom;
			}

            // 0 the axis with the largest mtd value.
            if(Math.abs(mtd[0]) < Math.abs(mtd[1])) {
				mtd[1] = 0;
			} else {
				mtd[0] = 0;
			}

            return mtd;
        },
	});



	return Collision;

});