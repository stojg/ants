define(['pulse', 'movable', 'ai/steering', 'libs/sylvester-0-1-3/sylvester.src'], function (pulse, Movable) {

	Ant = Movable.extend({
		init : function(args) {
			args = args || {};
			args.src = new pulse.Texture({filename: 'img/ant2.png'});
			args.size = {x: 4, y: 2};
			args.max_velocity = 60;
			args.max_acceleration = 0.1;
			args.max_angular_velocity = 0.5;
			args.max_angular_acceleration = 0.2;
			args.type = 'ant';
			this._super(args);
		},
				
		update : function(elapsed) {
			var target = new ai.steering.Kinematics({
				position: $V([480, 160])
			});
			var arrive = new ai.steering.Arrive(this.kinematics(), target);
			var steering = this.actuate(arrive.get(), elapsed);
			this.velocity = steering.velocity;
			this.rotation = steering.rotation;
			this._super(elapsed);
		},

		actuate : function(output, elapsed) {
			var new_velocity = this.get_actuated_velocity(output, elapsed);

			return {
				velocity: {
					x : new_velocity.e(1),
					y : new_velocity.e(2)
				},
				rotation: this.get_actuated_rotation(output, elapsed)
			}
		},

		get_actuated_velocity: function(output, elapsed) {
			var new_velocity = $V([this.velocity.x, this.velocity.y]);

			var velocity_change = output.acceleration().multiply(elapsed);

			// if there are no acceleration, brake.
			if(velocity_change.length() === 0) {
				return new_velocity.multiply(0.80);
			}

			new_velocity = new_velocity.add(velocity_change);
			// trim to maximum speed
			if(new_velocity.length() > this.max_velocity) {
				new_velocity = new_velocity.normalize().multiply(this.max_velocity);
			}
			
			return new_velocity;
		},

		get_actuated_rotation: function(output, elapsed) {
			var direction = $V([this.velocity.x, this.velocity.y]);
			if(output.rotation() === 0 && direction.length() > 0) {
				var radians = $V([1,0]).angle(direction);
				return radians * (180/Math.PI);
			}
			return this.rotation + output.rotation()*elapsed;
		}
	});
	
});