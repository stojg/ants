"use strict";
define(["game", "gameobject", "ant", "collision", "kdTree", "libs/QuadTree"], function(Game, GameObject, Ant, Collision){

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
			
			for (var i = 0; i < 20; i++) {
				var posX = Math.random()*960;
				var posY = Math.random()*320;
				layer.addNode(Ant.create({x: posX,y: posY}, layer, new Collision.Circle({x:posX, y:posY}, 3)));
			}
			for (var i = 0; i < 20; i++) {
				layer.addNode(create_stone([(Math.random()*960), (Math.random()*320)], layer));
			}
			layer.addNode(create_stone([300,140], layer));
			layer.addNode(create_stone([600,110], layer));
			//layer.addNode(create_vertical_wall([1,160], layer));
			//layer.addNode(create_vertical_wall([960,160], layer));
			//layer.addNode(create_horizontal_wall([480,0], layer));
			//layer.addNode(create_horizontal_wall([480,319], layer));

			// Create a scene.
			var scene = new pulse.Scene();
			scene.name = 'main';

			scene.addLayer(bg_layer);
			scene.addLayer(layer);

			window.engine.scenes.addScene(scene);
			window.engine.scenes.activateScene(scene);

			layer.on('mouseup', function(args) {
				layer.addNode(Ant.create(args.position, layer, new Collision.Circle(args.position, 3)));
			});

			var bounds = {x:0,y:0,width:Game.world.width,height:Game.world.height}
			window.quad = new QuadTree(bounds, true, 10);
			window.engine.go(30, update);
		});
	};

	var update = function(elapsed) {
		var main_scene = window.engine.scenes.getScene('main');
		set_graph(main_scene.getLayer('action'));
		var detector = new Collision.Detector(main_scene.getLayer('action').objects, window.quad);
		detector.test();
		detector.resolve();
	};

	var create_stone = function(position, layer) {
		return new GameObject({
			src: 'img/stone.png',
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 20, y: 20},
			anchor: {x: 0.5, y: 0.5},
			static: true,
			type: 'obstacle'
		}, new Collision.Circle({x:position[0], y:position[1]}, 10));
	};

	var create_horizontal_wall = function(position, layer) {
		return new GameObject({
			src: 'img/horizontal.png',
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 960, y: 1},
			static: true,
			type: 'wall'
		}, new Collision.Circle({x:position[0], y:position[1]}, 1));
	};

	var create_vertical_wall = function(position, layer) {
		return new GameObject({
			src: 'img/vertical.png',
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 1, y: 360},
			static: true,
			type: 'wall'
		}, new Collision.Circle({x:position[0], y:position[1]}, 1));
	};

	var create_home = function(position, layer) {
		return new GameObject({
			src: new pulse.Texture({filename: 'img/home.png'}),
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 10, y: 10},
			static: true,
			collidable: false,
			type: 'home'
		}, new Collision.Circle({x:position[0], y:position[1]}, 1));
	};

	var create_food = function(position, layer) {
		return new GameObject({
			src: new pulse.Texture({filename: 'img/food.png'}),
			position: {x:position[0], y:position[1]},
			layer: layer,
			size: {x: 4, y: 4},
			static: true,
			collidable: false,
			type: 'food'
		}, new Collision.Circle({x:position[0], y:position[1]}, 1));
	};
	
	var distance = function(a, b){
		return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);
	}

	var set_graph = function(action_layer) {
		window.engine.graph = window.engine.graph || [];
		var nodes = action_layer.getNodesByType(pulse.Sprite);
		var list = [];
		list['all']  = [];
		window.quad.clear();
		for(var key in nodes) {
			window.quad.insert({
				x:nodes[key].position.x,
				y:nodes[key].position.y,
				height:nodes[key].size.x,
				width:nodes[key].size.y,
				node: nodes[key]
			});
			
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