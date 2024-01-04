import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button } from 'react-native'; 
import SummaryScreen from './components/SummaryScreen';
import DisplayScreen from './components/DisplayScreen';
import RecordingScreen from './components/RecordingScreen';
import * as PathStore from './PathStore';
import samplePaths from './samplePaths';


/**
 * This is the main component of this app. It manages the navigation between the 3 different screens
 * and handles the states related to paths.
 */
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Summary');
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  
  // this initializes paths from persistent storage and combines them with sample paths
  useEffect(() => {
    async function addPersistentPaths() {
      const persistentPaths = await PathStore.init();
      console.log(`In useEffect, have ${persistentPaths.length} saved paths`);
      combineWithSamplePaths(persistentPaths);
    }
    addPersistentPaths();
  }, []);
  
  // Combines persistent paths with sample paths and updates the state
  function combineWithSamplePaths(persistentPaths) {
    const combinedPaths = [...samplePaths, ...persistentPaths];
    setPaths(combinedPaths);
}
  // Navigates to the Display screen with the selected path
  const handlePathSelect = (path) => {
    setSelectedPath(path);
    setCurrentScreen('Display');
  };

  // Handles completion of recording, saving the new path and navigating to Summary screen
  const handleRecordingComplete = (newPath) => {
    PathStore.storePath(newPath);
    setPaths([...paths, newPath]);
    setCurrentScreen('Summary');
  };

  // Logic to switch between pseudoScreens
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Summary':
        return <SummaryScreen onPathSelect={handlePathSelect} paths={paths} />;
      case 'Display':
        return <DisplayScreen path={selectedPath} />;
      case 'Recording':
        return <RecordingScreen onRecordingComplete={handleRecordingComplete} existingPathNames={existingPathNames} />;
      default:
        return <SummaryScreen onPathSelect={handlePathSelect} paths={paths} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <View style={styles.navigation}>
        <Button title="Summary" onPress={() => setCurrentScreen('Summary')} />
        <Button title="Record" onPress={() => setCurrentScreen('Recording')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#eee',
    paddingVertical: 10,
  },
});

export default App;
