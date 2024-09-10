import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const CHAT_DATA = [
  { id: '1', name: 'John Doe', lastMessage: 'Hey, how are you?' },
  { id: '2', name: 'Jane Smith', lastMessage: 'Can we meet tomorrow?' },
  { id: '3', name: 'Bob Johnson', lastMessage: 'Reminder about the meeting' },
];

const ChatsScreen = () => {
  const renderChatItem = ({ item }) => (
    <View style={styles.chatItem}>
      <Text style={styles.chatName}>{item.name}</Text>
      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WhatsApp</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Feather name="search" size={20} color="#fff" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="more-vertical" size={20} color="#fff" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

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
  header: {
    height: 60,
    backgroundColor: '#075E54',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 20,
  },
  chatsList: {
    padding: 10,
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 16,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#25D366',
    borderRadius: 30,
    padding: 15,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatsScreen;
