import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

const Contacts = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const contactData = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Contacts</Text>

        <TouchableOpacity onPress={() => navigation.navigate('New Contact')}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {contactData ? (
          <View style={styles.contactItem}>
            <Image
              source={{ uri: contactData.profilePic || 'https://placehold.co/100x100' }}
              style={styles.profilePic}
            />
            <View style={styles.contactDetails}>
              <Text style={styles.contactName}>{contactData.name}</Text>
              <Text style={styles.contactEmail}>{contactData.email}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.placeholderText}>No contacts available.</Text>
        )}
      </View>
    </View>
  );
};

export default Contacts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#075E54',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contactDetails: {
    flexDirection: 'column',
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  contactEmail: {
    fontSize: 16,
    color: '#666',
  },
});
