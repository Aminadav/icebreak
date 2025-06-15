# HOw to use:
# ./autocommit.sh my commit message
# if no message just use the commit "auto commit"
#!/bin/bash
# Check if a commit message is provided
if [ -z "$1" ]; then
  COMMIT_MESSAGE="auto commit"
else
  COMMIT_MESSAGE="$1"
fi
# Add all changes to staging
cd ..
git add .
# Commit the changes with the provided message
git commit -m "$COMMIT_MESSAGE"
# Push the changes to the remote repository
git push