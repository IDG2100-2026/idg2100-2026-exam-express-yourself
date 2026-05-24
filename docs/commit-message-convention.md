# Branching Strategy and Commit Conventions
This document shows our teams branching and commit conventions.
## Branching strategy
Not sure yet.

## Commit conventions
Not every commit requires both a title and a body.  
Sometimes a good title alone is fine for simple changes, especially when the change is so simple that no further context is necessary. E.g.:  
`Fix typo in introduction to user guide`  

Use a body only when you need to explain *why*.  
Then simply run `git commit` (without `-m`) to open the editor.  
This makes it easy to write a proper title + body from the terminal, and follow the conventions below.  

1. **Separate title from body with a blank line**
- The title is the short first line. Put an empty line after it before any longer explanation.  
    **Do:**  
    `Add user search feature`
  
    `Users can now find other accounts by name.`
  
    **Dont:**  
    `Add user search feature Users can now find other accounts by name.`  
2. **Keep the title under 50 characters**
- Make the first line short so it shows fully in git logs.  
    **Do:**  
    `Fix broken password reset`
  
    **Dont:**  
    `This commit fixes the password reset flow that was not working correctly for some users`  
3. **Capitalize the first letter of the title**  
    **Do:**  
    `Update payment button text`
  
    **Dont:**  
    `update payment button text`  
4. **Do not end the title with a period**  
    **Do:**  
    `Improve error message display`
  
    **Dont:**  
    `Improve error message display.`  
5. **Use imperative mood in the title**
- Write the title like a command or order, as if telling someone what to do.  
    **Do:**  
    `Add dark mode toggle`
  
    **Dont:**  
    `Added dark mode toggle`  
6. **Wrap body text at 72 characters**
- Keep each line in the body under 72 characters long.  
    **Do:**  
    `Update API endpoint`
  
    `Old endpoint was slow and returned too much data.
    Switched to new v2 endpoint for better speed.`
  
    **Dont:**  
    `Update API endpoint`
  
    `Old endpoint was slow and returned too much data. Switched to new v2 endpoint for better speed and now it works much faster on mobile devices too.`  
7. **Body explains why and what, not how**
- Tell why the change was needed and what it does. The code already shows how.  
    **Do:**  
    `Change button color to blue`
  
    `Old red color was hard to see for color blind users.`
    `Blue passes accessibility checks.`
  
    **Dont:**  
    `Change button color to blue`
  
    `I used CSS background color property and set it to #007BFF then tested it in Chrome.`  

## References
https://cbea.ms/git-commit
