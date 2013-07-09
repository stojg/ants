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