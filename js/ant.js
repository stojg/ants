define(['pulse', 'movable', 'state', 'ai/steering', 'libs/sylvester.src'], function (pulse, Movable, State) {

	var Ant = Movable.extend({
		init : function(args) {
			args = args || {};
			args.src = new pulse.Texture({filename: 'img/ant3.png'});
			args.size = { width: 7, height: 5 };
			args.collision = { width: 5, height: 3 };
			args.max_velocity = 60;
			args.max_acceleration = 0.1;
			args.max_angular_velocity = 0.5;
			args.max_angular_acceleration = 0.2;
			args.type = 'ant';
			this._super(args);
			this.setup_animations();

			this.inventory = false;
			this.statemachine = new ai.state.Machine(new State.find_food(this));
		},

		carries: function(what) {
			return this.inventory;
		},
				
		update : function(elapsed) {
			var steering = new ai.steering.PrioritySteering();
			steering.push(new ai.steering.ObstacleAvoidance(this.kinematics(), this.get_closest('obstacle')));
			var ants = this.get_closest('ant');
			steering.push(new ai.steering.CollisionAvoidance(this.kinematics(), ants));
			steering.push(new ai.steering.Separation(this.kinematics(), ants));
			var actions = this.statemachine.update();
			if(actions.indexOf('seek_food_action') >= 0) {
				var foods = this.get_closest('food');
				var food_target = foods[0];
				steering.push(new ai.steering.Arrive(this.kinematics(), food_target));
			} else if(actions.indexOf('pickup_food_action') >= 0) {
				this.inventory = true;
			} else if(actions.indexOf('is_home_action') >= 0) {
				this.inventory = false;
			} else if(actions.indexOf('seek_home_action') >= 0) {
				var homes = this.get_closest('home');
				var home_target = homes[0];
				steering.push(new ai.steering.Arrive(this.kinematics(), home_target));
			}
			var actuated_steering = this.actuate(steering.get(), elapsed);
			this.animate();
			this.velocity = actuated_steering.velocity;
			this.rotation = actuated_steering.rotation;
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
			};
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
		},

		previousAnimation : '',
		currentAnimation: '',

		animate: function() {
			var speed = $V([this.velocity.x, this.velocity.y]).length();

			if(speed > this.max_velocity/2) {
				if(this.carries('food')) {
					this.currentAnimation = 'running_food';
				} else {
					this.currentAnimation = 'running';
				}
				
			} else if (speed > 0 ) {
				if(this.carries('food')) {
					this.currentAnimation = 'walking_food';
				} else {
					this.currentAnimation = 'walking';
				}
			} else {
				if(this.carries('food')) {
					this.currentAnimation = 'idle_food';
				} else {
					this.currentAnimation = 'idle';
				}
			}

			if(this.currentAnimation !== this.previousAnimation) {
				var actions = this.runningActions;
				for(var key in actions) {
					actions[key].stop();
				}
				this.runAction(this.currentAnimation);
				this.previousAnimation = this.currentAnimation;
			}
		},
				
		setup_animations: function() {
			var idle = new pulse.AnimateAction({
				name: 'idle',
				size : { width:7, height:5 },
				bounds : { width: 28, height:5},
				frames : [0],
				frameRate : 1
			});
			this.addAction(idle);

			var walking = new pulse.AnimateAction({
				name: 'walking',
				size : { width:7, height:5 },
				bounds : { width: 28, height:5},
				frames : [0,1],
				frameRate : 5
			});
			this.addAction(walking);

			var running = new pulse.AnimateAction({
				name: 'running',
				size : { width:7, height:5 },
				bounds : { width: 28, height:5},
				frames : [0,1],
				frameRate : 10
			});
			this.addAction(running);

			var idle_food = new pulse.AnimateAction({
				name: 'idle_food',
				size : { width:7, height:4 },
				bounds : { width: 7, height:5},
				frames : [3],
				frameRate : 5
			});
			this.addAction(idle_food);

			var walking_food = new pulse.AnimateAction({
				name: 'walking_food',
				size : { width:7, height:4 },
				bounds : { width: 7, height:5},
				frames : [3],
				frameRate : 5
			});
			this.addAction(walking_food);

			var running_food = new pulse.AnimateAction({
				name: 'running_food',
				size : { width:7, height:4 },
				bounds : { width: 7, height:5},
				frames : [3],
				frameRate : 10
			});
			this.addAction(running_food);
		}

	});

	return Ant;
});