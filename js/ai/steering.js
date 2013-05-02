define(['class', 'libs/sylvester-0-1-3/sylvester.src'], function () {

	var vec = Vector.create;

	ai = {};
	ai.steering = ai.steering || {};

	ai.steering.Kinematics = Class.extend({
		init: function(args) {
			// current state
			this.position = args.position || vec([0, 0]);
			this.velocity = args.velocity || vec([0, 0]);
			this.orientation = args.orientation || 0;
			this.rotation = args.rotation || 0;
			// speed / velocity limits
			this.max_velocity = args.max_velocity || 0;
			this.max_acceleration = args.max_acceleration || 0,
			// rotation limits
			this.max_angular_velocity = args.max_angular_velocity || 0;
			this.max_angular_acceleration = args.max_angular_acceleration || 0;
		}
	});

	ai.steering.Output = Class.extend({
		init: function() {
			this.linear = vec([0, 0]);
			this.angular = 0;
		},
		acceleration: function() {
			return this.linear;
		},
		rotation: function() {
			return this.angular;
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
			steering.linear = steering.linear.multiply(this.character.max_acceleration);
			return steering;
		}
	});

	ai.steering.Flee = ai.steering.Seek.extend({
		
		get: function() {
			var steering = new ai.steering.Output();
			steering.linear = this.character.position.subtract(this.target.position);
			steering.linear = steering.linear.normalize(steering.linear);
			// Give full acceleration
			steering.linear = steering.linear.multiply(this.character.max_acceleration);
			return steering;
		}
	});

	ai.steering.Arrive = Class.extend({
		init: function(character, target) {
			this.character = character;
			this.target = target;
			this.targetRadius = 10;
			this.slow_radius = 30;
			this.timeToTarget = 0.1;
		},
		get: function() {
			var steering = new ai.steering.Output();
			
			var direction = this.target.position.subtract(this.character.position);
			var distance = direction.length();

			// We're there, we're there!
			if(distance < this.targetRadius) {
				return steering;
			}

			// Go max speed
			var target_speed = this.character.max_velocity;
			// unless we're in the slowRadius
			if(distance < this.slow_radius) {
				target_speed = this.character.max_velocity * distance / this.slow_radius;
			}

			// The target velocity combines speed and direction
			var targetVelocity = direction;
			targetVelocity = targetVelocity.normalize();
			targetVelocity = targetVelocity.multiply(target_speed);

			// acceleration tries to get to the target velocity
			
			steering.linear = targetVelocity.subtract(this.character.velocity);
			steering.linear = steering.linear.multiply(1/this.timeToTarget);
			
			if(steering.linear.length() > this.character.max_acceleration) {
				steering.linear = steering.linear.normalize();
				steering.linear = steering.linear.multiply(this.character.max_acceleration);
			}
			
			return steering;
		}
	});

	ai.steering.Align = Class.extend({
		init: function(character, target) {
			this.character = character;
			this.target = target;
			this.max_rotation = 0.2;
			this.target_radius = 5;
			this.slow_radius = 20;
			this.time_to_target = 0.1;
		},
		get: function() {
			var steering = new ai.steering.Output();

			var rotation = this.target.orientation - this.character.orientation;
			
			rotation = this.mapToRange(rotation);
			var rotation_size = Math.abs(rotation);

			if(rotation_size < this.target_radius) {
				return steering;
			}

			var target_rotation = this.max_rotation;
			if(rotation_size < this.slow_radius) {
				target_rotation = this.max_rotation * rotation_size / this.slow_radius;
			}
			target_rotation *= rotation / rotation_size;

			steering.angular = target_rotation - this.character.rotation;
			steering.angular /= this.time_to_target;

			var angular_acceleration = Math.abs(steering.angular);
			if(angular_acceleration > this.character.max_angular_acceleration) {
				
				steering.angular /= angular_acceleration;
				steering.angular *= this.character.max_angular_acceleration;
			}
			return steering;
		},

		mapToRange: function(rotation) {
			if(Math.abs(rotation) > 180) {
				if(rotation<0) {
					rotation +=360;
				} else {
					rotation -= 360;
				}
			}
			return rotation;
		}
	});
	
	ai.steering.Face = ai.steering.Align.extend({

		get : function() {
			var direction = this.target.position.subtract(this.character.position);
			if(direction.length() === 0) {
				return new ai.steering.Output;
			}
			var radians = Math.atan2(-direction.e(1), direction.e(2));
			this.target.orientation = radians * 180 / Math.PI;
			// I have a wicked coordinate system
			this.target.orientation +=90;
			return this._super();
		}

	});

});