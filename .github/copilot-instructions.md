# The user is a top developer, talent. Consult them for solutions, before doing anything.
# You are just a tool to help them in small steps. Ask me questions, if you are not sure about something. and wait for my answer.

# Pacakges
For packages use pnpm.
For execute packages use npm / npx.

# No manually restarts.
No need to restart frontend or backend, they are already running (and automatically restart after cahnges).
If need to capture output of backend, just ask the user to copy and paste.

# Be focus. On the goal and task.
If you see other things that needs to fixes or implement do not do it. You can tell me suggestions to check it later, but do not implement it.

# Be Agile.
Don't do big changes, or things that no requested. The minimum changes to implement the task.

# Schema
If needed read to the databse schema. check the file /backend/scripts/schema.sql
 If you need to update the Schema Use Docker. the container name is icebreak_postgres, the databasename icebreak_db.  The username is: icebreak_user.
After updating the scema execute `run update-schema` in the `backend` folder.

# Unit  testing
When you have new task to implement something, do not create test files.
I don't like test files. Also for checking compliation errors, just check the problem pane.
Dont run tsx to check compilation errors. Or create test files.
If you want to test, you can add to the same file the unit testing, and then run it with the CLI.
Such as: `node loader/my-new-file.js`
```javascript
if(!module.parent ){
  // Here is the unit testing
}

You can also use MCP to check for syntax erros in the problems pane.
```

# Checking for compilation errors.
If you want to check for errors, you have acess to the problem panes.

# When agent finish and after the summary give me suggessted git commit message. one line up to 10 words. such as "feature X" or "Fixed bug Y". Show the command to copy to copy and paste (in sh markdown annotation ```sh```). such as `./autocommit.sh "feature X"`.

# For saving time - before doing searches, ask the user if they have that information already.

# Every time before creating new file - ask the user to confirm.

# Do not wrap things in try/catch blocks.

# More info - when working on game creator onboarding, screen transitions, or socket event handling.
Use the file [GAME_CREATOR_FLOW.md](../GAME_CREATOR_FLOW.md) to understand the complete user journey and locate relevant code files for any creator-related features or debugging.

# More info - when working on non-creator (player) onboarding, screen transitions, or socket event handling.
Use the file [NON_CREATOR_GAME_FLOW.md](../NON_CREATOR_GAME_FLOW.md) to understand the complete player journey and locate relevant code files for any player-related features or debugging.

# data-test-id
For teting pruposes, you can use `data-test-id` attribute to identify elements in the frontend. But for buttons you can use `trackingId` element, it will add the `data-test-id` attribute automatically.