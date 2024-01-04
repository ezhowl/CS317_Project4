import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, TextInput, Alert, Modal } from 'react-native';
import * as Location from 'expo-location';
import { pathDistanceInMeters } from '../distance';
import * as PathStore from '../PathStore';
import PathView from './PathView';

/**
 * RecordingScreen component is responsible for handling path recording
 * It allows users to start/stop recording, add spots, and save/delete the recorded path.
 * @param {function} onRecordingComplete - Callback function to handle the completion of recording.
 * @param {Array} existingPathNames - Array of existing path names to avoid name conflicts.
 */
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

  // Requesting location permissions
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
    })();
  }, []);

  // Function to start recording a new path
  const startRecording = async () => {
    setIsRecording(true);
    setPath([]);
    setSpots([]);
    const location = await Location.getCurrentPositionAsync({});
    setCurrentLocation(location.coords);
    setPath([location.coords]);
    setStartTime(new Date().toISOString());
  };

  // Function to add a new spot
  const addSpot = () => {
    setModalVisible(true);
  };

  // Function to save a new spot
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

  // Function to stop recording
  const stopRecording = () => {
    setIsRecording(false);
    const endTime = new Date().toISOString();
    setStopTime(endTime);

    const pathDistance = calculatePathDistance(path); 

    Alert.alert(
      "Recording Complete",
      "Would you like to save or delete this path?",
      [
        {
          text: "Delete",
          onPress: () => clearRecording(),
          style: "cancel"
        },
        { text: "Save", onPress: () => promptForPathName(pathDistance, endTime) }
      ],
      { cancelable: false }
    );
  };

  // Function to prompt user for path name before saving
  const promptForPathName = (pathDistance, endTime) => {
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
          onPress: (name) => handleSavePath(name, pathDistance, endTime),
        },
      ],
      'plain-text'
    );
  };

  // Function to handle path saving
  const handleSavePath = (name, pathDistance, endTime) => {
    if (existingPathNames.includes(name)) {
      Alert.alert("Name Already Exists", "Please choose a different name.", [
        { text: "OK", onPress: () => promptForPathName() }
      ]);
    } else {
      const newPath = createPathObject(name, pathDistance, endTime);
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

  // Function to create a new path object
  const createPathObject = (name, pathDistance, stopTime) => {
    return {
      name,
      startTime,
      stopTime,
      pathDistance,
      spots,
      coords: path
    };
  };

  // Function to calculate the total distance of the path
  const calculatePathDistance = (coords) => {
    const totalDistanceMeters = pathDistanceInMeters(coords);
    return totalDistanceMeters; // Return the distance in meters
  };

  // Function to clear the current recording
  const clearRecording = () => {
    setPath([]);
    setSpots([]);
    setCurrentLocation(null);
    setStartTime(null);
    setStopTime(null);
  };

  // Function to update location in real-time while recording
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
      <PathView
        path={path}
        spots={spots}
        isRecording={isRecording}
        startTime={startTime}
        stopTime={stopTime}
      />
      <Button title="Start Recording" onPress={startRecording} disabled={isRecording} />
      <Button title="Stop Recording" onPress={stopRecording} disabled={!isRecording} />
      <Button title="Add Spot" onPress={addSpot} disabled={!isRecording} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {setModalVisible(!modalVisible);}}
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