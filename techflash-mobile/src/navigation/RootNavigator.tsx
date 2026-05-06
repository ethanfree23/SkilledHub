import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import JobsScreen from '../screens/JobsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import MoreScreen from '../screens/MoreScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminCrmScreen from '../screens/AdminCrmScreen';
import AdminUserDetailScreen from '../screens/AdminUserDetailScreen';
import AdminCrmDetailScreen from '../screens/AdminCrmDetailScreen';
import AdminCreateUserScreen from '../screens/AdminCreateUserScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import CreateJobScreen from '../screens/CreateJobScreen';
import EditJobScreen from '../screens/EditJobScreen';
import ConversationScreen from '../screens/ConversationScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  Messages: undefined;
  AdminUsers: undefined;
  AdminCrm: undefined;
  More: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
export type AppStackParamList = {
  MainTabs: undefined;
  AdminUserDetail: { userId: number };
  AdminCrmDetail: { crmLeadId?: number };
  AdminCreateUser: undefined;
  JobDetail: { jobId: number };
  CreateJob: undefined;
  EditJob: { jobId: number };
  Conversation: { conversationId: number };
  Settings: undefined;
};
const AppStack = createNativeStackNavigator<AppStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    primary: colors.primaryOrange,
    text: colors.text,
    card: colors.white,
    border: colors.border,
  },
};

function MainTabsNavigator() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        tabBarActiveTintColor: colors.primaryOrange,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <MainTabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'TechFlash' }}
      />
      <MainTabs.Screen name="Jobs" component={JobsScreen} options={{ title: 'Jobs' }} />
      <MainTabs.Screen name="Messages" component={MessagesScreen} options={{ title: 'Messages' }} />
      {isAdmin ? (
        <>
          <MainTabs.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Users' }} />
          <MainTabs.Screen name="AdminCrm" component={AdminCrmScreen} options={{ title: 'CRM' }} />
        </>
      ) : null}
      <MainTabs.Screen name="More" component={MoreScreen} options={{ title: 'Account' }} />
    </MainTabs.Navigator>
  );
}

function AppStackNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <AppStack.Screen
        name="MainTabs"
        component={MainTabsNavigator}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="AdminUserDetail"
        component={AdminUserDetailScreen}
        options={{ title: 'Admin user detail' }}
      />
      <AppStack.Screen
        name="AdminCrmDetail"
        component={AdminCrmDetailScreen}
        options={{ title: 'CRM lead' }}
      />
      <AppStack.Screen
        name="AdminCreateUser"
        component={AdminCreateUserScreen}
        options={{ title: 'Create user' }}
      />
      <AppStack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job detail' }}
      />
      <AppStack.Screen
        name="CreateJob"
        component={CreateJobScreen}
        options={{ title: 'Create job' }}
      />
      <AppStack.Screen
        name="EditJob"
        component={EditJobScreen}
        options={{ title: 'Edit job' }}
      />
      <AppStack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ title: 'Conversation' }}
      />
      <AppStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </AppStack.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <AuthStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Log in' }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
    </AuthStack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <AppStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
