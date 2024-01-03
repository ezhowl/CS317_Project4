import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as PathStore from '../PathStore';
import samplePaths from '../samplePaths';

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

  const sortPaths = (pathsArray, sortBy) => {
    return pathsArray.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'startTime') {
        return new Date(a.startTime) - new Date(b.startTime);
      } else if (sortBy === 'pathDistance') {
        return a.pathDistance - b.pathDistance;
      }
    });
  };

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

  const deletePath = async (pathObj) => {
    await PathStore.deletePath(pathObj);
    setPaths(paths.filter(p => p.startTime !== pathObj.startTime));
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