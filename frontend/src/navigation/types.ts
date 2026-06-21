import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  CreateAccount: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  AppsLinksStore: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  SignaturePreview: undefined;
};

export type ContactsStackParamList = {
  ContactsMain: undefined;
  EditContact: { mode?: 'new' | 'edit'; contactId?: string };
};

export type MenuDetailPage =
  | 'howToUse'
  | 'getDevice'
  | 'ambassador'
  | 'helpSupport';

export type MenuStackParamList = {
  MenuMain: undefined;
  MenuDetail: { page: MenuDetailPage };
  ShareFeedback: undefined;
};

export type MainTabParamList = {
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
  ContactsTab: NavigatorScreenParams<ContactsStackParamList>;
  ShareTab: undefined;
  AnalyticsTab: undefined;
  MenuTab: NavigatorScreenParams<MenuStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
