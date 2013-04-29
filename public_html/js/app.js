define(["game", "libs/pulse/bin/pulse"], function(Game, Pulse){

	var init = function() {
		
		Game.init(Pulse);
		
		Game.world.width = 32*10;
		Game.world.height = 32*10;
		
	};

	return {
		init: init
	}
});