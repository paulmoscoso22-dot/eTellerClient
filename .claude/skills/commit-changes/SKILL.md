---
name: commit-changes
description: > Commit pending changes.
To be used for committing code changes in a git repository.
---

# Commit Changes skill

When asked for committing changes, follow these steps:

1. **Check for uncommitted changes**:
    - Run `git status` to see if there are any uncommitted changes.

2. **Group changes**:
    - If there are multiple changes, group them logically if possible.
    - Decide on maingful commit messages for each group.

3. **Stage changes**:
    - Stage the changes using `git add .` for each group of files.

4. **Commit changes**:
    - Commit the staged changes using [conventional commit messages](conventional-commit.md) guidelines.

    


