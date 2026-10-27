// Each problem: fn = function name user must define, tests = [args[], expected], hints = 3 levels (nudge -> approach -> near-solution outline, never full code)
const PROBLEMS = [
  {
    id: "reverse-string", title: "Reverse String", difficulty: "Easy", fn: "reverseString",
    desc: "Ek string lo aur uska reverse return karo. Built-in reverse() mat use karo.",
    example: 'reverseString("hello") -> "olleh"',
    starter: "function reverseString(s) {\n  // your code\n}\n",
    tests: [[["hello"], "olleh"], [[""], ""], [["a"], "a"], [["abcd"], "dcba"]],
    hints: [
      "Socho: pehla aur aakhri character ka kya relation hona chahiye result me?",
      "Two pointers (left, right) use kar sakte ho, ya string ko end se start tak traverse karo.",
      "Loop i = length-1 se 0 tak chalao aur result me chars append karte jao."
    ]
  },
  {
    id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", fn: "isValid",
    desc: "String me sirf ()[]{} hain. Return true agar brackets sahi order me open/close hain.",
    example: 'isValid("()[]{}") -> true\nisValid("(]") -> false',
    starter: "function isValid(s) {\n  // your code\n}\n",
    tests: [[["()"], true], [["()[]{}"], true], [["(]"], false], [["([)]"], false], [["{[]}"], true], [[""], true], [["(("], false]],
    hints: [
      "Last open hua bracket sabse pehle close hona chahiye. Kaunsa data structure ye behaviour deta hai?",
      "Stack use karo: open bracket push, close bracket aaye to top se match karo.",
      "End me stack empty hona chahiye. Map banao closing -> opening pair ka."
    ]
  },
  {
    id: "two-sum", title: "Two Sum", difficulty: "Easy", fn: "twoSum",
    desc: "Array nums aur target do. Do indices return karo (sorted order me) jinka sum target ho. Exactly ek answer hai.",
    example: "twoSum([2,7,11,15], 9) -> [0,1]",
    starter: "function twoSum(nums, target) {\n  // your code\n}\n",
    tests: [[[[2, 7, 11, 15], 9], [0, 1]], [[[3, 2, 4], 6], [1, 2]], [[[3, 3], 6], [0, 1]], [[[-1, -2, -3, -4, -5], -8], [2, 4]]],
    hints: [
      "Brute force O(n^2) hai. Kya har element ke liye 'complement' ek baar me dhoondh sakte ho?",
      "Hash map use karo: value -> index.",
      "Traverse karte waqt check karo target - nums[i] map me pehle se hai ya nahi, phir current ko map me daalo."
    ],
    normalize: "sortResult"
  },
  {
    id: "binary-search", title: "Binary Search", difficulty: "Easy", fn: "search",
    desc: "Sorted array nums me target ka index return karo, nahi mila to -1. O(log n) chahiye.",
    example: "search([-1,0,3,5,9,12], 9) -> 4",
    starter: "function search(nums, target) {\n  // your code\n}\n",
    tests: [[[[-1, 0, 3, 5, 9, 12], 9], 4], [[[-1, 0, 3, 5, 9, 12], 2], -1], [[[5], 5], 0], [[[], 1], -1], [[[1, 2, 3, 4, 5, 6, 7], 1], 0]],
    hints: [
      "Har step me search space aadha kaise kar sakte ho?",
      "low, high, mid rakho. nums[mid] vs target compare karke low ya high move karo.",
      "Loop condition low <= high. mid = low + Math.floor((high - low) / 2) overflow se bachata hai."
    ]
  },
  {
    id: "max-subarray", title: "Maximum Subarray", difficulty: "Medium", fn: "maxSubArray",
    desc: "Integer array me contiguous subarray ka maximum sum return karo.",
    example: "maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) -> 6",
    starter: "function maxSubArray(nums) {\n  // your code\n}\n",
    tests: [[[[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6], [[[1]], 1], [[[5, 4, -1, 7, 8]], 23], [[[-3, -1, -2]], -1]],
    hints: [
      "Har position par ek decision: purane subarray ko extend karo ya naya shuru karo?",
      "Kadane's algorithm: current = max(nums[i], current + nums[i]).",
      "Saath me global best track karo. Sab negative ho to bhi sahi chalna chahiye, 0 se start mat karo."
    ]
  },
  {
    id: "merge-sorted", title: "Merge Two Sorted Arrays", difficulty: "Easy", fn: "mergeSorted",
    desc: "Do sorted arrays a aur b ko merge karke ek sorted array return karo. sort() mat use karo.",
    example: "mergeSorted([1,3,5],[2,4,6]) -> [1,2,3,4,5,6]",
    starter: "function mergeSorted(a, b) {\n  // your code\n}\n",
    tests: [[[[1, 3, 5], [2, 4, 6]], [1, 2, 3, 4, 5, 6]], [[[], [1]], [1]], [[[1, 1], [1]], [1, 1, 1]], [[[1, 2], [3, 4]], [1, 2, 3, 4]]],
    hints: [
      "Dono arrays already sorted hain, to har baar sirf front elements compare karne hain.",
      "Two pointers i, j. Chhota element result me daalo aur uska pointer badhao.",
      "Loop ke baad jo array bacha ho uske remaining elements append karna mat bhoolna."
    ]
  },
  {
    id: "palindrome", title: "Valid Palindrome", difficulty: "Easy", fn: "isPalindrome",
    desc: "Sirf letters/digits consider karo, case ignore karo. Return true agar palindrome hai.",
    example: 'isPalindrome("A man, a plan, a canal: Panama") -> true',
    starter: "function isPalindrome(s) {\n  // your code\n}\n",
    tests: [[["A man, a plan, a canal: Panama"], true], [["race a car"], false], [[" "], true], [["0P"], false]],
    hints: [
      "Pehle socho non-alphanumeric chars ko kaise ignore karoge.",
      "Two pointers dono ends se, non-alphanumeric skip karo, lowercase compare karo.",
      "Regex /[a-z0-9]/i se character check kar sakte ho."
    ]
  },
  {
    id: "fib", title: "Nth Fibonacci", difficulty: "Easy", fn: "fib",
    desc: "fib(0)=0, fib(1)=1. fib(n) return karo. n up to 40, to plain recursion slow padega (timeout 3s).",
    example: "fib(10) -> 55",
    starter: "function fib(n) {\n  // your code\n}\n",
    tests: [[[0], 0], [[1], 1], [[10], 55], [[30], 832040], [[40], 102334155]],
    hints: [
      "Plain recursion me same subproblems baar baar solve hote hain. Kya store kar sakte ho?",
      "Memoization ya bottom-up DP. Bottom-up me sirf last do values chahiye.",
      "Loop se prev, curr maintain karo; O(n) time, O(1) space."
    ]
  }
];
