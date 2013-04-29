define(['movable', 'pulse'], function (Movable) {
    //Do setup work here
	var game = {};

	game.world = {
		width: 0,
		height: 0
	};
	
	game.init = function(canvasID) {
		
		pulse.ready(function() {
			// Create an engine.
			var engine = new pulse.Engine({
				gameWindow: canvasID,
				size: {
					width: game.world.width,
					height: game.world.height
				}
			});

			// Create a scene.
			var scene = new pulse.Scene();

			// Create a layer and add it to the scene.
			var layer = new pulse.Layer();
			layer.position = {x: 0, y: 0};
			layer.anchor = {x: 0, y: 0};
			scene.addLayer(layer);

			// Create a label and add it to the layer.
			var sprite = new Movable({
				src: new pulse.Texture({
					filename: '/ants/public_html/img/ant.png'
				})
			});
			sprite.position = {
				x: game.world.width/2,
				y: game.world.height/2
			};
			sprite.anchor = {x: 0, y: 0};
			layer.addNode(sprite);

			engine.scenes.addScene(scene);
			engine.scenes.activateScene(scene);

			engine.go(10);
		});
	}
	return game;
});