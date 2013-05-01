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
			this.move(elapsed);
			this._super(elapsed);
		},

		move : function(elapsed) {
			this.position.x += this.velocity.x*(elapsed/1000);
			this.position.y += this.velocity.y*(elapsed/1000);
			
			if(this.collision().length > 0) {
				this.position = this.positionPrevious;
				console.log('hit');
			}
		},
		
		collision : function() {
			var collisions = [];
			if(this.static) {
				return collisions;
			}
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

		aabb_vs_aabb : function(that) {
			return (Math.abs(this.cbox().x - that.cbox().x) * 2 < (this.cbox().w + that.cbox().w)) && (Math.abs(this.cbox().y - that.cbox().y) * 2 < (this.cbox().h + that.cbox().h));
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