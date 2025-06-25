import { useLayoutEffect, useRef, useState } from "react";

var currentZIndex = 1000

export function getNextZIndex() {
  currentZIndex++;
  return currentZIndex;
}
export default function useNextZIndex() {
  const zIndex =useRef(0)
  
  if(!zIndex.current) {
    console.log('HERE!!!!', {currentZIndex})
    currentZIndex++
    zIndex.current = currentZIndex;
  }

  return zIndex.current;
}