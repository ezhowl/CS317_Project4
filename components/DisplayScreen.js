

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { pathDistanceInMeters } from '../distance'; // Import the function

const DisplayScreen = ({ path }) => {
  if (!path) {
    return <Text>No path selected</Text>;
  }

  // Calculate the total distance of the path
const totalDistanceMeters = path.coords && path.coords.length > 0 
  ? pathDistanceInMeters(path.coords)
  : 0;
const totalDistanceKm = totalDistanceMeters / 1000;

const { coords, spots, name, startTime, stopTime } = path;
const initialRegion = calculateInitialRegion(coords);

  // Create markers for start, stop, and spots
const startCoord = path.coords && path.coords.length > 0 ? path.coords[0] : null;
const stopCoord = path.coords && path.coords.length > 0 ? path.coords[path.coords.length - 1] : null;
const spotMarkers = path.spots && path.spots.length > 0 ? path.spots.map((spot, index) => (
    <Marker
      key={index}
      coordinate={spot.coord}
      title={spot.title}
      description={`${spot.moreInfo}, Time: ${new Date(spot.time).toLocaleString()}`}
    />
)) : [];


  return (
    <View style={styles.container}>
      <Text style={styles.title}>{path.name}</Text>
      <MapView style={styles.map} initialRegion={initialRegion}>
        <Polyline coordinates={path.coords} strokeWidth={3} strokeColor="blue" />
        <Marker coordinate={startCoord} title="Start" description={`Started: ${new Date(path.startTime).toLocaleString()}`} />
        <Marker coordinate={stopCoord} title="Stop" description={`Stopped: ${new Date(path.stopTime).toLocaleString()}`} />
        {spotMarkers}
      </MapView>
      <Text style={styles.distanceText}>Total Distance: {totalDistanceKm.toFixed(2)} km</Text>
    </View>
  );
};

function calculateInitialRegion(coords) {
    let minLat = coords[0].latitude;
    let maxLat = coords[0].latitude;
    let minLng = coords[0].longitude;
    let maxLng = coords[0].longitude;
    
    coords.forEach(coord => {
        minLat = Math.min(minLat, coord.latitude);
        maxLat = Math.max(maxLat, coord.latitude);
        minLng = Math.min(minLng, coord.longitude);
        maxLng = Math.max(maxLng, coord.longitude);
    });
    
    const latitudeDelta = maxLat - minLat;
    const longitudeDelta = maxLng - minLng;
    
    return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta,
        longitudeDelta
    };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  map: {
    flex: 1,
  },
  distanceText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
  },
});

export default DisplayScreen;



// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import MapView, { Marker, Polyline } from 'react-native-maps';

// const DisplayScreen = ({ path }) => {
//   if (!path) {
//     return (
//       <View style={styles.container}>
//         <Text>No path selected</Text>
//       </View>
//     );
//   }

//   const { coords, spots, name, startTime, stopTime } = path;
//   const initialRegion = calculateInitialRegion(coords);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{name}</Text>
//       <MapView style={styles.map} initialRegion={initialRegion}>
//         <Polyline coordinates={coords} strokeColor="#000" strokeWidth={3} />
//         <Marker
//           coordinate={coords[0]}
//           title="Start"
//           description={`Started: ${new Date(startTime).toLocaleString()}`}
//         />
//         <Marker
//           coordinate={coords[coords.length - 1]}
//           title="Stop"
//           description={`Stopped: ${new Date(stopTime).toLocaleString()}`}
//         />
//         {spots.map((spot, index) => (
//           <Marker
//             key={index}
//             coordinate={spot.coord}
//             title={spot.title}
//             description={`${spot.moreInfo || ''} Time: ${new Date(spot.time).toLocaleString()}`}
//           />
//         ))}
//       </MapView>
//     </View>
//   );
// };

// function calculateInitialRegion(coords) {
//   let minLat = coords[0].latitude;
//   let maxLat = coords[0].latitude;
//   let minLng = coords[0].longitude;
//   let maxLng = coords[0].longitude;

//   coords.forEach(coord => {
//     minLat = Math.min(minLat, coord.latitude);
//     maxLat = Math.max(maxLat, coord.latitude);
//     minLng = Math.min(minLng, coord.longitude);
//     maxLng = Math.max(maxLng, coord.longitude);
//   });

//   const latitudeDelta = maxLat - minLat;
//   const longitudeDelta = maxLng - minLng;

//   return {
//     latitude: (minLat + maxLat) / 2,
//     longitude: (minLng + maxLng) / 2,
//     latitudeDelta,
//     longitudeDelta
//   };
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     padding: 10,
//   },
// });

// export default DisplayScreen;
