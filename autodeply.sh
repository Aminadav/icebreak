# ask for commit message.
# then add all the files, commit and push to the main branch.
# if no commit message use the default "Auto Commit"
#!/bin/bash
echo "Enter commit message (default: 'Auto Commit'): "
read commit_message
if [ -z "$commit_message" ]; then
    commit_message="Auto Commit"
fi
git add .
git commit -m "$commit_message"
git push origin main