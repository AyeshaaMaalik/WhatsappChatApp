import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useRoute } from '@react-navigation/native';

const MessageScreen = () => {
  const route = useRoute();
  const { contactName, contactEmail, contactProfilePic } = route.params || {};
  
  const [messages, setMessages] = useState([]);
  const user = auth().currentUser || { uid: 'default_uid', displayName: 'Guest', photoURL: 'https://placehold.co/100x100' };

  useEffect(() => {
    if (!contactEmail || !user.email) return;

    const chatId = generateChatId(user.email, contactEmail);

    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) =>
        setMessages(
          snapshot.docs.map(doc => ({
            _id: doc.id,
            text: doc.data().text,
            createdAt: doc.data().createdAt.toDate(),
            user: doc.data().user,
          }))
        )
      );

    return () => unsubscribe();
  }, [contactEmail, user.email]);

  const onSend = useCallback(async (newMessages = []) => {
    const chatId = generateChatId(user.email, contactEmail);
    const message = newMessages[0];

    try {
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
          ...message,
          createdAt: new Date(),
        });

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  }, [contactEmail, user.email]);

  const generateChatId = (email1, email2) => {
    return [email1, email2].sort().join('_');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
          name: user.displayName,
          avatar: user.photoURL || 'https://placehold.co/100x100',
        }}
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
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  contactInfo: {
    flexDirection: 'column',
  },
  contactName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  contactEmail: {
    fontSize: 16,
    color: '#fff',
  },
});

export default MessageScreen;
