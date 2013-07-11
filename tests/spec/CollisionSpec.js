define(['collision', 'gameobject', 'libs/QuadTree'], function(Collision, GameObject) {

	var getResponse = function(x, y, normalX, normalY) {
		return {
			position: {x: x, y: y},
			normal: {x: normalX, y: normalY}
		}
	}

	var createObject = function(name, posX, posY, velX, velY, sizeX, sizeY) {
		return {
			position: {x: posX, y: posY},
			velocity: {x: velX, y: velY},
			size: {x: sizeX, y: sizeY},
			name: name,
			get_collision: function() {
				return new Collision.Circle(this.position, 3);
			}
		};
	};

	var getCollisionDetector = function() {
		var quad = new QuadTree({x: 0, y: 0, width: 50, height: 50}, true, 10);
		var allObjects = {};
		for (var key in arguments) {
			quad.insert({
				x: arguments[key].position.x,
				y: arguments[key].position.y,
				height: arguments[key].size.x,
				width: arguments[key].size.y,
				node: arguments[key]
			});
			allObjects[arguments[key].name] = arguments[key];
		}
		return new Collision.Detector(allObjects, quad);
	};

	describe("Collision.Segment", function() {
		it("1. get_start_position() should return correct value", function() {
			var segment = new Collision.Segment({x:5,y:5},{x:0,y:0});
			expect(segment.get_start_position()).toEqual({x:5,y:5});
		});
		it("2. get_end_position() should return correct value", function() {
			var segment = new Collision.Segment({x:0,y:0},{x:5,y:5});
			expect(segment.get_end_position()).toEqual({x:5,y:5});
		});

		it("3. vs_circle() should fall short →", function() {
			var circle = new Collision.Circle({x: 10, y:0}, 4);
			var segment = new Collision.Segment({x:0,y:0},{x:5,y:0});
			expect(segment.vs_circle(circle)).toEqual(false);
		});

		it("4. vs_circle() up-down should fall short ↓", function() {
			var circle = new Collision.Circle({x:0, y:0}, 4);
			var segment = new Collision.Segment({x:0,y:10},{x:0,y:5});
			expect(segment.vs_circle(circle)).toEqual(false);
		});

		it("5. vs_circle() left-right should be past →", function() {
			var circle = new Collision.Circle({x:0, y:0}, 4);
			var segment = new Collision.Segment({x:5,y:0},{x:10,y:0});
			expect(segment.vs_circle(circle)).toEqual(false);
		});
		
		it("6. vs_circle() down-up should be past ↑", function() {
			var circle = new Collision.Circle({x:0, y:0}, 4);
			var segment = new Collision.Segment({x:0,y:5},{x:0,y:10});
			expect(segment.vs_circle(circle)).toEqual(false);
		});

		it("7. vs_circle() left-right should poke →", function() {
			var circle = new Collision.Circle({x:0, y:0}, 5);
			var segment = new Collision.Segment({x:-10,y:0},{x:-5,y:0});
			expect(segment.vs_circle(circle)).toEqual(getResponse(-5,0,-1,0));
		});

		it("8. vs_circle() down-up should poke ↑", function() {
			var circle = new Collision.Circle({x:0, y:0}, 5);
			var segment = new Collision.Segment({x:0, y:10},{x:0,y:5});
			expect(segment.vs_circle(circle)).toEqual(getResponse(0,5,0,1));
		});

		it("9. vs_circle() right-left should poke ←", function() {
			var circle = new Collision.Circle({x:0, y:0}, 5);
			var segment = new Collision.Segment({x:10,y:0},{x:5,y:0});
			expect(segment.vs_circle(circle)).toEqual(getResponse(5, 0, 1, 0));
		});

		it("10. vs_circle() up-down should poke ↓", function() {
			var circle = new Collision.Circle({x:0, y:0}, 5);
			var segment = new Collision.Segment({x:0,y:10},{x:0,y:5});
			expect(segment.vs_circle(circle)).toEqual(getResponse(0, 5, 0, 1));
		});

		it("11 .vs_circle() left-right should impale →", function() {
			var circle = new Collision.Circle({x:0, y:0}, 5);
			var segment = new Collision.Segment({x:-20,y:0},{x:20,y:0});
			expect(segment.vs_circle(circle)).toEqual(getResponse(-5,0, -1,0));
		});

		it("12. vs_circle() right-left should impale ←", function() {
			var circle = new Collision.Circle({x:0, y:0}, 5);
			var segment = new Collision.Segment({x:20,y:0},{x:-20,y:0});
			expect(segment.vs_circle(circle)).toEqual(getResponse(5,0,1,0));
		});

	});

	describe("Collision.Circle", function() {
		var circleA;
		var circleB;

		var diag = 0.7071067811865476;

		beforeEach(function() {
			circleA = new Collision.Circle({x: 0, y: 0}, 5);
			circleB = new Collision.Circle({x: 9, y: 0}, 3);
		});

		it("get_radius() should return correct value", function() {
			expect(circleA.get_radius()).toEqual(5);
			expect(circleB.get_radius()).toEqual(3);
		});

		it("get_position() should return correct value", function() {
			expect(circleA.get_position()).toEqual({x: 0, y: 0});
			expect(circleB.get_position()).toEqual({x: 9, y: 0});
		});

		it('vs_point() outside circle should not collide', function() {
			expect(circleA.vs_point({x: 6, y: 0})).toEqual(false);
			expect(circleA.vs_point({x: -6, y: 0})).toEqual(false);
			expect(circleA.vs_point({x: 0, y: 6})).toEqual(false);
			expect(circleA.vs_point({x: 0, y: -6})).toEqual(false);
		});

		it('vs_point() on the border of circle should collide', function() {
			expect(circleA.vs_point({x: 5, y: 0})).toEqual(getResponse(5, 0, -1, 0));
			expect(circleA.vs_point({x: -5, y: 0})).toEqual(getResponse(-5, 0, 1, 0));
			expect(circleA.vs_point({x: 0, y: 5})).toEqual(getResponse(0, 5, 0, -1));
			expect(circleA.vs_point({x: 0, y: -5})).toEqual(getResponse(0, -5, 0, 1));

		});

		it('vs_point() inside the circle should collide', function() {
			expect(circleA.vs_point({x: 3, y: 3})).toEqual(getResponse(3, 3, -diag, -diag));
			expect(circleA.vs_point({x: -3, y: -3})).toEqual(getResponse(-3, -3, diag, diag));
			expect(circleA.vs_point({x: -3, y: 3})).toEqual(getResponse(-3, 3, diag, -diag));
		});

		it('vs_point() right on top of the circle should collide', function() {
			expect(circleA.vs_point({x: 0, y: 0})).toEqual(getResponse(0, 0, 0, 0));
		});

		it("A should not collide with B", function() {
			circleB = new Collision.Circle({x: 10, y: 0}, 4);
			expect(circleA.vs_circle(circleB)).toEqual(false);
		});

		it("A should collide with B when B is at the right", function() {
			circleB = new Collision.Circle({x: 10, y: 0}, 5);
			expect(circleA.vs_circle(circleB)).toEqual(getResponse(5, 0, -1, 0));
		});

		it("A should collide with B when B is at the left", function() {
			circleB = new Collision.Circle({x: -10, y: 0}, 5);
			expect(circleA.vs_circle(circleB)).toEqual(getResponse(-5, 0, 1, 0));
		});

		it("A should collide with B when B is above", function() {
			circleB = new Collision.Circle({x: 0, y: -10}, 5);
			expect(circleA.vs_circle(circleB)).toEqual(getResponse(0, -5, 0, 1));
		});

		it("A should collide with B when B is below", function() {
			circleB = new Collision.Circle({x: 0, y: 10}, 5);
			expect(circleA.vs_circle(circleB)).toEqual(getResponse(0, 5, 0, -1));
		});
		 
		it("A should collide with B when B is directly on top", function() {
			circleB = new Collision.Circle({x: 0, y: 0}, 4);
			expect(circleA.vs_circle(circleB)).toEqual(getResponse(0, 0, 0, 0));
		});
	});
	
	describe("Collision.Detector", function() {

		describe("test()", function() {

			var detector;
			beforeEach(function() {
				var object1 = createObject('object1', 4, 0, 4, 0, 3, 3);
				var object2 = createObject('object2', 6, 0, -4, 0, 3, 3);
				var object3 = createObject('object3', 20, 20, 0, 0, 3, 3);
				detector = getCollisionDetector(object1, object2, object3);
				detector.reset();
			});

			it('should have found 2 colliding objects', function() {
				detector.test();
				expect(detector.num_collisions()).toEqual(2);
			});
			
		});
	});

	
/* 
	 afterEach(function(){
	 delete object1;
	 delete object2;
	 delete object3;
	 });

	 

	 it('should have no collision after a reset()', function() {
	 detector.test();
	 detector.reset();
	 expect(detector.num_collisions()).toEqual(0);
	 });

	 it('should have detected that object1 collided with object2', function() {
	 detector.test();
	 expect(detector.who_collided_with('object1')).toEqual([{with : 'object2', result: {x: 6, y: 0}}]);
	 });

	 it('should have detected that object2 collided with object1', function() {
	 detector.test();
	 expect(detector.who_collided_with('object2')).toEqual([{with : 'object1', result: {x: 4, y:0}}]);
	 });

	 it('should have no collisions object3', function() {
	 detector.test();
	 expect(detector.who_collided_with('object3')).toEqual({});
	 });

	 it("should only have collision for moving with stationary object", function() {
	 var moving = createObject('moving', 4, 0, 0, 0, 3, 3);
	 var stationary = createObject('stationary', 8, 0, 8, 0, 3, 3);
	 var detector = getCollisionDetector(moving, stationary);
	 detector.test();
	 expect(detector.get_collisions()).toEqual({
	 moving : [ { with : 'stationary', result : [ -2, 0 ] } ],
	 stationary : [ { with : 'moving', result : [ 2, 0 ] } ]
	 });
	 });
	 });

	 describe("resolve()", function() {

	 var detector;
	 var object1;
	 var object2;
	 var object3;

	 beforeEach(function() {
	 object1 = createObject('object1', 4, 0, 4, 0, 3, 3);
	 object2 = createObject('object2', 6, 0, -4, 0, 3, 3);
	 object3 = createObject('object3', 20, 20, 20, 20, 3, 3);
	 detector = getCollisionDetector(object1, object2, object3);
	 detector.test();
	 });

	 it('should have moved object1 back', function() {
	 detector.resolve();
	 expect(object1.position).toEqual({x: 2, y: 0});
	 });

	 it('should have moved object2 back', function() {
	 detector.resolve();
	 expect(object2.position).toEqual({x: 8, y: 0});
	 });

	 it('shouldn\'t have moved object3', function() {
	 detector.resolve();
	 expect(object3.position).toEqual({x: 20, y: 20});
	 });

	 it('should have 2 collision before resolve and 0 after', function() {
	 expect(detector.num_collisions()).toEqual(2);
	 detector.resolve();
	 expect(detector.num_collisions()).toEqual(0);
	 });

	 it('contact resolution with one stationary', function() {
	 var object1 = createObject('object1', 4, 0, 4, 0, 3, 3);
	 var object2 = createObject('object2', 8, 0, 0, 0, 3, 3);
	 var detector = getCollisionDetector(object1, object2);
	 detector.test();
	 expect(detector.get_collisions()).toEqual({
	 object1 : [ { with : 'object2', result : [ -2, 0 ] } ],
	 object2 : [ { with : 'object1', result : [ 2, 0 ] } ]
	 });
	 detector.resolve();
	 expect(object1.position).toEqual({x:2,y:0});
	 expect(object2.position).toEqual({x:8,y:0});
	 });
	 });
	 });
	*/


});