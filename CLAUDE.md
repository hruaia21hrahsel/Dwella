# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

- GitHub: https://github.com/hruaia21hrahsel/Dwella
- Default branch: `main`
- Git identity: `hruaia21hrahsel` / `hruaia21hrahsel@users.noreply.github.com`

## Git Workflow

Commit and push after every meaningful change:

```bash
git add <specific-files>
git commit -m "Short imperative summary"
git push origin main
```

- Stage specific files rather than `git add -A`
- Keep commit messages concise and in the imperative mood (e.g. "Add login form", not "Added login form")
- Never use `--no-verify` or `--force` unless explicitly requested by the user
