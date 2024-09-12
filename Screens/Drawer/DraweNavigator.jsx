import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather'; 

import ShowProfile from './ShowProfile';
import Main from './Main';

const Drawer = createDrawerNavigator();

const { height: screenHeight } = Dimensions.get('window');

const CustomHeader = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>WhatsApp</Text>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.iconContainer}>
        <Icon name="menu" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const CustomDrawerContent = (props) => {
  return (
    <View style={styles.drawerContent}>
      {props.state.routeNames.map((routeName, index) => (
        <TouchableOpacity
          key={routeName}
          onPress={() => props.navigation.navigate(routeName)}
          style={styles.drawerItem}
        >
          <Text style={styles.drawerItemText}>{routeName}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Main"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: () => <CustomHeader />,
        drawerPosition: 'right',
        drawerStyle: {
          backgroundColor: '#232023',
          width: 250,
          height:100, 

        },
        drawerActiveTintColor: '#25D366',
        drawerInactiveTintColor: 'white',
      }}
    >
      <Drawer.Screen
        name="Main"
        component={Main}
        options={{ title: 'Main' }}
      />
      <Drawer.Screen
        name="Profile"
        component={ShowProfile}
        options={{headerShown:false}}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: '#075E54',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    padding: 8,
  },
  drawerContent: {
    flex: 1,
    justifyContent: 'center',
    height: screenHeight * 0.7, 
    backgroundColor: '#232023',
  },
  drawerItem: {
    padding: 16,
  },
  drawerItemText: {
    color: 'white',
    fontSize: 16,
  },
});

export default DrawerNavigator;
