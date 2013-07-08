define(['collision', 'gameobject'], function(collision, GameObject) {

  return describe("Collision", function() {
    var circle;

    beforeEach(function() {
      circleA = new collision.Circle(5);
      circleB = new collision.Circle(3);
    });

    it("get_radius should return correct values", function() {
      expect(circleA.get_radius()).toEqual(5);
      expect(circleB.get_radius()).toEqual(3);
    });

    it("A should not collide with B", function(){
      circleA.set_object(new GameObject({
        position: {x: 0, y: 0}
      }));
      circleB.set_object(new GameObject({
        position: {x: 8, y: 0}
      }));
      expect(circleA.vs_circle(circleB)).toEqual(false);
    });

    it("A should collide with B with [-1,0]", function(){
      circleA.set_object(new GameObject({position: {x: 0, y: 0}}));
      circleB.set_object(new GameObject({position: {x: 7, y: 0}}));
      expect(circleA.vs_circle(circleB)).toEqual([-1,0]);
    });

    it("A should collide with B with [1,0]", function(){
      circleA.set_object(new GameObject({position: {x: 7, y: 0}}));
      circleB.set_object(new GameObject({position: {x: 0, y: 0}}));
      expect(circleA.vs_circle(circleB)).toEqual([1,0]);
    });

    it("A should collide with B with [0,-1]", function(){
      circleA.set_object(new GameObject({position: {x: 0, y: 0}}));
      circleB.set_object(new GameObject({position: {x: 0, y: 7}}));
      expect(circleA.vs_circle(circleB)).toEqual([0,-1]);
    });

    it("A should collide with B with [0,1]", function(){
      circleA.set_object(new GameObject({position: {x: 0, y: 7}}));
      circleB.set_object(new GameObject({position: {x: 0, y: 0}}));
      expect(circleA.vs_circle(circleB)).toEqual([0,1]);
    });
  });
});