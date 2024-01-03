import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PathView from './PathView';

const DisplayScreen = ({ path }) => {
  if (!path) {
    return <Text style={styles.noPathText}>No path selected</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{path.name}</Text>
      <PathView
        path={path.coords}
        spots={path.spots}
        startTime={path.startTime}
        stopTime={path.stopTime}
      />
      <Text style={styles.distanceText}>Total Distance: {(path.pathDistance / 1000).toFixed(2)} km</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noPathText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    paddingTop: 50,
  },
  distanceText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
  },
});

export default DisplayScreen;
