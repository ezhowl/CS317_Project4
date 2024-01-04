import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';

/**
 * PathView component is used for rendering a map view with a polyline path and markers.
 * It displays the path, start and finish markers, and additional spots.
 * @param {Array} path - Array of coordinates for the path.
 * @param {Array} spots - Array of spot objects to be marked on the map.
 * @param {string} startTime - Start time of the path recording.
 * @param {string} stopTime - Stop time of the path recording.
 */
const PathView = ({ path, spots, startTime, stopTime }) => {
  // Function to calculate the initial region based on path coordinates
  const calculateInitialRegion = (coords) => {
    if (!coords || coords.length === 0) return null;

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
  };

// Define markers for start, stop, and spots
const renderMarkers = () => {
    const markers = [];

    // Start Marker
    if (startTime && path.length > 0) {
        markers.push(
            <Marker
            key="start"
            coordinate={path[0]}
            title="Start"
            description={`Started: ${new Date(startTime).toLocaleString()}`}
            pinColor="red"
            />
        );
    }
  
    // Stop Marker
    if (stopTime && path && path.length > 0) {
        markers.push(
            <Marker
            key="stop"
            coordinate={path[path.length - 1]}
            title="Finish"
            description={`Stopped: ${new Date(stopTime).toLocaleString()}`}
            pinColor="red"
            />
        );
    }
  
    // Spot Markers
    spots.forEach((spot, index) => {
        markers.push(
          <Marker
            key={`spot-${index}`}
            coordinate={spot.coord}
            title={spot.title}
            description={`${new Date(spot.time).toLocaleString()}: ${spot.info}`}
            pinColor="green"
          />
        );
    });
  
    return markers;
};

    const initialRegion = calculateInitialRegion(path);

    return (
        <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        >
        {path.length > 0 && (
            <Polyline coordinates={path} strokeWidth={3} strokeColor="blue" />
        )}
        {renderMarkers()}
        </MapView>
    );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default PathView;
