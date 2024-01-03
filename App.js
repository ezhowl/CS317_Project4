import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button } from 'react-native'; 
import SummaryScreen from './components/SummaryScreen';
import DisplayScreen from './components/DisplayScreen';
import RecordingScreen from './components/RecordingScreen';
import * as PathStore from './PathStore';
import samplePaths from './samplePaths';


const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Summary');
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  //const [recordedPaths, setRecordedPaths] = useState([]);
  

  useEffect(() => {
    async function addPersistentPaths() {
      const persistentPaths = await PathStore.init();
      console.log(`In useEffect, have ${persistentPaths.length} saved paths`);
      combineWithSamplePaths(persistentPaths);
    }
    addPersistentPaths();
  }, []);
  
  // Function to handle path selection
  const handlePathSelect = (path) => {
    setSelectedPath(path);
    setCurrentScreen('Display');
  };

  const handleRecordingComplete = (newPath) => {
    PathStore.storePath(newPath);
    setPaths([...paths, newPath]);
    setCurrentScreen('Summary');
  };

  // Define a function to combine persistent paths with sample paths
  function combineWithSamplePaths(persistentPaths) {
    // Combine the persistent paths with the sample paths
    const combinedPaths = [...samplePaths, ...persistentPaths];
    setPaths(combinedPaths);
  }

  const existingPathNames = paths.map(path => path.name);

  // const handleLocationUpdate = (annotatedPath) => {
  //   // Save the annotated path using PathStore
  //   PathStore.savePath(annotatedPath);
  
  //   // Update the recordedPaths state with the saved path
  //   setRecordedPaths([...recordedPaths, annotatedPath]);
  // };
  

  

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



//   return (
//     <View style={styles.container}>
//       {currentScreen === 'Recording' ? (
//         <RecordingScreen
//           isRecording={isRecording}
//           setIsRecording={setIsRecording}
//           currentLocation={currentLocation}
//           handleLocationUpdate={handleLocationUpdate}
//         />
//       ) : (
//         renderScreen()
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
    
//   },
// });

// export default App;
