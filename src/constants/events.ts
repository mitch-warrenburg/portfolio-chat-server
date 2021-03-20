import { ChatEventType } from '../types';

export const NEW_SESSION: ChatEventType = 'NEW_SESSION';
export const USER_SESSIONS: ChatEventType = 'USER_SESSIONS';
export const TYPING_STATUS: ChatEventType = 'TYPING_STATUS';
export const USER_CONNECTED: ChatEventType = 'USER_CONNECTED';
export const PRIVATE_MESSAGE: ChatEventType = 'PRIVATE_MESSAGE';
export const USER_DISCONNECTED: ChatEventType = 'USER_DISCONNECTED';

export const SOCKET_CONNECTED: ChatEventType = 'connection';
export const SOCKET_DISCONNECTED: ChatEventType = 'disconnect';
