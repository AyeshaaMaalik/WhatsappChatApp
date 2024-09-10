import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database'; 

const ShowProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [about, setAbout] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const profileRef = database().ref('profiles').limitToLast(1);
    profileRef.once('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const profile = Object.values(data)[0]; 
        setName(profile.name || 'John Doe');
        setPhoneNumber(profile.phoneNumber || '+1 234 567 890'); 
        setAbout(profile.about || 'Hey there! I am using WhatsApp.');
        setProfileImage(profile.profilePicUrl || null);
      }
    });
  }, []);

  const handleSave = async () => {
    if (profileImage) {
      // Upload the profile image to Firebase Storage
      const uploadUri = profileImage;
      const filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);
      const storageRef = storage().ref(`profile_pics/${filename}`);
      
      try {
        await storageRef.putFile(uploadUri);
        const downloadURL = await storageRef.getDownloadURL();

        // Update the profile in Firebase Realtime Database
        const profileRef = database().ref('profiles').limitToLast(1);
        const snapshot = await profileRef.once('value');
        const data = snapshot.val();
        if (data) {
          const profileId = Object.keys(data)[0];
          await database().ref(`profiles/${profileId}`).update({
            name,
            phoneNumber,
            about,
            profilePicUrl: downloadURL,
          });
        }

        Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
      } catch (error) {
        console.error('Error updating profile: ', error);
        Alert.alert('Update Error', 'There was an error updating your profile.');
      }
    } else {
      // Update the profile without changing the image
      const profileRef = database().ref('profiles').limitToLast(1);
      const snapshot = await profileRef.once('value');
      const data = snapshot.val();
      if (data) {
        const profileId = Object.keys(data)[0];
        await database().ref(`profiles/${profileId}`).update({
          name,
          phoneNumber,
          about,
        });

        Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
      }
    }
    setIsEditing(false);
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const source = response.assets[0].uri;
        setProfileImage(source);
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={profileImage ? { uri: profileImage } : require('../assets/whatsapp.png')}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editImageButton} onPress={handleImagePicker}>
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          editable={isEditing}
          onChangeText={setName}
        />

        <Text style={styles.label}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          editable={isEditing}
          onChangeText={setPhoneNumber}
        />

        <Text style={styles.label}>About:</Text>
        <TextInput
          style={styles.input}
          value={about}
          editable={isEditing}
          onChangeText={setAbout}
        />

        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#25D366',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#25D366',
    padding: 8,
    borderRadius: 30,
  },
  infoContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    color: 'gray',
  },
  saveButton: {
    backgroundColor: '#25D366',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editButton: {
    borderColor: '#25D366',
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#25D366',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ShowProfile;
