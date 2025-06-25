import { getIsTesting } from "./utils/isTesting"

var is_dev = window.location.hostname === 'localhost' && getIsTesting() === false;
export const env = {
  is_dev,
  DEBUG_SHOW_SCREEN_NAME:is_dev ? false : false,
  DEBUG_SHOW_ENGLISH:is_dev ? false : false,
  DEBUG_SHOW_COMPONENTS_LIBRARY_IN_MENU:is_dev ? false : false,
  DEBUG_SHOW_SWITCH_TO_ENGLISH:is_dev ? false : false,
  DEBUG_SHOW_ADD_PLAYERS:is_dev ? true : false,

}