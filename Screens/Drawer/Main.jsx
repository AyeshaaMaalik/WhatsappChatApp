import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const CHAT_DATA = [
  { id: '1', name: 'John Doe', lastMessage: 'Hey, how are you?' },
  { id: '2', name: 'Jane Smith', lastMessage: 'Can we meet tomorrow?' },
  { id: '3', name: 'Bob Johnson', lastMessage: 'Reminder about the meeting' },
];

const Main = () => {
  const renderChatItem = ({ item }) => (
    <View style={styles.chatItem}>
      <Text style={styles.chatName}>{item.name}</Text>
      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={CHAT_DATA}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatsList}
      />

      <TouchableOpacity style={styles.fab}>
        <Feather name="message-circle" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatsList: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  chatItem: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#25D366',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default Main;
