define(['pulse', 'movable', 'ai/steering', 'libs/sylvester-0-1-3/sylvester.src'], function (pulse, Movable) {

	Ant = Movable.extend({
		init : function(args) {
			args = args || {};
			args.src = new pulse.Texture({filename: 'img/ant.png'});
			args.size = {x: 4, y: 2};
			args.max_velocity = 20;
			this._super(args);
		},
		update : function(elapsed) {
			var target = new ai.steering.kinematics({
				position: $V([250, 160])
			});
			var behaviour = new ai.steering.flee(
				this.kinematics(),
				target
			);
			this.velocity = behaviour.get().velocity();
			this._super(elapsed);
		}
	});
	return Ant;
});