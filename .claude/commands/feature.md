---
description: Start a new feature — creates a git branch and sets up context for development. Usage: /feature <feature-name>
---

Start a new feature for VastraaOS. The feature name is: $ARGUMENTS

## Steps

1. **Check current git status** — make sure working directory is clean before branching
   ```bash
   git status
   git branch --show-current
   ```

2. **Create the feature branch** from main
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/$ARGUMENTS
   ```

3. **Confirm the scope** — based on the feature name, identify:
   - Which app(s) are involved? (`apps/api/`, `apps/web/`, `apps/landing/`)
   - Which models/controllers/pages will be created or modified?
   - Does this require a database migration?
   - What API endpoints are needed?

4. **List the files to create/modify** — give a clear implementation plan before writing any code

5. **Begin implementation** — start with the API layer first, then frontend

> Branch naming convention: `feature/short-description` (kebab-case)
> Commit convention: `feat(scope): description` (e.g., `feat(api): add worker skill assignment endpoint`)
