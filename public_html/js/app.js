define(["game"], function(Game){

	var init = function() {

		pulse.ready(function() {
			
			Game.world.width = 96*10;
			Game.world.height = 32*10;
			var engine = Game.init('game-world');

			// Create a layer and add it to the scene.
			var layer = new pulse.Layer();
			layer.position = {x: 0, y: 0};
			layer.anchor = {x: 0, y: 0};
			
			layer.addNode(create_ant([20, 30], [10, 0],  0, layer));
			layer.addNode(create_ant([40, 30], [-10, 0], 180, layer));

			layer.addNode(create_ant([20, 40], [15, 0], 0, layer));
			layer.addNode(create_ant([40, 40], [5, 0],  0, layer));

			layer.addNode(create_ant([60, 20], [0, 5],  90, layer));
			layer.addNode(create_ant([60, 40], [0, -5], 270, layer));

			layer.addNode(create_ant([60, 60], [5, 5], 45, layer));
			layer.addNode(create_ant([80, 80], [-5, -5], 225, layer));

			layer.addNode(create_ant([20, 20], [0, -10], 90, layer));

			layer.addNode(create_vertical_wall([1,160], layer));
			layer.addNode(create_vertical_wall([960,160], layer));
			layer.addNode(create_horizontal_wall([480,0], layer));
			layer.addNode(create_horizontal_wall([480,319], layer));
			
			// Create a scene.
			var scene = new pulse.Scene();
			scene.addLayer(layer);

			engine.scenes.addScene(scene);
			engine.scenes.activateScene(scene);

			engine.go(1, update);
		});
	};

	var create_ant = function (pos, velocity, rotation, layer) {
		return new Movable({
			src: new pulse.Texture({
				filename: 'img/ant.png'
			}),
			size: {x: 6, y: 3},
			position: { x: pos[0], y: pos[1] },
			anchor: {x: 0.5, y: 0.5},
			layer: layer,
			velocity: {x: velocity[0], y:velocity[1]},
			rotation: rotation,
		});
	};

	var create_horizontal_wall = function(position, layer) {
		var vertical_wall = new pulse.Texture({filename: 'img/horizontal.png'});
		return new Movable({
			src: vertical_wall,
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 960, y: 1},
			static: true
		});
	}

	var create_vertical_wall = function(position, layer) {
		var vertical_wall = new pulse.Texture({filename: 'img/vertical.png'});
		return new Movable({
			src: vertical_wall,
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 1, y: 360},
			static: true
		});
	}
	
	var update = function(elapsed) {}

	return {
		init: init
	}
});