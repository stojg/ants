define(['collision', 'gameobject'], function(Collision, GameObject) {


  describe("Collision.Detector", function() {

    var detector;

    var object1 = {
      position: {x: 4, y:0},
      positionPrevious: {x:0, y:0},
      name: 'object1',
      get_collision:function() {
        var t = new Collision.Circle(3);
        t.set_object(this);
        return t;
      }
    };
    var object2 = {
      position: {x: 6, y:0},
      positionPrevious: {x:10, y:0},
      name: 'object2',
      get_collision:function() {
        var t = new Collision.Circle(3);
        t.set_object(this);
        return t;
      }   
    };

    var object3 = {
      position: {x: 20, y:20},
      positionPrevious: {x:20, y:20},
      name: 'object3',
      get_collision:function() {
        var t = new Collision.Circle(3);
        t.set_object(this);
        return t;
      }
    };

    beforeEach(function() {
      detector = new Collision.Detector({
        object1: object1,
        object2: object2,
        object3: object3
      });
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
      expect(detector.who_collided_with(object1)).toEqual([{with: 'object2', result: [-4,0]}]);
      expect(detector.who_collided_with(object2)).toEqual([{with: 'object1', result: [4,0]}]);
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
      var object1 = {position: {x: 4, y:0},positionPrevious: {x:0, y:0},name: 'object1', get_collision:function() {var t = new Collision.Circle(3);t.set_object(this);return t;}};
      var object2 = {position: {x: 8, y:0},positionPrevious: {x:8, y:0},name: 'object2',get_collision:function() {var t = new Collision.Circle(3);t.set_object(this);return t;}};
      var detector = new Collision.Detector({object1: object1, object2: object2});
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

    it("A should not collide with B", function(){
      circleA.set_object(new GameObject({position: {x: 0, y: 0}}));
      circleB.set_object(new GameObject({position: {x: 8, y: 0}}));
      expect(circleA.vs_circle(circleB)).toEqual(false);
    });

    it("A should collide with B when B is at the right", function(){
      circleA.set_object(new GameObject({position: {x: 0, y: 0}}));
      circleB.set_object(new GameObject({position: {x: 7, y: 0}}));
      expect(circleA.vs_circle(circleB)).toEqual([-1,0]);
    });

    it("A should collide with B when B is at the left", function(){
      circleA.set_object(new GameObject({position: {x: 7, y: 0}}));
      circleB.set_object(new GameObject({position: {x: 0, y: 0}}));
      expect(circleA.vs_circle(circleB)).toEqual([1,0]);
    });

    it("A should collide with B when B is above", function(){
      circleA.set_object(new GameObject({position: {x: 0, y: 0}}));
      circleB.set_object(new GameObject({position: {x: 0, y: 7}}));
      expect(circleA.vs_circle(circleB)).toEqual([0,-1]);
    });

    it("A should collide with B when B is below", function(){
      circleA.set_object(new GameObject({position: {x: 0, y: 7}}));
      circleB.set_object(new GameObject({position: {x: 0, y: 0}}));
      expect(circleA.vs_circle(circleB)).toEqual([0,1]);
    });

    it("A should collide with B when B is directly on top", function(){
      circleA.set_object(new GameObject({position: {x: 0, y: 7}}));
      circleB.set_object(new GameObject({position: {x: 0, y: 7}}));
      expect(circleA.vs_circle(circleB)).toEqual([0,0]);
    });
  });
});