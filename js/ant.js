define(['gameobject', 'state', 'ai/steering'], function (GameObject, State) {

	var Ant = GameObject.extend({
		inventory: false,
		
		init : function(args, initial_state, collision) {
			args = args || {};
			args.type = 'ant';
			this._super(args, collision);
			this.setup_animations();
			this.statemachine = new State.Machine(new initial_state(this));
		},

		carries: function(what) {
			return this.inventory;
		},
		
		delta: 0,

		update : function(elapsed) {
			this.delta += elapsed;
			

			//console.log(this.steering);
			if(this.delta > 50 ) {
				this.steering = new ai.steering.PrioritySteering();
				this.steering.push(new ai.steering.ObstacleAvoidance(this.kinematics(), this.get_closest('obstacle')));
				var ants = this.get_closest('ant');
				this.steering.push(new ai.steering.CollisionAvoidance(this.kinematics(), ants));
				this.steering.push(new ai.steering.Separation(this.kinematics(), ants));
				this.delta = 0;
				this.update_state();
			}
			if(typeof this.steering !== 'undefined') {
				this.actuate(this.steering.get(), elapsed);	
			}
			
			this._super(elapsed);
			this.animate();
		},

		update_state: function(elapsed) {
			var actions = this.statemachine.update();
			if(actions.indexOf('seek_food_action') >= 0) {
				this.steering.push(new ai.steering.Arrive(this.kinematics(), this.get_closest('food')[0]));
			}
			if(actions.indexOf('pickup_food_action') >= 0) {
				this.inventory = true;
			}
			if(actions.indexOf('is_home_action') >= 0) {
				this.inventory = false;
			}
			if(actions.indexOf('seek_home_action') >= 0) {
				this.steering.push(new ai.steering.Arrive(this.kinematics(), this.get_closest('home')[0]));
			}
		},

		actuate : function(output, elapsed) {
			var new_velocity = this.get_actuated_velocity(output, elapsed);
			this.velocity = {
				x : new_velocity.e(1),
				y : new_velocity.e(2)
			};
			this.rotation = this.get_actuated_rotation(output, elapsed)
		},

		get_actuated_velocity: function(output, elapsed) {
			var velocity_change = output.acceleration().multiply(elapsed);
			var new_velocity = $V([this.velocity.x, this.velocity.y]);
			// if there are no acceleration, brake.
			if(velocity_change.length() === 0) {
				return new_velocity.multiply(0.80);
			}
			new_velocity = new_velocity.add(velocity_change);
			// trim back to maximum speed
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

		currentAnimation : false,

		animate: function() {
			var speed = $V([this.velocity.x, this.velocity.y]).length();

			var newAnimation = 'idle';

			if(speed > this.max_velocity/2) {
				newAnimation = 'running';
			} else if (speed > 0 ) {
				newAnimation = 'walking';
			}

			if(this.carries('food')) {
				newAnimation = newAnimation + '_food';
			}

			if(newAnimation !== this.currentAnimation) {
				for(var key in this.runningActions) {
					this.runningActions[key].stop();
				}
				this.runAction(newAnimation);
				this.currentAnimation = newAnimation;
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

	// Factory method
	Ant.create = function(position, layer, collision) {

		return new Ant({
			size : { width: 7, height: 5 },
			collision : { width: 5, height: 3 },
			max_velocity : 60,
			max_acceleration : 0.1,
			max_angular_velocity : 0.5,
			max_angular_acceleration : 0.2,
			src: new pulse.Texture({filename: 'img/ant3.png'}),
			position: position,
			layer: layer,
			static: false
		}, State.find_food, collision);
	}

	return Ant;
});