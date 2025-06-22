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
If needed access to the databse schema. Use Docker. the container name is icebreak_postgres, the databasename icebreak_db.  The username is: icebreak_user.

# No  testing
When you have new task to implement something, do not create test files.
Dont run tsx to check compilation errors. Or create test files.

# Backend testing
If you have implemented something on the backend, you can create a test file and execute it. (If needed)

# Checking for compilation errors.
If you want to check for errors, ask the user to copy errors from the logs. Do not create test file for that.

# When agent finish and after the summary give me suggessted git commit message. one line up to 10 words. such as "feature X" or "Fixed bug Y". Try to run this command in terminal "./autocommit.sh "{COMMIT_MESSAGE}". If terminal not avaibable just show the command to copy to copy and paste.

# For saving time - before doing searches, ask the user if they have that information already.

# Every time before creating new file - ask the user to confirm.