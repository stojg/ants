define(['pulse'], function (pulse) {

	var GameObject = pulse.Sprite.extend({

		collision: false,

		init : function(args, collision) {
			args = args || {};
			this._super(args);

			this.position = args.position || {x: 0, y: 0};
			this.velocity = args.velocity || {x: 0, y: 0};
			this.max_acceleration = args.max_acceleration || 0;

			if(typeof collision !=='undefined') {
				this.collision = collision;
			}
			
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
			if(this.collision !== false) {
				this.collision.set_object(this);
			}
			
			if(!this.static) {
				this.move(elapsed);
			}
			this._super(elapsed);
		},

		move : function(elapsed) {
			this.position.x += this.velocity.x*(elapsed/1000);
			this.position.y += this.velocity.y*(elapsed/1000);

			if(this.collision.colliding() === false) {
				return;
			}

			var mtd = this.collision.translation();
			this.position.x += mtd.x;
			this.position.y += mtd.y;

			this.velocity.x = 0;
			this.velocity.y = 0;
		},

		get_collision: function() {
			return this.collision;
		},
		
		get_closest: function(type) {
			if(window.engine.graph[type].balanceFactor() === 'Infinity') {
				return [];
			}
			var objects = window.engine.graph[type].nearest({ x: this.position.x, y: this.position.y}, 3);
			var others = [];
			for(var key in objects) {
				var object = objects[key][0].node;
				if(object.name !== this.name) {
					others.push(object.kinematics());
				}
			}
			return others;
		},
		
		kinematics : function() {
			if(this.get_collision()) {
				var radius = this.get_collision().get_radius();
			} else {
				var radius = Math.max(this.size.width, this.size.height)/2;
			}
			return new ai.steering.Kinematics({
				position: $V([this.position.x, this.position.y]),
				velocity: $V([this.velocity.x, this.velocity.y]),
				orientation: this.rotation,
				radius : radius,
				max_velocity: this.max_velocity,
				max_acceleration: this.max_acceleration,
				max_angular_velocity: this.max_angular_velocity,
				max_angular_acceleration: this.max_angular_acceleration,
				name: this.name,
				type: this.type
			});
		}
	});
	
	return GameObject;
});