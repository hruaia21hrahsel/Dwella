# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

- GitHub: https://github.com/hruaia21hrahsel/Dwella
- Default branch: `main`
- Git identity: `hruaia21hrahsel` / `hruaia21hrahsel@users.noreply.github.com`

## Git Workflow

**Commit and push to GitHub after every meaningful unit of work.** This ensures no progress is ever lost and the repository always reflects the current state of the project.

```bash
git add <specific-files>
git commit -m "Short imperative summary"
git push origin main
```

- Commit at natural checkpoints: after adding a feature, fixing a bug, updating config, etc.
- Stage specific files rather than `git add -A`
- Keep commit messages concise and in the imperative mood (e.g. "Add login form", not "Added login form")
- Never use `--no-verify` or `--force` unless explicitly requested by the user
- Do not batch unrelated changes into a single commit — keep commits focused and atomic
