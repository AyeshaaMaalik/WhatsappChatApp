import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, Alert } from 'react-native';
import { GiftedChat, Bubble, Time } from 'react-native-gifted-chat';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { useRoute, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Slider from '@react-native-community/slider';

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
        console.log('Fetched audio URL:', audio); // Debugging line
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

    return () => messageRef.off('value', onValueChange);
  }, [user.email, contactEmail]);

  const onSend = useCallback((newMessages = []) => {
    if (!user || !contactEmail) return;
    const chatId = generateChatId(user.email, contactEmail);
    const message = newMessages[0];

    database().ref(`chats/${chatId}/messages`).push({
      ...message,
      createdAt: new Date().getTime(),
    });

    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  }, [user.email, contactEmail]);

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
        audio: result, // Store the URL or path to the audio file
        createdAt: new Date().getTime(),
        user: {
          _id: user.uid,
          name: user.displayName || 'Anonymous',
        },
      };

      database().ref(`chats/${chatId}/messages`).push(audioMessage);
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
        console.log('Playing audio from:', audioUrl); // Debugging line
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
      console.error('Error stopping audio:', error); // Enhanced error logging
      Alert.alert('Error', 'Failed to stop audio.');
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
    <TouchableOpacity
      style={styles.voiceButton}
      onPress={isRecording ? stopRecording : startRecording}
    >
      <Feather name={isRecording ? 'mic-off' : 'mic'} size={24} color="#075E54" />
      {isRecording && <Text>{(recordingDuration / 1000).toFixed(1)}s</Text>}
    </TouchableOpacity>
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
          <Text style={styles.contactName}>{contactName}</Text>
          <Text style={styles.contactEmail}>{contactEmail}</Text>
        </View>
      </View>

      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || 'https://placehold.co/100x100',
        }}
        renderBubble={renderBubble}
        renderTime={renderTime}
        renderActions={renderActions}
        textInputStyle={{ color: 'black' }}
        placeholderTextColor="gray"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ece5dd',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#075E54',
    elevation: 4,
    height: 60,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 15,
  },
  contactInfo: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  contactEmail: {
    fontSize: 14,
    color: '#fff',
  },
  voiceButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioSlider: {
    width: 120,
    marginLeft: 10,
  },
  sentAudio: {
    backgroundColor: '#dcf8c6',
    padding: 10,
    borderRadius: 20,
  },
  receivedAudio: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
  },
});

export default MessageScreen;
