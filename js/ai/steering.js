define(['class', 'libs/sylvester-0-1-3/sylvester.src'], function() {

	var vec = Vector.create;

	ai = {};
	ai.steering = ai.steering || {};

	ai.steering.Kinematics = Class.extend({
		init: function(args) {
			args = args || {};
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
			this.radius = args.radius || 0;
			this.name = args.name || '';
			this.type = args.type || 'undefined';
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
			this.targetRadius = 6;
			this.slow_radius = 20;
			this.time_to_target = 0.1;
		},
		get: function() {
			var steering = new ai.steering.Output();

			var direction = this.target.position.subtract(this.character.position);
			var distance = direction.length();

			// We're there, we're there!
			if (distance < this.targetRadius) {
				return steering;
			}

			// Go max speed
			var target_speed = this.character.max_velocity;

			// unless we're in the slowRadius
			if (distance < this.slow_radius) {
				target_speed = this.character.max_velocity * distance / this.slow_radius;
			}

			// The target velocity combines speed and direction
			var targetVelocity = direction;
			targetVelocity = targetVelocity.normalize();
			targetVelocity = targetVelocity.multiply(target_speed);

			// acceleration tries to get to the target velocity
			steering.linear = targetVelocity.subtract(this.character.velocity);
			// within the time to target
			steering.linear = steering.linear.multiply(1 / this.time_to_target);
			if (steering.linear.length() > this.character.max_acceleration) {
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

			if (rotation_size < this.target_radius) {
				return steering;
			}

			var target_rotation = this.max_rotation;
			if (rotation_size < this.slow_radius) {
				target_rotation = this.max_rotation * rotation_size / this.slow_radius;
			}
			target_rotation *= rotation / rotation_size;

			steering.angular = target_rotation - this.character.rotation;
			steering.angular /= this.time_to_target;

			var angular_acceleration = Math.abs(steering.angular);
			if (angular_acceleration > this.character.max_angular_acceleration) {

				steering.angular /= angular_acceleration;
				steering.angular *= this.character.max_angular_acceleration;
			}
			return steering;
		},
		mapToRange: function(rotation) {
			if (Math.abs(rotation) > 180) {
				if (rotation < 0) {
					rotation += 360;
				} else {
					rotation -= 360;
				}
			}
			return rotation;
		}
	});

	ai.steering.Face = ai.steering.Align.extend({
		get: function() {
			var direction = this.target.position.subtract(this.character.position);
			if (direction.length() === 0) {
				return new ai.steering.Output();
			}
			var radians = Math.atan2(-direction.e(1), direction.e(2));
			this.target.orientation = radians * 180 / Math.PI;
			// I have a wierd coordinate system, zero is that-a-way ->
			this.target.orientation += 90;
			return this._super();
		}
	});

	ai.steering.Separation = Class.extend({
		init: function(character, targets) {
			this.character = character;
			this.targets = targets;
			this.threshold = 6;
		},
		get: function() {
			var steering = new ai.steering.Output();
			for (var i = this.targets.length - 1; i >= 0; i--) {
				var direction = this.character.position.subtract(this.targets[i].position);
				var distance = direction.length();
				if (distance < this.threshold) {
					var strength = this.character.max_acceleration * (this.threshold - distance) / this.threshold;
					steering.linear = steering.linear.add(direction.normalize().multiply(strength));
				}
			}
			return steering;
		}
	});

	ai.steering.Wander = ai.steering.Face.extend({
		init: function(character) {
			this._super(character, new ai.steering.Kinematics());
			// holds the radius and forward offset of the wander circle
			this.wanderOffset = 80;
			this.wanderRadius = 30;
			// max change
			this.wanderRate = 3;
			this.wanderOrientation = 0;
		},
		get: function() {
			// 1. Calculate the target to delegate to game.Face
			// Update the wander orientation
			this.wanderOrientation += (Math.random() - Math.random()) * this.wanderRate;

			// Calculate the center of the wander cirle
			var target = this.character.position;
			target = target.add($V([this.wanderOffset, this.wanderOffset]));
			target = target.add(this.asVector(this.character.orientation));

			// Calculate the combined target orientation
			var targetOrientation = this.wanderOrientation + this.character.orientation;
			// Calculate the target location
			var temp = this.asVector(targetOrientation).multiply(this.wanderRadius);

			this.target.position = target.add(temp);

			// 2. Delegate to Face
			var steering = this._super();
			// 3. Now we set the linear acceleration
			steering.linear = this.asVector(this.character.orientation).multiply(this.character.max_acceleration);
			steering.angular = 0;
			return steering;
		},
		asVector: function(orientation) {
			return $V([Math.cos(orientation), Math.sin(orientation)]);
		}
	});

	ai.steering.CollisionAvoidance = Class.extend({
		init: function(character, targets, o) {
			this.character = character;
			this.targets = targets;
		},
		get: function() {

			// 1. Find the target that's closest to collision
			var shortestTime = 0.45;
			var steering = new ai.steering.Output();

			// Store the target that collides then, and other datea
			// that we will need and can avoid recalc
			var firstTarget = false;
			var firstMinSeparation = false;
			var firstDistance = false;
			var firstRelativePos = false;
			var firstRelativeVel = false;
			var firstRadius = 0;
			// Loop through each target
			for (var i = this.targets.length - 1; i >= 0; i--) {

				var target = this.targets[i];
				var radius = target.radius + this.character.radius;

				var relativePos = this.character.position.subtract(target.position);
				var relativeVel = target.velocity.subtract(this.character.velocity);
				var relativeSpeed = relativeVel.length();

				var timeToCollision = relativePos.dot(relativeVel) / (relativeSpeed * relativeSpeed);

				// Check if it is going to be a collision at all
				var distance = relativePos.length();

				var minSeparation = distance - (relativeSpeed * shortestTime);

				if (minSeparation > radius) {
					continue;
				}

				if (timeToCollision > 0 && timeToCollision < shortestTime) {
					// Store the time, target and other data
					shortestTime = timeToCollision;
					firstTarget = target;
					firstMinSeparation = minSeparation;
					firstDistance = distance;
					firstRelativePos = relativePos;
					firstRelativeVel = relativeVel;
					firstRadius = radius;
				}
			}

			// 2. Calculate the steering
			if (!firstTarget) {
				return steering;
			}

			var targetRelativePos = Vector.Zero(2);
			// if we're going to hit exactly, or if we're already colliding,
			// then do the steering based on current position
			if (firstMinSeparation <= 0 || firstDistance < firstRadius) {
				targetRelativePos = firstTarget.position.subtract(this.character.position);
			}
			// otherwise calculate the future relative position
			else {
				targetRelativePos = firstRelativePos.add(firstRelativeVel.multiply(shortestTime));
			}

			var flee_target = new ai.steering.Kinematics({
				position: this.character.position.add(targetRelativePos),
				velocity: firstRelativeVel
			});

			var st = new ai.steering.Evade(this.character, flee_target);
			return st.get();
		}
	});

	ai.steering.Pursue = ai.steering.Seek.extend({
		init: function(character, target) {
			this.maxPrediction = 0.5;
			this._super(character, target);
		},
		get: function() {
			var steering = new ai.steering.Output();
			var direction = this.target.position.subtract(this.character.position);
			var distance = direction.length();
			var speed = this.character.velocity.length();
			var prediction = 0;
			if (speed <= distance / this.maxPrediction) {
				prediction = this.maxPrediction;
			} else {
				prediction = distance / speed;
			}
			this.target.position.add(this.target.velocity.multiply(prediction));
			return this._super();
		}
	});

	ai.steering.Evade = ai.steering.Flee.extend({
		init: function(character, target) {
			this.maxPrediction = 0.5;
			this._super(character, target);
		},
		get: function() {
			var steering = new ai.steering.Output();
			var direction = this.target.position.subtract(this.character.position);
			var distance = direction.length();
			var speed = this.character.velocity.length();
			var prediction = 0;
			if (speed <= distance / this.maxPrediction) {
				prediction = this.maxPrediction;
			} else {
				prediction = distance / speed;
			}
			this.target.position.add(this.target.velocity.multiply(prediction));
			return this._super();
		}
	});

	ai.steering.BlendedSteering = Class.extend({
		init: function() {
			this.behaviours = [];
		},
		push: function(behaviour, weight) {
			this.behaviours.push([behaviour, weight]);
		},
		get: function() {
			var steering = new ai.steering.Output();
			for (var i = this.behaviours.length - 1; i >= 0; i--) {
				var steer = this.behaviours[i][0].get();
				steering.linear = steering.linear.add(steer.linear.multiply(this.behaviours[i][1]));
				steering.angular = steer.angular * this.behaviours[i][1];
			}
			return steering;
		}
	});

	ai.steering.PrioritySteering = Class.extend({
		init: function() {
			this.behaviours = [];
		},
		push: function(behaviour) {
			this.behaviours.push(behaviour);
		},
		get: function() {
			for (var i = 0; i < this.behaviours.length; i++) {
				var steeringResult = this.behaviours[i].get();
				if (steeringResult.linear.length() > 0 || steeringResult.angular !== 0) {
					return steeringResult;
				}
			}
			return new ai.steering.Output();
		}
	});

	ai.state = {};

	ai.state.Machine = Class.extend({
		init: function(initial_state) {
			this.initial_state = initial_state;
			this.current_state = this.initial_state;
		},
		update: function() {
			var triggered_transition = false;
			var transitions = this.current_state.get_transitions();
			for (var i = 0; i < transitions.length; i++) {
				var transition = transitions[i];
				if (transition.is_triggered()) {
					triggered_transition = transition;
					break;
				}
			}

			var actions = [];
			if (triggered_transition) {
				var target_state = triggered_transition.get_target_state();
				actions.push(this.current_state.get_exit_action());
				actions.push(triggered_transition.get_action());
				actions.push(target_state.get_entry_action());
				this.current_state = target_state;
			} else {
				actions.push(this.current_state.get_action());
			}
			return actions;
		}
	});

});