# Pacakges
For packages use pnpm.
For execute packages use npm / npx.

# No manually restarts.
No need to restart frontend or backend, they are already running (and automatically restart after cahnges).
If need to capture output of backend, just ask the user to copy and paste.

# Schema
If needed access to the databse schema. Use Docker. the container name is icebreak_postgres, the databasename icebreak_db.  The username is: icebreak_user.

# Frontend testing
When you have new task to implement something on the frontend, do not test it.
Just let me know that you have implemented it and I will test it.
Dont run tsx to check compilation errors.

# Backend testing
If you have implemented something on the backend, you can create a test file and execute it. (If needed)

# Checking for compilation errors.
If you want to check for errors, ask the user to copy errors from the logs. Do not create test file for that.

# When agent finish and after the summary give me suggessted git commit message.