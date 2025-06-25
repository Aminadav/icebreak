import { useEffect } from "react";

var stylesheetsUsed:{[key:string]:number}={}
var styleSheetElements:{[key:string]:HTMLStyleElement}={}
export default function useStyleSheet(key:string,style: string): void {
  useEffect(() => {
    if(!stylesheetsUsed[key]) {
      stylesheetsUsed[key]=0
    }
    stylesheetsUsed[key]++
    if(stylesheetsUsed[key]===1) {
      const styleElement=document.createElement('style');
      styleElement.innerHTML=style;
      styleSheetElements[key]=styleElement;
      document.head.appendChild(styleElement);
    }
    return () => {
      stylesheetsUsed[key]--
      if(stylesheetsUsed[key]<=0) {
        document.head.removeChild(styleSheetElements[key]);
        delete stylesheetsUsed[key]
        delete styleSheetElements[key];
      }
    }
  },[])
}