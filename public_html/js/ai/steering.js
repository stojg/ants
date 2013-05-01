define(['class', 'libs/sylvester-0-1-3/sylvester.src'], function () {

	var vec = Vector.create;

	ai = {};
	ai.steering = ai.steering || {};

	ai.steering.kinematics = Class.extend({
		init: function(args) {
			this.position = args.position || vec([0, 0]);
			this.velocity = args.velocity || vec([0, 0]);
			this.orientation = args.orientation || 0;
			this.max_velocity = args.max_velocity || 0;
		}
	});

	ai.steering.output = Class.extend({
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
	
	ai.steering.seek = Class.extend({
		init: function(character, target) {
			this.character = character;
			this.target = target;
		},
		get: function() {
			var steering = new ai.steering.output();
			steering.linear = this.target.position.subtract(this.character.position);
			steering.linear = steering.linear.normalize(steering.linear);
			// Give full acceleration
			steering.linear = steering.linear.multiply(this.character.max_velocity);
			return steering;
		}
	});

	ai.steering.flee = ai.steering.seek .extend({
		
		get: function() {
			var steering = new ai.steering.output();
			steering.linear = this.character.position.subtract(this.target.position);
			steering.linear = steering.linear.normalize(steering.linear);
			// Give full acceleration
			steering.linear = steering.linear.multiply(this.character.max_velocity);
			return steering;
		}
	});


});