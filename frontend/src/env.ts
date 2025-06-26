import { getIsTesting } from "./utils/isTesting"

var is_dev = window.location.hostname === 'localhost' && getIsTesting() === false;
export const env = {
  BACKEND_URL: 'http://localhost:4001',
  
  // Feature Flags
  SHOW_SHARE_BUTTON_WHEN_GAME_READY:false,
  
  // Debug Flags
  is_dev,
  DEBUG_SHOW_SCREEN_NAME:is_dev ? false : false,
  DEBUG_SHOW_ENGLISH:is_dev ? false : false,
  DEBUG_SHOW_COMPONENTS_LIBRARY_IN_MENU:is_dev ? false : false,
  DEBUG_SHOW_SWITCH_TO_ENGLISH:is_dev ? false : false,
  DEBUG_SHOW_ADD_PLAYERS:is_dev ? true : false,



}