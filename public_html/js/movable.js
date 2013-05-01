define(['pulse', 'game'], function (pulse, Game) {

	Movable = pulse.Sprite.extend({

		init : function(args) {
			args = args || {};
			this._super(args);
			this.max_velocity = 20;
			this.max_angular_velocity = 0.5;
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
		
		minimumTranslation: function(other) {
            var amin = [this.cbox().x-this.cbox().w, this.cbox().y-this.cbox().h];
            var amax = [this.cbox().x+this.cbox().w, this.cbox().y+this.cbox().h];
            var bmin = [other.cbox().x-other.cbox().w, other.cbox().y-other.cbox().h];
            var bmax = [other.cbox().x+other.cbox().w, other.cbox().y+other.cbox().h];
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
			return {
				x: this.position.x,
				y: this.position.y,
				w: this.size.x,
				h: this.size.y
			};
		}
	});
	return Movable;
});