define(['pulse', 'movable', 'ai/steering', 'libs/sylvester-0-1-3/sylvester.src'], function (pulse, Movable) {

	var transition_found_food = Class.extend({
		init: function(ant) {
			this.ant = ant;
		},
		is_triggered: function() {
			var food_items = this.ant.get_others('food');
			for(key in food_items) {
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
			for(key in food_items) {
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
			args.src = new pulse.Texture({filename: 'img/ant2.png'});
			args.size = {x: 4, y: 2};
			args.max_velocity = 60;
			args.max_acceleration = 0.1;
			args.max_angular_velocity = 0.5;
			args.max_angular_acceleration = 0.2;
			args.type = 'ant';
			this._super(args);

			this.inventory = false;
			this.statemachine = new ai.state.Machine(new state_find_food(this));
		},

		carries: function(what) {
			return this.inventory;
		},
				
		update : function(elapsed) {

			var blended = new ai.steering.PrioritySteering();
			blended.push(new ai.steering.Separation(this.kinematics(), this.get_others_kinematic('ant')));

			var actions = this.statemachine.update();
			if(actions.indexOf('seek_food_action') >= 0) {
				var foods = this.get_others('food')
				var target = foods[0].kinematics();
				blended.push(new ai.steering.Arrive(this.kinematics(), target));
			} else if(actions.indexOf('pickup_food_action') >= 0) {
				this.inventory = true;
			} else if(actions.indexOf('drop_food_action') >= 0) {
				this.inventory = false;
			} else if(actions.indexOf('seek_home_action') >= 0) {
				var homes = this.get_others('home');
				var target = homes[0].kinematics();
				blended.push(new ai.steering.Arrive(this.kinematics(), target));
			} else {
				console.log(actions);
			}


			

			var steering = this.actuate(blended.get(), elapsed);
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