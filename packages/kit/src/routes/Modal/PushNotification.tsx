import React from 'react';

import { useIsVerticalLayout } from '@onekeyhq/components';

import GuideToPushFirstTime from '../../views/PushNotification/GuideToPushFirstTime';
import {
  PushNotificationRoutes,
  PushNotificationRoutesParams,
} from '../../views/PushNotification/types';

import createStackNavigator from './createStackNavigator';

const PushNotificationNavigator =
  createStackNavigator<PushNotificationRoutesParams>();

const modalRoutes = [
  {
    name: PushNotificationRoutes.GuideToPushFirstTime,
    component: GuideToPushFirstTime,
  },
];

const PushNotificationModalStack = () => {
  const isVerticalLayout = useIsVerticalLayout();
  return (
    <PushNotificationNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: !!isVerticalLayout,
      }}
    >
      {modalRoutes.map((route) => (
        <PushNotificationNavigator.Screen
          key={route.name}
          name={route.name}
          component={route.component}
        />
      ))}
    </PushNotificationNavigator.Navigator>
  );
};

export default PushNotificationModalStack;
export { PushNotificationRoutes };
export type { PushNotificationRoutesParams };
