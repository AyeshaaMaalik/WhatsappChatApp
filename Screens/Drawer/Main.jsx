import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const Main = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name, email, profilePic } = route.params || {};

  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (name && email) {
      const newContact = {
        name,
        email,
        profilePic: profilePic || 'https://placehold.co/100x100',
      };
      setContacts(prevContacts => [...prevContacts, newContact]);
    }
  }, [route.params]);

  const handleContactPress = (contact) => {
    navigation.navigate('Message', {
      contactName: contact.name,
      contactEmail: contact.email,
      contactProfilePic: contact.profilePic,
    });
  };

  return (
    <View style={styles.container}>
      {contacts.length > 0 ? (
        contacts.map((contact, index) => (
          <TouchableOpacity key={index} onPress={() => handleContactPress(contact)}>
            <View style={styles.contactItem}>
              <Image
                source={{ uri: contact.profilePic }}
                style={styles.profilePic}
              />
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactEmail}>{contact.email}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.placeholderText}>No contacts available</Text>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('New Contact')}>
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

export default Main;
