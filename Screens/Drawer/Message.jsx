import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { useRoute, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';  // Using Feather icons for the back button

const MessageScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { contactName, contactEmail, contactProfilePic } = route.params || {};

  const [messages, setMessages] = useState([]);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user || !contactEmail) return;

    const chatId = generateChatId(user.email, contactEmail);

    const messageRef = database()
      .ref(`chats/${chatId}/messages`)
      .orderByChild('createdAt');

    const onValueChange = messageRef.on('value', snapshot => {
      const messagesArray = [];
      snapshot.forEach((childSnapshot) => {
        messagesArray.push({
          _id: childSnapshot.key,
          text: childSnapshot.val().text,
          createdAt: new Date(childSnapshot.val().createdAt),
          user: childSnapshot.val().user,
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

    database()
      .ref(`chats/${chatId}/messages`)
      .push({
        ...message,
        createdAt: new Date().getTime(),
      });

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  }, [user.email, contactEmail]);

  const generateChatId = (email1, email2) => {
    const safeEmail1 = email1.replace(/[.#$[\]]/g, '_');
    const safeEmail2 = email2.replace(/[.#$[\]]/g, '_');
    return [safeEmail1, safeEmail2].sort().join('_');
  };

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: '#ece5dd', 
        },
        right: {
          backgroundColor: '#dcf8c6', 
        },
      }}
      textStyle={{
        left: {
          color: 'black',  
        },
        right: {
          color: 'black',  
        },
      }}
    />
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
        textInputStyle={{ color: 'black' }}  
        placeholderTextColor="gray"         
      />
    </View>
  );
};

export default MessageScreen;

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
});
