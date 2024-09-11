import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import database from '@react-native-firebase/database';
import { useNavigation } from '@react-navigation/native';

const ContactScreen = () => {
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const fetchProfile = async () => {
    if (email.trim() === '') {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsLoading(true);

    try {
      const snapshot = await database().ref('profiles').orderByChild('email').equalTo(email).once('value');

      if (snapshot.exists()) {
        const profileData = snapshot.val();
        const profileKey = Object.keys(profileData)[0]; // Get the first profile key
        const profileInfo = profileData[profileKey];

        setProfile(profileInfo);
      } else {
        Alert.alert('Not Found', 'No profile found for this email address');
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile: ', error);
      Alert.alert('Error', 'Failed to fetch profile. Please try again.');
    }

    setIsLoading(false);
  };

  const handleAddContact = () => {
    if (profile) {
      navigation.navigate('Contacts', {
        name: profile.name,
        email: email,
        profilePic: profile.profilePicUrl,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Contact</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter email address"
        value={email}
        placeholderTextColor="#999"
        onChangeText={(text) => setEmail(text)}
      />

      <TouchableOpacity style={styles.button} onPress={fetchProfile}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator size="large" color="#25D366" />
      ) : (
        profile && (
          <View style={styles.profileContainer}>
            <Image source={{ uri: profile.profilePicUrl }} style={styles.image} />
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
              <Text style={styles.addButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#EDEDED',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 30,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    color: '#333',
  },
  button: {
    backgroundColor: '#25D366',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 16,
    color: '#555',
  },
  addButton: {
    backgroundColor: '#075E54',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContactScreen;
