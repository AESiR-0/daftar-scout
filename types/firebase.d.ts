declare module 'firebase/app' {
  export function initializeApp(config: any): any;
  export type FirebaseApp = any;
}

declare module 'firebase/messaging' {
  export function getMessaging(app: any): any;
  export function getToken(messaging: any, options?: any): Promise<string>;
  export function onMessage(messaging: any, callback: any): () => void;
  export type Messaging = any;
}

declare module 'firebase-admin' {
  export function initializeApp(config: any): any;
  export const credential: {
    cert: (config: any) => any;
  };
  export const messaging: () => {
    send: (message: any) => Promise<any>;
  };
  export const apps: any[];
} 