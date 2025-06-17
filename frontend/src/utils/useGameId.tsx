import { useParams } from "react-router-dom";

//@ts-check
export function useGameId() {
  const { gameId } = useParams<{ gameId: string }>();
  if(!gameId) {
    // return from location such as: http://localhost:4000/game/0c4e2ec9-3dca-4d47-8b5e-1bd09cdbda11/avatar
    const location = window.location.pathname;
    const match = location.match(/\/game\/([^/]+)\//);
    if (match && match[1]) {
      return match[1]; // Return the gameId extracted from the URL
    }
    // If no gameId is found in the URL, return a default or fallback value
    return null; // Indicate that no gameId was found
  }
  return gameId; // Fallback if gameId is not available  
}