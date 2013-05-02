define(['pulse', 'movable', 'ai/steering', 'libs/sylvester-0-1-3/sylvester.src'], function (pulse, Movable) {

	Ant = Movable.extend({
		init : function(args) {
			args = args || {};
			args.src = new pulse.Texture({filename: 'img/ant2.png'});
			args.size = {x: 4, y: 2};
			args.max_velocity = 20;
			args.max_angular_velocity = 0.5;
			args.max_acceleration = 2;
			args.max_angular_acceleration = 0.2;
			args.mass = 10;
			args.m_i = 10;
			this._super(args);
		},
				
		update : function(elapsed) {
			var target = new ai.steering.Kinematics({position: $V([250, 160])});
			var behaviour = new ai.steering.Arrive(this.kinematics(), target);
			this.velocity = behaviour.get().velocity();
			this._super(elapsed);
		}
	});
	return Ant;
});