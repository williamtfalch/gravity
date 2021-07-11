import Utils from './Utils.js'

const Geometry2D = {
  degrees2radians: function(d) {return d * Math.PI/180},
  
  getCircleIntersectionPoints: function(x0, y0, r0, x1, y1, r1) {
    let a, dx, dy, d, h, rx, ry;
    let x2, y2;

    /* dx and dy are the vertical and horizontal distances between
      * the circle centers.
      */
    dx = x1 - x0;
    dy = y1 - y0;

    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt((dy*dy) + (dx*dx));

    /* Check for solvability. */
    if (d > (r0 + r1)) {
        /* no solution. circles do not intersect. */
        return [];
    }
    if (d < Math.abs(r0 - r1)) {
        /* no solution. one circle is contained in the other */
        return [];
    }

    /* 'point 2' is the point where the line through the circle
      * intersection points crosses the line between the circle
      * centers.  
      */

    /* Determine the distance from point 0 to point 2. */
    a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

    /* Determine the coordinates of point 2. */
    x2 = x0 + (dx * a/d);
    y2 = y0 + (dy * a/d);

    /* Determine the distance from point 2 to either of the
      * intersection points.
      */
    h = Math.sqrt((r0*r0) - (a*a));

    /* Now determine the offsets of the intersection points from
      * point 2.
      */
    rx = -dy * (h/d);
    ry = dx * (h/d);

    /* Determine the absolute intersection points. */
    var xi = x2 + rx;
    var xi_prime = x2 - rx;
    var yi = y2 + ry;
    var yi_prime = y2 - ry;

    const intersectionPoints = [
      {
        x: xi,
        y: yi
      },
      {
        x: xi_prime,
        y: yi_prime
      }
    ]

    return intersectionPoints
  },

  doCirlcesOverlap: function(p1, p2, r1, r2) {
    const dist = this.getDistance(p1, p2)

    return  dist <= (r1 + r2)
  },

  doCirclesIntersect: function(p1, p2, r1, r2) {
    const dist = this.getDistance(p1, p2)

    return  ((dist <= (r1 + r2)) && (dist >= Math.abs(r2-r1)))
  },

  point2radians: function(point, relativeTo) {
    const relativeX = point.x - relativeTo.x
    let relativeY = (point.y - relativeTo.y) * (-1) // since we are doing the calcs on the unit circle we have to invert y axis

    let angle = Math.atan2(relativeY, relativeX)
    if (angle < 0) angle = (2 * Math.PI) + angle

    return angle
  },

  radians2point: function(radians, relativeTo) {
    const quadrant = Math.floor(((radians%(2*Math.PI))/(Math.PI/2))) + 1
    const point = {}

    if (quadrant === 3) radians = radians%Math.PI
    if (quadrant === 2 || quadrant === 4) radians = (Math.PI/2) - radians%(Math.PI/2)

    let signX = (quadrant === 1 || quadrant === 4) ? 1 : -1
    let x = relativeTo.radius * Math.cos(radians)
    x = x * signX

    let signY = (quadrant === 1 || quadrant === 2) ? -1 : 1
    let y = relativeTo.radius * Math.sin(radians)
    y = y * signY

    point.x = relativeTo.position.x + x
    point.y = relativeTo.position.y + y

    return point
  },
  
  radians2degrees: function(radians) {
    return (radians * 360) / (2 * Math.PI)
  },

  getDistance: function(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y)
  },

  getAreaOfOverlappingCircles(r, R, d) {
    const p1 = Math.pow(r,2) * Math.acos((Math.pow(d,2) + Math.pow(r,2) - Math.pow(R,2))/(2 * d * r))
    const p2 = Math.pow(R,2) * Math.acos((Math.pow(d,2) + Math.pow(R,2) - Math.pow(r,2))/(2 * d * R))
    const p3 = 0.5 * Math.sqrt((-d + r + R) * (d + r - R) * (d - r + R) * (d + r + R))

    return p1 + p2 - p3
  },

  getCircleArea: function(r) {
    return Math.PI * Math.pow(r,2)
  },

  radians2quadrant(radians) {
    return 1 + (Math.floor((radians%(2*Math.PI))/(Math.PI/2)))
  },

  isCircleWithinBounds: function(circle, width, height) {
    if (
      (circle.position.x + circle.radius > width)
      ||
      (circle.position.x - circle.radius < 0)
      ||
      (circle.position.y + circle.radius > height)
      ||
      (circle.position.y - circle.radius < 0)
    ) {
      return false
    }

    return true
  }
}

export default Geometry2D