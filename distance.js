/** 
 * The following JavaScript code from http://www.movable-type.co.uk/scripts/latlong.html
 * calculates the haversine formula for the distance in meters between two lat/long coords
 */ 
export function distanceInMeters(coord1, coord2) {
  const lat1 = coord1.latitude;
  const lon1 = coord1.longitude;
  const lat2 = coord2.latitude;
  const lon2 = coord2.longitude;

  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // in metres
  return d; 
}

/** 
 * return the sum the numbers in a list of numbers
 */ 
export function sum (nums) {
  return nums.reduce( (total, num) => total + num, 0 );
}

/** 
 * Lyn's function for calculating the path length (in meters) of a list of coords, 
 * which sums the distance of the segments formed by consecutive coords. 
 */ 
export function pathDistanceInMeters(coordList) {
  const consecutiveCoordPairs = 
    coordList.slice(0, coordList.length-1)
      .map ( (coord, index) => [coord, coordList[index+1]] );
  const segmentDistances = consecutiveCoordPairs.
       map( ([coord1, coord2]) => distanceInMeters(coord1, coord2));
  return sum(segmentDistances);
}
      
