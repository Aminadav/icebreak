import { getIsTesting } from "./utils/isTesting"

var is_dev = window.location.hostname === 'localhost' && getIsTesting() === false;
export const env = {
  is_dev,
  DEBUG_SHOW_SCREEN_NAME:is_dev ? false : false,

}