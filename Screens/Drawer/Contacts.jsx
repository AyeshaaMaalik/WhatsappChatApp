import React, { useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

const Contacts = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { name, email, profilePic } = route.params || {};

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('New Contact')} // Navigate to Add Contact screen
          style={{ marginRight: 15 }}
        >
          <Feather name="plus" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Contact Details</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('New Contact')} // Navigate to Add Contact screen
          style={{ marginRight: 15 }}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {name ? (
        <View style={styles.contactItem}>
          <Image
            source={{ uri: profilePic || 'https://placehold.co/100x100' }}
            style={styles.profilePic}
          />
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{name}</Text>
            <Text style={styles.contactEmail}>{email}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.placeholderText}>No contact details available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#075E54',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
  },
  contactDetails: {
    flexDirection: 'column',
  },
  contactName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#666',
  },
  contactEmail: {
    fontSize: 18,
    color: '#666',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Contacts;
