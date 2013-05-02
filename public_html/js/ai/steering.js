define(['class', 'libs/sylvester-0-1-3/sylvester.src'], function () {

	var vec = Vector.create;

	ai = {};
	ai.steering = ai.steering || {};

	ai.steering.Kinematics = Class.extend({
		init: function(args) {
			this.position = args.position || vec([0, 0]);
			this.velocity = args.velocity || vec([0, 0]);
			this.orientation = args.orientation || 0;
			this.max_velocity = args.max_velocity || 0;
			this.max_angular_velocity = args.max_angular_velocity || 0;
		}
	});

	ai.steering.Output = Class.extend({
		init: function() {
			this.linear = vec([0, 0]);
			this.angular = 0;
		},
		velocity: function() {
			return {
				x: this.linear.e(1),
				y: this.linear.e(2)
			}
		}
	});
	
	ai.steering.Seek = Class.extend({
		init: function(character, target) {
			this.character = character;
			this.target = target;
		},
		get: function() {
			var steering = new ai.steering.Output();
			steering.linear = this.target.position.subtract(this.character.position);
			steering.linear = steering.linear.normalize(steering.linear);
			// Give full acceleration
			steering.linear = steering.linear.multiply(this.character.max_velocity);
			return steering;
		}
	});

	ai.steering.Flee = ai.steering.Seek.extend({
		
		get: function() {
			var steering = new ai.steering.Output();
			steering.linear = this.character.position.subtract(this.target.position);
			steering.linear = steering.linear.normalize(steering.linear);
			// Give full acceleration
			steering.linear = steering.linear.multiply(this.character.max_velocity);
			return steering;
		}
	});

	ai.steering.Arrive = Class.extend({
		init: function(character, target) {
			this.character = character;
			this.target = target;
			this.targetRadius = 5;
			this.slowRadius = 30;
			this.timeToTarget = 0.25;
		},
		get: function() {
			var steering = new ai.steering.Output();
			var direction = this.target.position.subtract(this.character.position);
			var distance = this.target.position.distanceFrom(this.character.position);

			if (distance < this.targetRadius) {
				return steering;
			}

			var targetSpeed = this.character.max_velocity;
			if (distance < this.slowRadius) {
				targetSpeed = targetSpeed * distance / this.slowRadius;
			}
			steering.linear = direction.normalize();
			// Give full acceleration
			
			steering.linear = steering.linear.multiply(targetSpeed);
			
			return steering;
		}
	});

	ai.steering.Align = Class.extend({
		init: function(character, target) {
			this.character = character;
			this.target = target;
			this.max_rotation = 0.2;
			this.target_radius = 0.1;
			this.slow_radius = 0.5;
			this.time_to_target = 0.1;
		},
		get: function() {
			var steering = new ai.steering.Output();

			var rotation = this.target.orientation - this.character.orientation;

			return steering;
		}
	});

});