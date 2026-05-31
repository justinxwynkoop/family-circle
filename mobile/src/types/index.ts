export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  circleIds: string[];
}

export interface Circle {
  id: string;
  name: string;
  ownerId: string;
  createdAt: number;
  inviteCode: string;
  inviteExpiry: number;
  memberIds: string[];
}

export interface CircleMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  joinedAt: number;
}

export interface LocationData {
  uid: string;
  displayName: string;
  photoURL?: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  batteryLevel: number;
  updatedAt: number;
  circleId: string;
}

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Map: undefined;
  Circle: undefined;
  Settings: undefined;
};
