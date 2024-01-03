import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, TextInput, Alert, Modal } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { pathDistanceInMeters } from '../distance';
import * as PathStore from '../PathStore';

//currentLocation is blue, spots is green, 

const RecordingScreen = ({ onRecordingComplete, existingPathNames }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [path, setPath] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [spots, setSpots] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [spotTitle, setSpotTitle] = useState('');
  const [spotInfo, setSpotInfo] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [stopTime, setStopTime] = useState(null);

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
    setStartTime(new Date().toISOString());
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

  const stopRecording = () => {
    setIsRecording(false);

    Alert.alert(
      "Recording Complete",
      "Would you like to save or delete this path?",
      [
        {
          text: "Delete",
          onPress: () => clearRecording(),
          style: "cancel"
        },
        { text: "Save", onPress: () => promptForPathName() }
      ],
      { cancelable: false }
    );
    setStopTime(new Date().toISOString());
  };

  const promptForPathName = () => {
    Alert.prompt(
      "Save Path",
      "Enter a name for your path:",
      [
        {
          text: "Cancel",
          onPress: () => clearRecording(),
          style: "cancel"
        },
        {
          text: "Save",
          onPress: (name) => handleSavePath(name),
        },
      ],
      'plain-text'
    );
  };

  const handleSavePath = (name) => {
    if (existingPathNames.includes(name)) {
      Alert.alert("Name Already Exists", "Please choose a different name.", [
        { text: "OK", onPress: () => promptForPathName() }
      ]);
    } else {
      const newPath = createPathObject(name);
        PathStore.storePath(newPath) // Save the path to persistent storage
            .then(() => {
                onRecordingComplete(newPath); // Update the state in the parent component
                clearRecording(); // Clear the current recording data
            })
            .catch((error) => {
                console.error("Error saving path:", error);
                Alert.alert("Error", "Failed to save path.");
            });
    }
  };

  const createPathObject = (name) => {
    const startTime = new Date().toISOString(); // Assuming recording starts now; adjust as needed
    const stopTime = new Date().toISOString(); // Adjust to actual stop time

    // Calculate path distance (assuming you have a method to do this)
    const pathDistance = calculatePathDistance(path); // Replace with your actual calculation method

    const pathObject = {
        name: name,
        startTime: startTime,
        stopTime: stopTime,
        pathDistance: pathDistance,
        spots: spots,
        coords: path
    };

    return pathObject;
  };

  //paramters is array of coordinates forming the path, returns number - Total distance of the path in meters.

  const calculatePathDistance = (coords) => {
    // Calculate the distance using the pathDistanceInMeters function
    const totalDistanceMeters = pathDistanceInMeters(coords);
    return totalDistanceMeters; // Return the distance in meters
  };

  const clearRecording = () => {
    // Clear the recording-related state
    setPath([]);
    setSpots([]);
    setCurrentLocation(null);
    // Any additional cleanup
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
        {currentLocation && (
          <Marker 
            coordinate={currentLocation} 
            title="Me" 
            pinColor="blue"
        />)}
        {path.length > 0 && (
          <Polyline coordinates={path} strokeWidth={3} strokeColor="blue" />
        )}
        {path.length > 0 && (
          <Marker
            coordinate={path[0]}
            title="Start"
            description={`Started: ${new Date(startTime).toLocaleString()}`}
            pinColor="red"
          />
        )}
        {stopTime && path.length > 0 && (
          <Marker
            coordinate={path[path.length - 1]}
            title="Finish"
            description={`Stopped: ${new Date(stopTime).toLocaleString()}\nDistance: ${calculatePathDistance(path).toFixed(2)} meters`}
            pinColor="red"
          />
        )}
        {spots.map((spot, index) => (
          <Marker
            key={index}
            coordinate={spot.coord}
            title={spot.title}
            description={`${new Date(spot.time).toLocaleString()}: ${spot.info}`}
            pinColor="green" // Different color for spot markers
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