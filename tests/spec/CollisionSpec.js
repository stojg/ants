define(['collision', 'gameobject', 'libs/QuadTree'], function(Collision, GameObject) {


	describe("Collision.Detector", function() {

		var detector;

		var object1 = {
			position: {x: 4, y: 0},
			positionPrevious: {x: 0, y: 0},
			size: {x : 3, y: 3},
			name: 'object1',
			get_collision: function() {
				var t = new Collision.Circle(3);
				t.set_object(this);
				return t;
			}
		};
		var object2 = {
			position: {x: 6, y: 0},
			positionPrevious: {x: 10, y: 0},
			size: {x : 3, y: 3},
			name: 'object2',
			get_collision: function() {
				var t = new Collision.Circle(3);
				t.set_object(this);
				return t;
			}
		};

		var object3 = {
			position: {x: 20, y: 20},
			positionPrevious: {x: 20, y: 20},
			size: {x : 3, y: 3},
			name: 'object3',
			get_collision: function() {
				var t = new Collision.Circle(3);
				t.set_object(this);
				return t;
			}
		};

		var allObjects = {
			object1: object1,
			object2: object2,
			object3: object3
		};

		beforeEach(function() {
			var bounds = {x: -50, y: -50, width: 50, height: 50}
			var quad = new QuadTree(bounds, true, 10);
			quad.clear();
			for(var key in allObjects) {
				quad.insert({
					x:allObjects[key].position.x,
					y:allObjects[key].position.y,
					height:allObjects[key].size.x,
					width:allObjects[key].size.y,
					node: allObjects[key]
				});
			}
			detector = new Collision.Detector(allObjects, quad);
			detector.reset();
		});

		it('should have three objects', function() {
			expect(detector.count()).toEqual(3);
		});

		it('There should be two colliding objects', function() {
			detector.test();
			expect(detector.num_collisions()).toEqual(2);
		});

		it('After resetting the collision there should be no collision', function() {
			detector.test();
			detector.reset();
			expect(detector.num_collisions()).toEqual(0);
		});

		it('No one collided with object3', function() {
			detector.test();
			expect(detector.who_collided_with(object3)).toEqual({});
		});

		it('Object1 collided with object2 and vs', function() {
			detector.test();
			expect(detector.who_collided_with(object1)).toEqual([{with : 'object2', result: [-4, 0]}]);
			expect(detector.who_collided_with(object2)).toEqual([{with : 'object1', result: [4, 0]}]);
		});

		it('contact resolution', function() {
			detector.test();
			detector.resolve();
			expect(object1.position.x).toEqual(2);
			expect(object1.position.y).toEqual(0);
			expect(object2.position.x).toEqual(8);
			expect(object2.position.y).toEqual(0);
			expect(object3.position.x).toEqual(20);
			expect(object3.position.y).toEqual(20);
			expect(detector.num_collisions()).toEqual(0);
		});

		it('contact resolution with one stationary', function() {
			var object1 = {position: {x: 4, y: 0}, positionPrevious: {x: 0, y: 0}, name: 'object1', get_collision: function() {
				var t = new Collision.Circle(3);
				t.set_object(this);
				return t;
				},
				size: {x : 3, y: 3}
			};
			var object2 = {position: {x: 8, y: 0}, positionPrevious: {x: 8, y: 0}, name: 'object2', get_collision: function() {
					var t = new Collision.Circle(3);
					t.set_object(this);
					return t;
				},
				size: {x : 3, y: 3}
			};
			var quad = new QuadTree({x: -50,y:-50,width:50,height:50}, true, 10);
			quad.insert({x:object1.position.x,y:object1.position.y,height:object1.size.x,width:object1.size.y,node: object1});
			quad.insert({x:object2.position.x,y:object2.position.y,height:object2.size.x,width:object2.size.y,node: object2});
			var detector = new Collision.Detector({object1: object1, object2: object2}, quad);
			detector.test();
			detector.resolve();
			expect(object1.position.x).toEqual(2);
			expect(object1.position.y).toEqual(0);
			expect(object2.position.x).toEqual(8);
			expect(object2.position.y).toEqual(0);
		});

	});

	describe("Collision.Circle", function() {
		var circleA;
		var circleB;

		beforeEach(function() {
			circleA = new Collision.Circle(5);
			circleB = new Collision.Circle(3);
		});

		it("get_radius should return correct values", function() {
			expect(circleA.get_radius()).toEqual(5);
			expect(circleB.get_radius()).toEqual(3);
		});

		it("A should not collide with B", function() {
			circleA.set_object(new GameObject({position: {x: 0, y: 0}}));
			circleB.set_object(new GameObject({position: {x: 8, y: 0}}));
			expect(circleA.vs_circle(circleB)).toEqual(false);
		});

		it("A should collide with B when B is at the right", function() {
			circleA.set_object(new GameObject({position: {x: 0, y: 0}}));
			circleB.set_object(new GameObject({position: {x: 7, y: 0}}));
			expect(circleA.vs_circle(circleB)).toEqual([-1, 0]);
		});

		it("A should collide with B when B is at the left", function() {
			circleA.set_object(new GameObject({position: {x: 7, y: 0}}));
			circleB.set_object(new GameObject({position: {x: 0, y: 0}}));
			expect(circleA.vs_circle(circleB)).toEqual([1, 0]);
		});

		it("A should collide with B when B is above", function() {
			circleA.set_object(new GameObject({position: {x: 0, y: 0}}));
			circleB.set_object(new GameObject({position: {x: 0, y: 7}}));
			expect(circleA.vs_circle(circleB)).toEqual([0, -1]);
		});

		it("A should collide with B when B is below", function() {
			circleA.set_object(new GameObject({position: {x: 0, y: 7}}));
			circleB.set_object(new GameObject({position: {x: 0, y: 0}}));
			expect(circleA.vs_circle(circleB)).toEqual([0, 1]);
		});

		it("A should collide with B when B is directly on top", function() {
			circleA.set_object(new GameObject({position: {x: 0, y: 7}}));
			circleB.set_object(new GameObject({position: {x: 0, y: 7}}));
			expect(circleA.vs_circle(circleB)).toEqual([0, 0]);
		});
	});
});