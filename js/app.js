define(["game", "ant", "libs/kd-tree/kdTree"], function(Game, ant, PriorityQueue){

	var init = function() {

		pulse.ready(function() {
			
			Game.world.width = 96*10;
			Game.world.height = 32*10;
			window.engine = Game.init('game-world');

			var bg_layer = new pulse.Layer();
			
			bg_layer.position = {x: 0, y: 0};
			bg_layer.anchor = {x: 0, y: 0};
			
			var bg = new pulse.Sprite({
				src: 'img/textures/grass/grass07.jpg'
			});
			bg.size = {width: 512 , height: 512};
			bg.position = {x: 256,y: 256};
			bg_layer.addNode(bg);
			var bg2 = new pulse.Sprite({
				src: 'img/textures/grass/grass07.jpg'
			});
			bg2.size = {width: 512 , height: 512};
			bg2.position = {x: 768,y: 256};
			bg_layer.addNode(bg2);

			// Create a layer and add it to the scene.
			var layer = new pulse.Layer();
			layer.position = {x: 0, y: 0};
			layer.anchor = {x: 0, y: 0};
			layer.name = 'action';
			layer.addNode(create_home([160, 160], layer));
			layer.addNode(create_food([680, 100], layer));
			
			layer.addNode(create_ant({x: 160, y:160}, [0, 0], 0, layer));

			for (var i = 0; i < 20; i++) {
				layer.addNode(create_stone([Math.random()*960,Math.random()*320], layer));
			}

			layer.addNode(create_stone([300,140], layer));
			layer.addNode(create_stone([600,110], layer));
			layer.addNode(create_vertical_wall([1,160], layer));
			layer.addNode(create_vertical_wall([960,160], layer));
			layer.addNode(create_horizontal_wall([480,0], layer));
			layer.addNode(create_horizontal_wall([480,319], layer));

			// Create a scene.
			var scene = new pulse.Scene();
			scene.name = 'main';

			scene.addLayer(bg_layer);
			scene.addLayer(layer);

			var debug_layer = new pulse.Layer();
			debug_layer.position = {x: 0, y: 0};
			debug_layer.anchor = {x: 0, y: 0};
			debug_layer.name = 'debug';
			scene.addLayer(debug_layer);

			window.engine.scenes.addScene(scene);
			window.engine.scenes.activateScene(scene);

			layer.on('mouseup', function(args) {
				layer.addNode(create_ant(args.position, [0, 0], Math.random()*360, layer));
			});

			window.engine.go(30, update);
		});
	};

	var create_ant = function (position, velocity, rotation, layer) {
		return new Ant({
			position: position,
			layer: layer,
			velocity: {x: velocity[0], y:velocity[1]},
			rotation: rotation,
			static: false
		});
	};

	var create_stone = function(position, layer) {
		return new Movable({
			src: 'img/stone.png',
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 20, y: 20},
			collision: { width: 18, height: 18 },
			anchor: {x: 0.5, y: 0.5},
			static: true,
			type: 'obstacle'
		});
	};

	var create_horizontal_wall = function(position, layer) {
		return new Movable({
			src: 'img/horizontal.png',
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 960, y: 1},
			static: true,
			type: 'wall'
		});
	};

	var create_vertical_wall = function(position, layer) {
		return new Movable({
			src: 'img/vertical.png',
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 1, y: 360},
			static: true,
			type: 'wall'
		});
	};

	var create_home = function(position, layer) {
		var home = new pulse.Texture({filename: 'img/home.png'});
		return new Movable({
			src: home,
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 10, y: 10},
			static: true,
			collidable: false,
			type: 'home'
		});
	};

	var create_food = function(position, layer) {
		var food = new pulse.Texture({filename: 'img/food.png'});
		return new Movable({
			src: food,
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 4, y: 4},
			static: true,
			collidable: false,
			type: 'food'
		});
	};
	
	var update = function(elapsed) {
		var main_scene = window.engine.scenes.getScene('main');
		var action_layer = main_scene.getLayer('action');
		get_graph(action_layer);
	};

	var distance = function(a, b){
		return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);
	}

	var get_graph = function(action_layer) {
		window.engine.graph = window.engine.graph || [];
		var nodes = action_layer.getNodesByType(pulse.Sprite);
		var list = [];
		list['all']  = [];
		for(var key in nodes) {
			if(typeof list[nodes[key].type] === 'undefined') {
				list[nodes[key].type] = [];
			}
			list[nodes[key].type].push({node: nodes[key], x: nodes[key].position.x, y: nodes[key].position.y});
			list['all'].push({node: nodes[key], x: nodes[key].position.x, y: nodes[key].position.y});
		}

		for(var type in list) {
			window.engine.graph[type] = new kdTree(list[type], distance, ["x", "y"]);
		}
	};

	return {
		init: init
	};
});