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
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';

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
        const { text, audio, image, document, createdAt, user } = childSnapshot.val();
        messagesArray.push({
          _id: childSnapshot.key,
          text: text || '',
          audio: audio || null,
          image: image || null,
          document: document || null,
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

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      const { uri, name, type } = res[0];
      console.log('PDF selected:', { uri, name, type });

      await uploadDocument(uri, name, type);
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled document picker');
      } else {
        console.error('DocumentPicker Error: ', error);
        Alert.alert('Error', 'Failed to pick document.');
      }
    }
  };
  const uploadDocument = async (uri, fileName, type) => {
    const chatId = generateChatId(user.email, contactEmail);
    const documentRef = storage().ref(`chats/${chatId}/documents/${fileName}`);

    try {
      console.log('Uploading document:', { uri, fileName, type });
      const filePath = await RNFetchBlob.fs.stat(uri).then((stats) => stats.path);

      await documentRef.putFile(filePath, { contentType: type });
      const documentUrl = await documentRef.getDownloadURL();

      console.log('Document uploaded successfully, URL:', documentUrl);

      const documentMessage = {
        _id: new Date().getTime().toString(),
        document: documentUrl,
        fileName,
        createdAt: new Date().getTime(),
        user: {
          _id: user.uid,
          name: user.displayName || 'Anonymous',
        },
      };

      await database().ref(`chats/${chatId}/messages`).push(documentMessage);
      setMessages(previousMessages => GiftedChat.append(previousMessages, [documentMessage]));
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document.');
    }
  };

  const downloadDocument = async (documentUrl) => {
    try {
      const { config, fs } = RNFetchBlob;
      const filePath = `${fs.dirs.DownloadDir}/DownloadedDocument.pdf`; // Destination where the document will be saved

      config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: 'Downloading document',
        },
      })
        .fetch('GET', documentUrl)
        .then((res) => {
          console.log('Document downloaded to:', res.path());
          Alert.alert('Success', 'Document downloaded successfully.');
        })
        .catch((error) => {
          console.error('Document download failed:', error);
          Alert.alert('Error', 'Failed to download document.');
        });
    } catch (error) {
      console.error('Error downloading document:', error);
      Alert.alert('Error', 'Failed to download document.');
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
            <Feather name={isPlaying ? 'pause' : 'play'} size={24} color="#075E54" />
          </TouchableOpacity>
          {isPlaying && <Slider
            style={styles.audioSlider}
            value={playbackPosition}
            minimumValue={0}
            maximumValue={duration}
            onValueChange={value => setPlaybackPosition(value)}
            onSlidingComplete={async (value) => {
              await audioRecorderPlayer.seekToPlayer(value);
              setPlaybackPosition(value);
            }}
          />}
          <Text style={styles.audioDuration}>
            {audioRecorderPlayer.mmssss(Math.floor(playbackPosition))} / {audioRecorderPlayer.mmssss(Math.floor(duration))}
          </Text>
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

    if (currentMessage.document) {
      return (
        <View style={[
          styles.documentContainer,
          currentMessage.user._id === user.uid ? styles.sentDocument : styles.receivedDocument
        ]}>
          <TouchableOpacity onPress={() => downloadDocument(currentMessage.document)}>
            <Text style={styles.documentText}>{currentMessage.fileName}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <Bubble {...props} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Image source={{ uri: contactProfilePic }} style={styles.profileImage} />
        <Text style={styles.contactName}>{contactName}</Text>
      </View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: user.uid,
          name: user.displayName || 'Anonymous',
        }}
        renderBubble={renderBubble}
        renderTime={props => <Time {...props} timeFormat='h:mm A' />}
        showUserAvatar
        textInputStyle={{ color: 'black', }}
        parsePatterns={(linkStyle) => [
          {
            pattern: /(\d{2}\/\d{2}\/\d{4})/, 
            style: linkStyle,
            onPress: (text) => console.log(`Pressed on ${text}`),
          },
        ]}

      />
      <View style={styles.footer}>
        <TouchableOpacity onPress={openCamera} style={styles.cameraButton}>
          <Feather name="camera" size={24} color="#075E54" />
        </TouchableOpacity>
        <TouchableOpacity onPress={pickDocument} style={styles.documentButton}>
          <Feather name="file" size={24} color="#075E54" />
        </TouchableOpacity>
        <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={styles.recordButton}>
          <Feather name={isRecording ? 'stop-circle' : 'mic'} size={24} color="#075E54" />
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#075E54',
    padding: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  contactName: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  cameraButton: {
    marginHorizontal: 10,
  },
  documentButton: {
    marginHorizontal: 10,
  },
  recordButton: {
    marginHorizontal: 10,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentAudio: {
    backgroundColor: '#DCF8C6',
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  receivedAudio: {
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  audioSlider: {
    width: '100%',
    height: 40,
    marginVertical: 5,
  },
  audioDuration: {
    color: '#757575',
  },
  imageContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    margin: 5,
  },
  sentImage: {
    backgroundColor: '#DCF8C6',
  },
  receivedImage: {
    backgroundColor: '#ECECEC',
  },
  image: {
    width: 150,
    height: 150,
  },
  documentContainer: {
    borderRadius: 10,
    backgroundColor: '#ECECEC',
    padding: 10,
    margin: 5,
  },
  sentDocument: {
    backgroundColor: '#DCF8C6',
  },
  receivedDocument: {
    backgroundColor: '#ECECEC',
  },
  documentText: {
    color: '#075E54',
  },
});

export default MessageScreen;
