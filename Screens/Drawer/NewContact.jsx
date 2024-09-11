import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const NewContact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const saveContact = async () => {
    if (name === '' || email === '') {
      Alert.alert('Error', 'Please enter both name and email');
      return;
    }

    const contactSnapshot = await firestore()
      .collection('contacts')
      .where('email', '==', email)
      .get();

    if (!contactSnapshot.empty) {
      const contactData = contactSnapshot.docs[0].data();
      navigation.navigate('Contacts', {
        name: contactData.name,
        email: contactData.email,
        profilePic: contactData.profilePic,
      });
    } else {
      await firestore()
        .collection('contacts')
        .add({ name, email, profilePic: '' });
      Alert.alert('Success', 'Contact saved!');
      navigation.navigate('Contacts');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter name"
        placeholderTextColor={"black"}
        value={name}
        onChangeText={(text) => setName(text)}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        placeholderTextColor={"black"}
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveContact}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NewContact;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    color:'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    color:'black',
  },
  saveButton: {
    backgroundColor: '#075E54',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
