define(["game"], function(Game){

	var init = function() {
		Game.init('game-world');
		Game.world.width = 32*10;
		Game.world.height = 32*10;
	};

	return {
		init: init
	}
});