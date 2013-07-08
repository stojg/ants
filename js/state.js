define(['class'], function () {

	var State = State || {};
	var Transition = Transition || {};

	Transition.found_food = Class.extend({
		init: function(ant) {
			this.ant = ant;
		},
		is_triggered: function() {
			var food_items = this.ant.get_closest('food');
			for(var key in food_items) {
				var distance = food_items[key].position.distanceFrom(this.ant.kinematics().position);
				if(distance < 8) {
					return true;
				}
			}
			return false;
		},
		get_target_state: function() {
			return new State.state_pickup_food(this.ant);
		},
		get_action: function() {
			return 'found_food_action';
		}
	});

	Transition.carries_food = Class.extend({
		init: function(ant) {
			this.ant = ant;
		},
		is_triggered: function() {
			return this.ant.carries('food');
		},
		get_target_state: function() {
			return new State.state_go_home(this.ant);
		},
		get_action: function() {
			return 'have_food_action';
		}
	});

	Transition.is_home = Class.extend({
		init: function(ant) {
			this.ant = ant;
		},
		is_triggered: function() {
			var homes = this.ant.get_closest('home');
			for(var key in homes) {
				var distance = homes[key].position.distanceFrom(this.ant.kinematics().position);
				if(distance < 10) {
					return true;
				}
			}
			return false;

		},
		get_target_state: function() {
			return new State.find_food(this.ant);
		},
		get_action: function() {
			return 'is_home_action';
		}
	});

	State.state_pickup_food = Class.extend({
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
				new Transition.carries_food(this.ant)
			];
		}
	});

	State.find_food = Class.extend({
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
				new Transition.found_food(this.ant)
			];
		}
	});

	State.state_go_home = Class.extend({
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
				new Transition.is_home(this.ant)
			];
		}
	});

	return State;

});