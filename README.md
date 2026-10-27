# DSA Sathi (DSA Practice Buddy)

Browser-based DSA practice tool: problem solve karo, tests run karo, aur AI se hints/code review lo bina full answer diye.

## Features
- 8 built-in problems (arrays, strings, stack, binary search, DP)
- In-browser test runner (Web Worker, 3s timeout for infinite loops)
- 3-level hints (built-in, no API key needed)
- AI hints + code review in Hinglish (optional, Anthropic API key)
- Progress and code auto-saved in localStorage

## Run
Koi build step nahi. `index.html` double-click karo, ya:

    npx serve .

## AI setup
Top-right **AI Settings** me apni Anthropic API key daalo. Key sirf browser me save hoti hai.
Note: key browser se direct use hoti hai, isliye sirf personal use ke liye. Deploy karna ho to backend proxy banao.

## Add a problem
`problems.js` me ek object add karo: `id, title, difficulty, fn, desc, example, starter, tests, hints`.

## Roadmap
- Java/Python support via Judge0 API
- Streak tracking (StreakKeeper integration)
- More problems: linked list, trees, graphs
