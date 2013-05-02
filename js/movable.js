define(['pulse', 'libs/sylvester-0-1-3/sylvester.src'], function (pulse, vec) {

	Movable = pulse.Sprite.extend({

		init : function(args) {
			args = args || {};
			this._super(args);
			this.max_velocity = 20;
			this.max_angular_velocity = 0.1;
			this.position = args.position || {x: 0, y: 0};
			this.velocity = args.velocity || {x: 0, y: 0};
			this.angular_velocity = args.angular_velocity || 0;
			this.layer = args.layer;
			this.rotation = args.rotation || 0;
			this.static = args.static || false;
		},

		update : function(elapsed) {
			if(!this.static) {
				this.move(elapsed);
			}
			if($V([this.velocity.x, this.velocity.y]).length()) {
				var radians = $V([1,0]).angle($V([this.velocity.x, this.velocity.y]));
				this.rotation = radians * (180/Math.PI);
			}
			this._super(elapsed);
		},

		move : function(elapsed) {
			this.position.x += this.velocity.x*(elapsed/1000);
			this.position.y += this.velocity.y*(elapsed/1000);
			
			var collisions = this.get_collisions();
			if(collisions.length === 0) {
				
				return;
			}
			
			for(var i = 0; i < collisions.length; i++) {
				var mtd = this.minimumTranslation(collisions[i]);
				this.position.x += mtd[0];
				this.position.y += mtd[1];
			}
		},
		
		get_collisions : function() {
			var collisions = [];
			for(key in this.layer.objects) {
				var object = this.layer.objects[key];
				if(object.name === this.name) {
					continue;
				}
				if(this.aabb_vs_aabb(object)) {
					//console.log(this.cbox());
					collisions.push(object);
				}
			}
			return collisions;
		},

		aabb_vs_aabb : function(that) {
			return (Math.abs(this.cbox().x - that.cbox().x) * 2 < (this.cbox().w + that.cbox().w)) && (Math.abs(this.cbox().y - that.cbox().y) * 2 < (this.cbox().h + that.cbox().h));
		},
		
		minimumTranslation: function(that) {
            var amin = [this.cbox().x - this.cbox().w/2, this.cbox().y - this.cbox().h/2];
			var bmin = [that.cbox().x - that.cbox().w/2, that.cbox().y - that.cbox().h/2];

			var bmax = [that.cbox().x + that.cbox().w/2, that.cbox().y + that.cbox().h/2];
            var amax = [this.cbox().x + this.cbox().w/2, this.cbox().y + this.cbox().h/2];

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
				
		cbox : function() {
			if(this.rotation === 0) {
				return {
					x: this.position.x, y: this.position.y,
					w: this.size.x, h: this.size.y
				};
			}

			var top_right_x = this.size.x/2;
			var bottom_right_x = this.size.x/2;
			var top_right_y = -this.size.y;
			var bottom_right_y = this.size.y;

			var sin_o = Math.sin(this.rotation * (Math.PI / 180));
			var cos_o = Math.cos(this.rotation * (Math.PI / 180));

			var new_top_right_x = top_right_x * cos_o - top_right_y * sin_o;
			var new_top_right_y = top_right_x * sin_o + top_right_y * cos_o;
			var new_bottom_right_x = bottom_right_x * cos_o - bottom_right_y * sin_o;
			var new_bottom_right_y = bottom_right_x * sin_o + bottom_right_y * cos_o;

			var half_width = Math.max(Math.abs(new_top_right_x), Math.abs(new_bottom_right_x));
			var half_height = Math.max(Math.abs(new_top_right_y), Math.abs(new_bottom_right_y));

			return {
				x: this.position.x, y: this.position.y,
				w: half_width*2, h: half_height*2
			};
		},

		kinematics : function() {
			return new ai.steering.Kinematics({
				position: $V([this.position.x, this.position.y]),
				velocity: $V([this.velocity.x, this.velocity.y]),
				orientation: this.rotation,
				max_velocity: this.max_velocity,
				max_angular_velocity: this.max_angular_velocity
			});
		}
	});
	return Movable;
});