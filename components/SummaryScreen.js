import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Button } from 'react-native';
import * as PathStore from '../PathStore';
import samplePaths from '../samplePaths';

/**
 * SummaryScreen component for displaying a list of paths with sorting and deletion options.
 * @param {Function} onPathSelect - Callback for selecting a path.
 */
const SummaryScreen = ({ onPathSelect }) => {
  const [paths, setPaths] = useState([]);
  const [sortType, setSortType] = useState('startTime'); // default sort by start time

  useEffect(() => {
    const loadPaths = async () => {
      const persistentPaths = await PathStore.init();
      const combinedPaths = [...samplePaths, ...persistentPaths];
      setPaths(sortPaths(combinedPaths, sortType));
    };

    loadPaths();
  }, [sortType]);

  // Function to sort paths based on user selection
  const sortPaths = (pathsArray, sortBy) => {
    return pathsArray.sort((a, b) => {
      if (sortBy === 'name') {
        // Check if name properties exist and are not undefined
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'startTime') {
        return new Date(a.startTime) - new Date(b.startTime);
      } else if (sortBy === 'pathDistance') {
        return a.pathDistance - b.pathDistance;
      }
    });
  };

  // Function to confirm path deletion
  const confirmDeletion = (pathObj) => {
    Alert.alert(
      "Delete Path",
      `Are you sure you want to delete the path "${pathObj.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deletePath(pathObj) }
      ]
    );
  };
  
  // Function to delete a path
  const deletePath = async (pathObj) => {
    try {
      await PathStore.deletePath(pathObj);
      const updatedPaths = paths.filter(p => p.startTime !== pathObj.startTime);
      setPaths(updatedPaths);
    } catch (error) {
      console.error("Error deleting path:", error);
      Alert.alert("Error", "Failed to delete path.");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onPathSelect(item)}
      onLongPress={() => confirmDeletion(item)}
    >
      <Text style={styles.title}>{item.name}</Text>
      <Text>Started: {new Date(item.startTime).toLocaleString()}</Text>
      <Text>Distance: {item.pathDistance?.toFixed(2) || 'N/A'} km</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sortButtons}>
        <Button title="Sort by Name" onPress={() => setSortType('name')} />
        <Button title="Sort by Date" onPress={() => setSortType('startTime')} />
        <Button title="Sort by Distance" onPress={() => setSortType('pathDistance')} />
      </View>
      <FlatList
        data={paths}
        renderItem={renderItem}
        keyExtractor={item => item.startTime}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingTop: 50,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
  },
});
export default SummaryScreen;
