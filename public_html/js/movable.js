define(function () {

	Movable = pulse.Sprite.extend({

		init: function(args) {
			args = args || {};
			this._super(args);
			this.position = args.position || {x: 0, y: 0};
			this.velocity = args.velocity || [0, 0];
			this.angular_velocity = args.angular_velocity || 0;
		},

		update: function(elapsed) {
			this.position.x += 1;
			this._super(elapsed);
		}
	});

	return Movable;

});