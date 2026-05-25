# Branching Strategy

We follow **GitHub Flow**. One rule drives everything: `main` is always working. All new work happens on a separate branch and only gets merged into `main` after a review.

---

## The Rules

1. **`main` is always stable**
- Never push directly to `main`. Every change goes through a branch and a pull request, no exceptions.

2. **Create a branch for every piece of work**
- Feature, bug fix, small change - always branch from `main` before starting.

    **Do:**
    Create `feature/login-page` before working on the login page

    **Dont:**
    Make changes directly on `main`

3. **Name your branch clearly**
- Use kebab-case and a prefix that shows the type of work.

    | Prefix | When to use | Example |
    |---|---|---|
    | `feature/` | New functionality | `feature/tournament-page` |
    | `fix/` | Bug fix | `fix/avatar-import-crash` |
    | `refactor/` | Restructuring without new features | `refactor/auth-provider` |
    | `docs/` | Documentation only | `docs/naming-conventions` |

4. **Make small and focused commits**
- Each commit should do one thing. Follow the conventions in `commit-message-convention.md`.

5. **Open a pull request when your work is ready**
- Open a PR to merge your branch into `main`. Write a short description of what you did and why.

6. **Get at least one teammate to review before merging**
- Do not merge your own PR without a review. At least one other team member has to approve it first.
- Lets leave this **optional** considering the short time we have left.

---

## Flow Overview

```
main
 |
 +-- feature/your-feature    (you work here)
 |
 PR reviewed and approved
 |
 merged back into main
```


---

## References

- https://www.geeksforgeeks.org/git/branching-strategies-in-git/
