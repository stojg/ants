define(['pulse', 'libs/sylvester-0-1-3/sylvester.src'], function (pulse, vec) {

	Movable = pulse.Sprite.extend({

		init : function(args) {
			args = args || {};
			this._super(args);
			
			this.position = args.position || {x: 0, y: 0};
			this.velocity = args.velocity || {x: 0, y: 0};
			this.max_acceleration = args.max_acceleration || 0;

			this.rotation = args.rotation || 0;
			this.angular_velocity = args.angular_velocity || 0;
			this.max_angular_acceleration = args.max_angular_acceleration || 0;
			
			this.max_velocity = args.max_velocity || 0;
			this.max_angular_velocity = args.max_angular_velocity ||0;
			
			this.layer = args.layer;
			this.static = args.static || false;
			this.type = args.type || 'unknown';
		},

		update : function(elapsed) {
			if(!this.static) {
				this.move(elapsed);
			}
			this._super(elapsed);
		},

		move : function(elapsed) {
			this.position.x += this.velocity.x*(elapsed/1000);
			this.position.y += this.velocity.y*(elapsed/1000);
			this._cbox = false;

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
					collisions.push(object);
				}
			}
			return collisions;
		},

		get_others: function(type) {
			var others = [];
			for(key in this.layer.objects) {
				var object = this.layer.objects[key];
				if(object.name === this.name || object.type !== type) {
					continue;
				}
				others.push(object);
			}
			return others;
		},

		get_others_kinematic: function(type) {
			var others = [];
			for(key in this.layer.objects) {
				var object = this.layer.objects[key];
				if(object.name === this.name || object.type !== type) {
					continue;
				}
				others.push(object.kinematics());
			}
			return others;
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

			if(this._cbox) {
				return this._cbox;
			}
			if(this.rotation === 0) {
				return this._cbox = {
					x: this.position.x, y: this.position.y,
					w: this.size.x, h: this.size.y
				};
			}

			var bottom_right_x = top_right_x = this.size.x/2;
			var bottom_right_y = this.size.y;
			var top_right_y = -this.size.y;

			var radians = this.rotation * (Math.PI / 180);

			var sin_o = Math.sin(radians);
			var cos_o = Math.cos(radians);

			var new_top_right_x = top_right_x * cos_o - top_right_y * sin_o;
			var new_top_right_y = top_right_x * sin_o + top_right_y * cos_o;
			var new_bottom_right_x = bottom_right_x * cos_o - bottom_right_y * sin_o;
			var new_bottom_right_y = bottom_right_x * sin_o + bottom_right_y * cos_o;

			var half_width = Math.max(Math.abs(new_top_right_x), Math.abs(new_bottom_right_x));
			var half_height = Math.max(Math.abs(new_top_right_y), Math.abs(new_bottom_right_y));

			return this._cbox = {
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
				max_acceleration: this.max_acceleration,
				max_angular_velocity: this.max_angular_velocity,
				max_angular_acceleration: this.max_angular_acceleration
			});
		}
	});
	return Movable;
});