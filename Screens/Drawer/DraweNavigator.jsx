import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import ShowProfile from './ShowProfile';
import Main from './Main';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
      <Drawer.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#075E54' },
          headerTintColor: '#fff',
          drawerStyle: {
            backgroundColor: '#fff',
          },
          drawerActiveTintColor: '#25D366',
          drawerInactiveTintColor: '#000',
        }}
      >
        <Drawer.Screen
          name="Main Profile"
          component={ShowProfile}
          options={{ title: 'Profile' }}
        />
        <Drawer.Screen
          name="Main"
          component={Main}
          options={{ title: 'Main' }}
        />
      </Drawer.Navigator>
  );
};

export default DrawerNavigator;

