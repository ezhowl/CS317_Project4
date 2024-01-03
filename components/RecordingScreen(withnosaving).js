import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, TextInput, Alert, Modal } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { distanceInMeters } from '../distance';

const RecordingScreen = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [path, setPath] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [spots, setSpots] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [spotTitle, setSpotTitle] = useState('');
  const [spotInfo, setSpotInfo] = useState('');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
    })();
  }, []);

  const startRecording = async () => {
    setIsRecording(true);
    setPath([]);
    setSpots([]);
    const location = await Location.getCurrentPositionAsync({});
    setCurrentLocation(location.coords);
    setPath([location.coords]);
  };

  const stopRecording = () => {
    setIsRecording(false);
    onRecordingComplete({ path, spots });
  };

  const addSpot = () => {
    setModalVisible(true);
  };

  const saveSpot = () => {
    const newSpot = {
      title: spotTitle,
      info: spotInfo,
      time: new Date().toISOString(),
      coord: currentLocation,
    };
    setSpots([...spots, newSpot]);
    setSpotTitle('');
    setSpotInfo('');
    setModalVisible(false);
  };

  useEffect(() => {
    if (isRecording) {
      const subscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 10,
        },
        (location) => {
          setCurrentLocation(location.coords);
          setPath((prevPath) => [...prevPath, location.coords]);
        }
      );
      return () => subscription.then((sub) => sub.remove());
    }
  }, [isRecording]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} showsUserLocation={true}>
        {currentLocation && <Marker coordinate={currentLocation} title="Me" />}
        {path.length > 0 && (
          <Polyline coordinates={path} strokeWidth={3} strokeColor="blue" />
        )}
        {spots.map((spot, index) => (
          <Marker
            key={index}
            coordinate={spot.coord}
            title={spot.title}
            description={`${new Date(spot.time).toLocaleString()}: ${spot.info}`}
          />
        ))}
      </MapView>

      <Button
        title="Start Recording"
        onPress={startRecording}
        disabled={isRecording}
      />
      <Button
        title="Stop Recording"
        onPress={stopRecording}
        disabled={!isRecording}
      />
      <Button title="Add Spot" onPress={addSpot} disabled={!isRecording} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <TextInput
            placeholder="Spot Title"
            value={spotTitle}
            onChangeText={setSpotTitle}
            style={styles.textInput}
          />
          <TextInput
            placeholder="Additional Info"
            value={spotInfo}
            onChangeText={setSpotInfo}
            style={styles.textInput}
            multiline
          />
          <Button title="Save Spot" onPress={saveSpot} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  textInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
});

export default RecordingScreen;




// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { Button, TextInput, Text } from 'react-native-paper';
// import MapView, { Polyline, Marker } from 'react-native-maps';
// import * as Location from 'expo-location';
// import { distanceInMeters } from '../distance';
// import { storePath } from '../PathStore'; // Import PathStore for storing paths



// const RecordingScreen = ({ isRecording, setIsRecording, currentLocation, handleLocationUpdate }) => {
//     // State variables
//     const [path, setPath] = useState([]);
//     const [spots, setSpots] = useState([]);
//     const [spotName, setSpotName] = useState('');
//     const [spotInfo, setSpotInfo] = useState('');
//     const [showUserLocation, setShowUserLocation] = useState(true);
  
//   // Function to start recording
//   const startRecording = () => {
//     setIsRecording(true);
//     // Start tracking device location here (using Location.watchPositionAsync)
//   };

//   // Function to stop recording
//   const stopRecording = () => {
//     setIsRecording(false);
//     // Stop tracking device location here
//   };

//   // Function to add a spot
//   const addSpot = () => {
//     if (currentLocation) {
//       const newSpot = {
//         coord: currentLocation,
//         name: spotName,
//         info: spotInfo,
//         time: new Date().toISOString(),
//       };
//       setSpots([...spots, newSpot]);
//       setSpotName('');
//       setSpotInfo('');
//     }
//   };

//   // Function to save the recorded path
//   const savePath = () => {
//     if (path.length > 0) {
//       // Create an annotated path object
//       const annotatedPath = {
//         coords: path,
//         spots: spots,
//         startTime: path[0].time,
//         stopTime: path[path.length - 1].time,
//         name: 'Your Path Name', // Prompt the user for a name
//         distance: calculatePathDistance(path),
//       };
//       // Store the path using PathStore
//       storePath(annotatedPath); // Use PathStore to store the path
//       // Update the recordedPath state in App.js
//       handleLocationUpdate(annotatedPath);
//     }
//   };


//   // Function to calculate path distance
//   const calculatePathDistance = (coords) => {
//     let totalDistance = 0;
//     for (let i = 1; i < coords.length; i++) {
//       const prevCoord = coords[i - 1];
//       const currentCoord = coords[i];
//       // Calculate distance between prevCoord and currentCoord (you can use a library for this)
//       const distance = calculateDistance(prevCoord, currentCoord);
//       totalDistance += distance;
//     }
//     return totalDistance;
//   };

//   // Function to calculate distance between two coordinates
//   function calculateDistance(coord1, coord2) {
//     // Use the distanceInMeters function from distance.js
//     return distanceInMeters(coord1, coord2);
//   }


//   // useEffect to update currentLocation when tracking is active
//   // useEffect to update currentLocation when tracking is active
// useEffect(() => {
//     let isMounted = true;
  
//     const startLocationTracking = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         console.error('Permission to access location was denied');
//         return;
//       }
  
//       const locationOptions = {
//         accuracy: Location.Accuracy.Highest,
//         timeInterval: 1000, // Update location every 1 second (adjust as needed)
//       };
  
//       const locationSubscriber = await Location.watchPositionAsync(
//         locationOptions,
//         (location) => {
//           if (isMounted) {
//             // Instead of setCurrentLocation, call handleLocationUpdate to update currentLocation in the parent component
//             handleLocationUpdate({
//               latitude: location.coords.latitude,
//               longitude: location.coords.longitude,
//             });
//           }
//         }
//       );
  
//       // Clean up the location subscriber when component unmounts or tracking is stopped
//       return () => {
//         if (locationSubscriber) {
//           locationSubscriber.remove();
//         }
//       };
//     };
  
//     if (isRecording) {
//       startLocationTracking();
//     }
  
//     return () => {
//       isMounted = false;
//     };
//   }, [isRecording]);
  

//   return (
//     <View style={styles.container}>
//       <MapView style={styles.map} showsUserLocation={showUserLocation}>
//         {/* Display the path as a Polyline */}
//         {path.length > 0 && <Polyline coordinates={path} strokeColor="#000" strokeWidth={3} />}
//         {/* Display current location as a Marker */}
//         {currentLocation && <Marker coordinate={currentLocation} title="Me" />}
//         {/* Display spot Markers */}
//         {spots.map((spot, index) => (
//           <Marker
//             key={index}
//             coordinate={spot.coord}
//             title={spot.name}
//             description={`${spot.info}\n${new Date(spot.time).toLocaleString()}`}
//           />
//         ))}
//         {/* Display start and finish Markers */}
//         {path.length > 0 && (
//           <Marker
//             coordinate={path[0]}
//             title="Start"
//             description={`Started: ${new Date(path[0].time).toLocaleString()}`}
//           />
//         )}
//         {path.length > 1 && (
//           <Marker
//             coordinate={path[path.length - 1]}
//             title="Finish"
//             description={`Stopped: ${new Date(path[path.length - 1].time).toLocaleString()}\nDistance: ${calculatePathDistance(path)} meters`}
//           />
//         )}
//       </MapView>
//       {isRecording ? (
//         <Button style={styles.button} mode="contained" onPress={stopRecording}>
//           Stop Recording
//         </Button>
//       ) : (
//         <Button style={styles.button} mode="contained" onPress={startRecording}>
//           Start Recording
//         </Button>
//       )}
//       <TextInput
//         label="Spot Name"
//         value={spotName}
//         onChangeText={(text) => setSpotName(text)}
//         style={styles.input}
//       />
//       <TextInput
//         label="Spot Info"
//         value={spotInfo}
//         onChangeText={(text) => setSpotInfo(text)}
//         multiline
//         numberOfLines={4}
//         style={styles.input}
//       />
//       <Button style={styles.button} mode="contained" onPress={addSpot}>
//         Add Spot
//       </Button>
//       <Button style={styles.button} mode="contained" onPress={savePath}>
//         Save Path
//       </Button>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   button: {
//     margin: 10,
//   },
//   input: {
//     margin: 10,
//   },
// });

// export default RecordingScreen;
