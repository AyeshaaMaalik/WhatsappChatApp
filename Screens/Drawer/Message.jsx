import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, Alert } from 'react-native';
import { GiftedChat, Bubble, Time } from 'react-native-gifted-chat';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { useRoute, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Slider from '@react-native-community/slider';
import { launchCamera } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const audioRecorderPlayer = new AudioRecorderPlayer();

const MessageScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { contactName, contactEmail, contactProfilePic } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user || !contactEmail) return;

    const chatId = generateChatId(user.email, contactEmail);
    const messageRef = database().ref(`chats/${chatId}/messages`).orderByChild('createdAt');

    const onValueChange = messageRef.on('value', snapshot => {
      const messagesArray = [];
      snapshot.forEach(childSnapshot => {
        const { text, audio, createdAt, user } = childSnapshot.val();
        messagesArray.push({
          _id: childSnapshot.key,
          text: text || '',
          audio: audio || null,
          createdAt: new Date(createdAt),
          user,
        });
      });
      setMessages(messagesArray.reverse());
    });

    return () => {
      messageRef.off('value', onValueChange);
    };
  }, [user, contactEmail]);

  const onSend = useCallback((newMessages = []) => {
    if (!user || !contactEmail) return;
    const chatId = generateChatId(user.email, contactEmail);
    const message = newMessages[0];

    database().ref(`chats/${chatId}/messages`).push({
      ...message,
      createdAt: new Date().getTime(),
    });

    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  }, [user, contactEmail]);

  const generateChatId = (email1, email2) => {
    const safeEmail1 = email1.replace(/[.#$[\]]/g, '_');
    const safeEmail2 = email2.replace(/[.#$[\]]/g, '_');
    return [safeEmail1, safeEmail2].sort().join('_');
  };

  const startRecording = async () => {
    try {
      await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordingDuration(e.current_position);
      });
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setRecordingDuration(0);
      setIsRecording(false);

      const chatId = generateChatId(user.email, contactEmail);
      const audioMessage = {
        _id: new Date().getTime().toString(),
        audio: result, 
        createdAt: new Date().getTime(),
        user: {
          _id: user.uid,
          name: user.displayName || 'Anonymous',
        },
      };

      await database().ref(`chats/${chatId}/messages`).push(audioMessage);
      setMessages(previousMessages => GiftedChat.append(previousMessages, [audioMessage]));
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const playAudio = async (audioUrl) => {
    try {
      if (isPlaying) {
        await stopAudio();
      } else {
        if (!audioUrl) {
          console.error('No audio URL provided');
          Alert.alert('Error', 'No audio URL provided.');
          return;
        }
        setIsPlaying(true);
        console.log('Playing audio from:', audioUrl);
        await audioRecorderPlayer.startPlayer(audioUrl);
        audioRecorderPlayer.addPlayBackListener((e) => {
          setPlaybackPosition(e.current_position);
          setDuration(e.duration);
          if (e.current_position >= e.duration) {
            stopAudio();
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio.');
    }
  };

  const stopAudio = async () => {
    try {
      setIsPlaying(false);
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setPlaybackPosition(0);
    } catch (error) {
      console.error('Error stopping audio:', error);
      Alert.alert('Error', 'Failed to stop audio.');
    }
  };

  const openCamera = () => {
    launchCamera({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const { uri, fileName, type } = response.assets[0];
        await uploadImage(uri, fileName, type);
      }
    });
  };

  const uploadImage = async (uri, fileName, type) => {
    const chatId = generateChatId(user.email, contactEmail);
    const imageRef = storage().ref(`chats/${chatId}/images/${fileName}`);

    try {
      await imageRef.putFile(uri, { contentType: type });
      const imageUrl = await imageRef.getDownloadURL();
      const imageMessage = {
        _id: new Date().getTime().toString(),
        image: imageUrl,
        createdAt: new Date().getTime(),
        user: {
          _id: user.uid,
          name: user.displayName || 'Anonymous',
        },
      };

      await database().ref(`chats/${chatId}/messages`).push(imageMessage);
      setMessages(previousMessages => GiftedChat.append(previousMessages, [imageMessage]));
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image.');
    }
  };

  const renderBubble = (props) => {
    const { currentMessage } = props;

    if (currentMessage.audio) {
      return (
        <View style={[
          styles.audioContainer,
          currentMessage.user._id === user.uid ? styles.sentAudio : styles.receivedAudio
        ]}>
          <TouchableOpacity onPress={() => playAudio(currentMessage.audio)}>
            <Feather name={isPlaying ? 'pause' : 'play'} size={24} color="yellow" />
          </TouchableOpacity>
          <Slider
            style={styles.audioSlider}
            value={playbackPosition}
            minimumValue={0}
            maximumValue={duration}
            onSlidingComplete={async (value) => await audioRecorderPlayer.seekToPlayer(value)}
          />
        </View>
      );
    }

    if (currentMessage.image) {
      return (
        <View style={[
          styles.imageContainer,
          currentMessage.user._id === user.uid ? styles.sentImage : styles.receivedImage
        ]}>
          <Image source={{ uri: currentMessage.image }} style={styles.image} />
        </View>
      );
    }

    return <Bubble {...props} />;
  };

  const renderTime = (props) => (
    <Time
      {...props}
      timeTextStyle={{
        left: {
          color: 'black',
        },
        right: {
          color: 'black',
        },
      }}
    />
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.voiceButton}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Feather name={isRecording ? 'mic-off' : 'mic'} size={24} color="#075E54" />
        {isRecording && <Text>{(recordingDuration / 1000).toFixed(1)}s</Text>}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={openCamera}
      >
        <Feather name="camera" size={24} color="#075E54" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={{ uri: contactProfilePic || 'https://placehold.co/100x100' }}
          style={styles.profilePic}
        />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contactName || 'Contact'}</Text>
        </View>
      </View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: user.uid }}
        renderBubble={renderBubble}
        renderActions={renderActions}
        renderTime={renderTime}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#075E54',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contactName: {
    color: '#fff',
    fontSize: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  voiceButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
  },
  cameraButton: {
    marginHorizontal: 10,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  audioSlider: {
    flex: 1,
    height: 40,
  },
  sentAudio: {
    alignSelf: 'flex-end',
    backgroundColor: '#e1ffc7',
    borderRadius: 5,
    padding: 10,
  },
  receivedAudio: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
  },
  imageContainer: {
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 5,
  },
  sentImage: {
    alignSelf: 'flex-end',
  },
  receivedImage: {
    alignSelf: 'flex-start',
  },
  image: {
    width: 150,
    height: 150,
  },
});

export default MessageScreen;
