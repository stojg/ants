define(['pulse', 'movable', 'ai/steering', 'libs/sylvester-0-1-3/sylvester.src'], function (pulse, Movable) {

	Ant = Movable.extend({
		init : function(args) {
			args = args || {};
			args.src = new pulse.Texture({filename: 'img/ant2.png'});
			args.size = {x: 4, y: 2};
			args.max_velocity = 30;
			args.max_acceleration = 0.1;
			args.max_angular_velocity = 0.5;
			args.max_angular_acceleration = 0.2;
			args.type = 'ant';
			this._super(args);
		},
				
		update : function(elapsed) {

			var others = this.get_others('ant');

			if(others.length > 1 ) {
				var target = others.pop();
				var behaviour = new ai.steering.Arrive(this.kinematics(), target.kinematics());
				var steering = this.actuation(behaviour, elapsed);
				this.velocity = steering.velocity;
			}
			
			this._super(elapsed);
		},

		actuation : function(behaviour, elapsed) {
			var output = behaviour.get();
			var velocity_change = output.acceleration().multiply(elapsed);
			var new_velocity = velocity_change.add($V([this.velocity.x, this.velocity.y]));
			if(new_velocity.length() > this.max_velocity) {
				new_velocity = new_velocity.normalize().multiply(this.max_velocity);
			}
			
			// drag
			new_velocity = new_velocity.multiply(0.98);
			return {
				velocity: {
					x : new_velocity.e(1),
					y : new_velocity.e(2)
				}
			}
		}
	});
	return Ant;
});