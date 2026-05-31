import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from '../types';
import MapScreen from '../screens/main/MapScreen';
import CircleScreen from '../screens/main/CircleScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#4F46E5' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#4F46E5',
      }}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Family Map' }} />
      <Tab.Screen name="Circle" component={CircleScreen} options={{ title: 'My Circle' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
