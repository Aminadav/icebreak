# Navigation System Migration - Component-Based Navigation

We've successfully migrated from a string-based navigation system to a component-based navigation system similar to Flutter's Navigator.

## Before (String-based Navigation)

```tsx
// Old way - messy with callback props
interface PageProps {
  onBack: () => void;
  onContinue: (data: any) => void;
  onMenuAction: (page: string) => void;
}

function SomePage({ onBack, onContinue, onMenuAction }: PageProps) {
  const handleNext = () => {
    onContinue(someData);
  };

  const handleMenu = (action: string) => {
    if (action === 'about') {
      onMenuAction('about');
    }
  };
}

// In AppRouter - huge switch statement
switch (entry.page) {
  case 'enterPhoneNumber':
    return (
      <EnterPhoneNumberPage 
        onBack={back}
        onContinue={(phoneNumber: string) => {
          replace('enter2faCode', { phoneNumber });
        }}
        onMenuAction={(page: string) => {
          push(page);
        }}
      />
    );
}
```

## After (Component-based Navigation)

```tsx
// New way - clean and simple
function SomePage() {
  const { push, back } = useNavigation();

  const handleNext = () => {
    // Directly push the next component with props
    push(<Enter2faCodePage phoneNumber={phoneNumber} />);
  };

  const handleMenu = () => {
    // Directly push components
    push(<AboutPage />);
  };
}

// In AppRouter - much simpler
function AppRouter() {
  const { navigationStack } = useNavigation();

  return (
    <div>
      {navigationStack.map((entry, index) => (
        <div key={entry.key}>
          {entry.component} {/* Direct component rendering */}
        </div>
      ))}
    </div>
  );
}
```

## Benefits

1. **Cleaner Component Interfaces**: No more callback props clutter
2. **Better Type Safety**: Props are passed directly when pushing components
3. **More Intuitive**: Similar to how React Router and Flutter work
4. **Easier to Maintain**: No more massive switch statements
5. **Better State Management**: Components can receive props directly

## How It Works

1. **Navigation Stack**: Stores React elements instead of strings
2. **Direct Component Pushing**: `push(<ComponentName prop="value" />)`
3. **Automatic Rendering**: AppRouter renders components directly from the stack
4. **Clean Props**: Pass data directly to components when navigating

## Example Usage

```tsx
// Navigate to a page with data
const { push } = useNavigation();

// Instead of: push('enterPhoneNumber', { phoneNumber })
// Now: 
push(<EnterPhoneNumberPage phoneNumber={phoneNumber} />);

// Navigate to about page
push(<AboutPage />);

// Navigate with complex props
push(<GamePage 
  gameId={123} 
  playerName="John" 
  settings={{ volume: 0.8, difficulty: 'easy' }} 
/>);
```

This migration makes the navigation system much cleaner and more maintainable!

---

# Journey State in Icebreak App

## Overview
The "journey" tracks a user's progress through the onboarding flow (e.g., phone, email, name, gender, etc.). This state is saved in the database and used to restore the user's position after a refresh or reconnect.

## How It Works
- **Saving State:**
  - The backend saves the current journey state in the `devices` table (`journey_state` column) whenever the user advances a step (e.g., after entering email, name, etc.).
  - The frontend emits events (via socket.io) to update the journey state on the backend.
  - Pages can use the generic `update_journey_state` event to save their state.
- **Restoring State:**
  - On page load or refresh, the frontend requests the current journey state from the backend.
  - The backend includes all user details (including `gender`) in the `device_registered` response.
  - The app automatically navigates the user to the correct page based on the saved state and available user data.

## Where to Modify When Adding a New Page
- **Frontend:**
  - Update the navigation logic (usually in the main navigation context/provider) to handle the new journey step.
  - Ensure the new page emits an event to update the journey state after successful completion.
- **Backend:**
  - Update the socket event handlers (see `backend/routes/socket.js`) to handle the new journey state value.
  - Ensure the `devices` table and model support the new state if needed.

## Debugging & Troubleshooting
- **Frontend:**
  - Check the navigation context/provider for logic errors.
  - Inspect socket events in the browser console.
- **Backend:**
  - Inspect `backend/routes/socket.js` for event handling and state saving.
  - Check the `devices` table in the database for the `journey_state` value.

## Quick Reference
- **Frontend navigation:** `src/contexts/NavigationContext.tsx` (or similar)
- **Backend journey state logic:** `backend/routes/socket.js`
- **Database:** `devices` table, `journey_state` column

For more details, see code comments in the relevant files.
