define(['pulse', 'movable', 'ai/steering', 'libs/sylvester-0-1-3/sylvester.src'], function (pulse, Movable) {

	var transition_found_food = Class.extend({
		init: function(ant) {
			this.ant = ant;
		},
		is_triggered: function() {
			var food_items = this.ant.get_others('food');
			for(var key in food_items) {
				var distance = food_items[key].kinematics().position.distanceFrom(this.ant.kinematics().position);
				if(distance < 8) {
					return true;
				}
			}
			return false;
		},
		get_target_state: function() {
			return new state_pickup_food(this.ant);
		},
		get_action: function() {
			return 'found_food_action';
		}
	});

	var transition_carries_food = Class.extend({
		init: function(ant) {
			this.ant = ant;
		},
		is_triggered: function() {
			return this.ant.carries('food');
		},
		get_target_state: function() {
			return new state_go_home(this.ant);
		},
		get_action: function() {
			return 'have_food_action';
		}
	});
	
	var transition_is_home = Class.extend({
		init: function(ant) {
			this.ant = ant;
		},
		is_triggered: function() {

			var food_items = this.ant.get_others('home');
			for(var key in food_items) {
				var distance = food_items[key].kinematics().position.distanceFrom(this.ant.kinematics().position);
				if(distance < 10) {
					return true;
				}
			}
			return false;
			
		},
		get_target_state: function() {
			return new state_find_food(this.ant);
		},
		get_action: function() {
			return 'is_home_action';
		}
	});

	var state_pickup_food = Class.extend({
		init: function(ant) {
			this.ant = ant;
		},
		get_entry_action: function() {
			return 'starting_pickup_food_action';
		},
		get_action: function() {
			return 'pickup_food_action';
		},
		get_exit_action: function() {
			return 'exiting_pickup_food_action';
		},
		get_transitions: function() {
			return [
				new transition_carries_food(this.ant)
			];
		}
	});

	var state_find_food = Class.extend({
		init: function(ant) {
			this.ant = ant;
		},
		get_entry_action: function() {
			return 'starting_seek_food_action';
		},

		get_action: function() {
			return 'seek_food_action';
		},

		get_exit_action: function() {
			return 'exiting_seek_food_action';
		},

		get_transitions: function() {
			return [
				new transition_found_food(this.ant)
			];
		}
	});

	var state_go_home = Class.extend({
		init: function(ant) {
			this.ant = ant;
		},
		get_entry_action: function() {
			return 'starting_seek_home_action';
		},
		get_action: function() {
			return 'seek_home_action';
		},
		get_exit_action: function() {
			return 'exiting_seek_home_action';
		},
		get_transitions: function() {
			return [
				new transition_is_home(this.ant)
			];
		}
	});

	Ant = Movable.extend({
		init : function(args) {
			args = args || {};
			args.src = new pulse.Texture({filename: 'img/ant3.png'});
			args.size = { width: 7, height: 5 };
			args.collision = { width: 5, height: 3 };
			args.max_velocity = 60;
			args.max_acceleration = 0.2;
			args.max_angular_velocity = 0.5;
			args.max_angular_acceleration = 0.2;
			args.type = 'ant';
			this._super(args);

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

			this.inventory = false;
			this.statemachine = new ai.state.Machine(new state_find_food(this));
		},

		carries: function(what) {
			return this.inventory;
		},
				
		update : function(elapsed) {

			var blended = new ai.steering.PrioritySteering();
			blended.push(new ai.steering.CollisionAvoidance(this.kinematics(), this.get_others_kinematic()));
			blended.push(new ai.steering.Separation(this.kinematics(), this.get_others_kinematic('ant')));

			var actions = this.statemachine.update();
			if(actions.indexOf('seek_food_action') >= 0) {
				var foods = this.get_others('food');
				var arrive_target = foods[0].kinematics();
				blended.push(new ai.steering.Arrive(this.kinematics(), arrive_target));
			} else if(actions.indexOf('pickup_food_action') >= 0) {
				this.inventory = true;
			} else if(actions.indexOf('is_home_action') >= 0) {
				this.inventory = false;
			} else if(actions.indexOf('seek_home_action') >= 0) {
				var homes = this.get_others('home');
				var home_target = homes[0].kinematics();
				blended.push(new ai.steering.Arrive(this.kinematics(), home_target));
			} else {
				//console.log(actions);
			}

			var steering = this.actuate(blended.get(), elapsed);
			this.animate();
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
		}
	});
	
});