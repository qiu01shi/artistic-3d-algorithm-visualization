import type { Algorithm, Step } from './types';

/* ------------------------------------------------------------------ */
/* 1. Two Sum                                                          */
/* ------------------------------------------------------------------ */
export interface TwoSumState {
  nums: number[];
  target: number;
  i: number | null;
  need: number | null;
  seen: { val: number; idx: number }[];
  hit: number | null; // index found in map
  found: [number, number] | null;
}

export const twoSum: Algorithm<TwoSumState> = {
  id: 'two-sum',
  number: 1,
  title: 'Two Sum',
  difficulty: 'Easy',
  tags: ['Hash Map', 'Array'],
  tagline: 'Remember what you have seen, and the answer finds you.',
  color: '#f9a8d4',
  code: [
    'def twoSum(nums, target):',
    '    seen = {}',
    '    for i, x in enumerate(nums):',
    '        need = target - x',
    '        if need in seen:',
    '            return [seen[need], i]',
    '        seen[x] = i',
  ],
  generate() {
    const nums = [3, 8, 11, 2, 15, 7];
    const target = 9;
    const steps: Step<TwoSumState>[] = [];
    const seen: { val: number; idx: number }[] = [];
    const base = (): TwoSumState => ({
      nums,
      target,
      i: null,
      need: null,
      seen: [...seen],
      hit: null,
      found: null,
    });
    steps.push({ state: base(), line: 1, note: `We hunt for two numbers summing to ${target}. Start with an empty memory (hash map).` });
    for (let i = 0; i < nums.length; i++) {
      const x = nums[i];
      const need = target - x;
      steps.push({ state: { ...base(), i, need: null }, line: 2, note: `Visit index ${i}, value ${x}.` });
      steps.push({ state: { ...base(), i, need }, line: 3, note: `We need a partner of ${target} − ${x} = ${need}.` });
      const hit = seen.find((s) => s.val === need);
      if (hit) {
        steps.push({ state: { ...base(), i, need, hit: hit.idx }, line: 4, note: `${need} lives in memory at index ${hit.idx}! A match.` });
        steps.push({ state: { ...base(), i, need, hit: hit.idx, found: [hit.idx, i] }, line: 5, note: `Return [${hit.idx}, ${i}] — ${hit.val} + ${x} = ${target}. ✨` });
        return steps;
      }
      steps.push({ state: { ...base(), i, need }, line: 4, note: `${need} is not in memory yet.` });
      seen.push({ val: x, idx: i });
      steps.push({ state: { ...base(), i, need }, line: 6, note: `Remember ${x} → index ${i}.` });
    }
    return steps;
  },
};

/* ------------------------------------------------------------------ */
/* 2. Binary Search                                                    */
/* ------------------------------------------------------------------ */
export interface BinarySearchState {
  nums: number[];
  target: number;
  lo: number;
  hi: number;
  mid: number | null;
  found: number | null;
  dead: boolean[];
}

export const binarySearch: Algorithm<BinarySearchState> = {
  id: 'binary-search',
  number: 704,
  title: 'Binary Search',
  difficulty: 'Easy',
  tags: ['Divide & Conquer', 'Array'],
  tagline: 'Halve the world until only truth remains.',
  color: '#67e8f9',
  code: [
    'def search(nums, target):',
    '    lo, hi = 0, len(nums) - 1',
    '    while lo <= hi:',
    '        mid = (lo + hi) // 2',
    '        if nums[mid] == target:',
    '            return mid',
    '        elif nums[mid] < target:',
    '            lo = mid + 1',
    '        else:',
    '            hi = mid - 1',
    '    return -1',
  ],
  generate() {
    const nums = [1, 3, 4, 7, 9, 12, 15, 18, 21, 25, 28, 33, 37];
    const target = 21;
    const steps: Step<BinarySearchState>[] = [];
    let lo = 0;
    let hi = nums.length - 1;
    const dead = nums.map(() => false);
    const snap = (mid: number | null, found: number | null = null): BinarySearchState => ({
      nums,
      target,
      lo,
      hi,
      mid,
      found,
      dead: [...dead],
    });
    steps.push({ state: snap(null), line: 1, note: `Sorted array. Searching for ${target}. lo = 0, hi = ${hi}.` });
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      steps.push({ state: snap(mid), line: 3, note: `mid = (${lo} + ${hi}) // 2 = ${mid}. nums[mid] = ${nums[mid]}.` });
      if (nums[mid] === target) {
        steps.push({ state: snap(mid, mid), line: 5, note: `nums[${mid}] == ${target}. Found it! ✨` });
        return steps;
      } else if (nums[mid] < target) {
        for (let k = lo; k <= mid; k++) dead[k] = true;
        lo = mid + 1;
        steps.push({ state: snap(mid), line: 7, note: `${nums[mid]} < ${target}, so the answer lies to the right. lo = ${lo}.` });
      } else {
        for (let k = mid; k <= hi; k++) dead[k] = true;
        hi = mid - 1;
        steps.push({ state: snap(mid), line: 9, note: `${nums[mid]} > ${target}, so the answer lies to the left. hi = ${hi}.` });
      }
    }
    steps.push({ state: snap(null), line: 10, note: 'Not found.' });
    return steps;
  },
};

/* ------------------------------------------------------------------ */
/* 3. Valid Parentheses                                                */
/* ------------------------------------------------------------------ */
export interface ParenState {
  s: string;
  i: number | null;
  stack: string[];
  action: 'push' | 'pop' | 'mismatch' | 'done' | null;
  result: boolean | null;
}

export const validParens: Algorithm<ParenState> = {
  id: 'valid-parentheses',
  number: 20,
  title: 'Valid Parentheses',
  difficulty: 'Easy',
  tags: ['Stack', 'String'],
  tagline: 'Last opened, first closed — a tower of promises.',
  color: '#fde68a',
  code: [
    'def isValid(s):',
    '    stack = []',
    '    pairs = {")": "(", "]": "[", "}": "{"}',
    '    for ch in s:',
    '        if ch in "([{":',
    '            stack.append(ch)',
    '        elif not stack or stack.pop() != pairs[ch]:',
    '            return False',
    '    return not stack',
  ],
  generate() {
    const s = '{[()()]}[]';
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    const stack: string[] = [];
    const steps: Step<ParenState>[] = [];
    const snap = (i: number | null, action: ParenState['action'], result: boolean | null = null): ParenState => ({
      s,
      i,
      stack: [...stack],
      action,
      result,
    });
    steps.push({ state: snap(null, null), line: 1, note: `Validate "${s}". Begin with an empty stack.` });
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      steps.push({ state: snap(i, null), line: 3, note: `Read '${ch}'.` });
      if ('([{'.includes(ch)) {
        stack.push(ch);
        steps.push({ state: snap(i, 'push'), line: 5, note: `'${ch}' opens a promise — push it onto the tower.` });
      } else {
        const top = stack.pop();
        if (top !== pairs[ch]) {
          steps.push({ state: snap(i, 'mismatch', false), line: 7, note: `'${ch}' does not close '${top ?? 'nothing'}'. Invalid.` });
          return steps;
        }
        steps.push({ state: snap(i, 'pop'), line: 6, note: `'${ch}' closes '${top}' — pop it. Promise kept.` });
      }
    }
    steps.push({ state: snap(null, 'done', stack.length === 0), line: 8, note: stack.length === 0 ? 'The tower is empty: every bracket was matched. Valid! ✨' : 'Unclosed brackets remain. Invalid.' });
    return steps;
  },
};

/* ------------------------------------------------------------------ */
/* 4. Reverse Linked List                                              */
/* ------------------------------------------------------------------ */
export interface LinkedState {
  vals: number[];
  next: (number | null)[]; // index -> index
  prev: number | null;
  curr: number | null;
  nxt: number | null;
  head: number | null;
  done: boolean;
}

export const reverseList: Algorithm<LinkedState> = {
  id: 'reverse-linked-list',
  number: 206,
  title: 'Reverse Linked List',
  difficulty: 'Easy',
  tags: ['Linked List', 'Pointers'],
  tagline: 'Turn every arrow around, one at a time.',
  color: '#c4b5fd',
  code: [
    'def reverseList(head):',
    '    prev, curr = None, head',
    '    while curr:',
    '        nxt = curr.next',
    '        curr.next = prev',
    '        prev = curr',
    '        curr = nxt',
    '    return prev',
  ],
  generate() {
    const vals = [1, 2, 3, 4, 5];
    const next: (number | null)[] = vals.map((_, i) => (i + 1 < vals.length ? i + 1 : null));
    let prev: number | null = null;
    let curr: number | null = 0;
    let nxt: number | null = null;
    const steps: Step<LinkedState>[] = [];
    const snap = (done = false): LinkedState => ({ vals, next: [...next], prev, curr, nxt, head: 0, done });
    steps.push({ state: snap(), line: 1, note: 'prev = None, curr = head. We will flip each arrow to point backwards.' });
    while (curr !== null) {
      nxt = next[curr];
      steps.push({ state: snap(), line: 3, note: `Save nxt = node ${nxt === null ? 'None' : vals[nxt]} so we do not lose the rest of the list.` });
      next[curr] = prev;
      steps.push({ state: snap(), line: 4, note: `Flip: node ${vals[curr]} now points to ${prev === null ? 'None' : 'node ' + vals[prev]}.` });
      prev = curr;
      steps.push({ state: snap(), line: 5, note: `prev advances to node ${vals[prev]}.` });
      curr = nxt;
      steps.push({ state: snap(), line: 6, note: curr === null ? 'curr becomes None — the list is exhausted.' : `curr advances to node ${vals[curr]}.` });
    }
    steps.push({ state: { ...snap(true), head: prev }, line: 7, note: `Return prev — node ${vals[prev!]} is the new head. Every arrow reversed. ✨` });
    return steps;
  },
};

/* ------------------------------------------------------------------ */
/* 5. Number of Islands                                                */
/* ------------------------------------------------------------------ */
export interface IslandState {
  grid: number[][];
  owner: number[][]; // 0 = unvisited, else island id
  current: [number, number] | null;
  frontier: [number, number][];
  count: number;
  scan: [number, number] | null;
}

export const numIslands: Algorithm<IslandState> = {
  id: 'number-of-islands',
  number: 200,
  title: 'Number of Islands',
  difficulty: 'Medium',
  tags: ['BFS', 'Grid', 'Graph'],
  tagline: 'Flood the land; each new shore is a world of its own.',
  color: '#6ee7b7',
  code: [
    'def numIslands(grid):',
    '    count = 0',
    '    for r, c in all_cells(grid):',
    '        if grid[r][c] == "1" and not seen[r][c]:',
    '            count += 1',
    '            queue = deque([(r, c)])',
    '            while queue:',
    '                y, x = queue.popleft()',
    '                for ny, nx in neighbors(y, x):',
    '                    if land(ny, nx) and not seen[ny][nx]:',
    '                        seen[ny][nx] = True',
    '                        queue.append((ny, nx))',
    '    return count',
  ],
  generate() {
    const grid = [
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 1, 0, 0, 1, 0],
    ];
    const R = grid.length;
    const C = grid[0].length;
    const owner = grid.map((row) => row.map(() => 0));
    let count = 0;
    const steps: Step<IslandState>[] = [];
    const snap = (current: [number, number] | null, frontier: [number, number][], scan: [number, number] | null): IslandState => ({
      grid,
      owner: owner.map((r) => [...r]),
      current,
      frontier: frontier.map((f) => [...f] as [number, number]),
      count,
      scan,
    });
    steps.push({ state: snap(null, [], null), line: 1, note: 'A sea with scattered land. We scan every cell; whenever we touch unclaimed land, a new island is born.' });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        if (grid[r][c] === 1 && owner[r][c] === 0) {
          count++;
          owner[r][c] = count;
          const queue: [number, number][] = [[r, c]];
          steps.push({ state: snap([r, c], queue, [r, c]), line: 4, note: `Unclaimed land at (${r}, ${c}) — island #${count} discovered! Begin a flood (BFS).` });
          while (queue.length) {
            const [y, x] = queue.shift()!;
            const added: [number, number][] = [];
            for (const [dy, dx] of [
              [1, 0],
              [-1, 0],
              [0, 1],
              [0, -1],
            ]) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < R && nx >= 0 && nx < C && grid[ny][nx] === 1 && owner[ny][nx] === 0) {
                owner[ny][nx] = count;
                queue.push([ny, nx]);
                added.push([ny, nx]);
              }
            }
            steps.push({
              state: snap([y, x], [...queue], null),
              line: added.length ? 10 : 7,
              note: added.length
                ? `From (${y}, ${x}) the flood reaches ${added.map(([a, b]) => `(${a}, ${b})`).join(', ')}.`
                : `(${y}, ${x}) has no new land neighbours.`,
            });
          }
          steps.push({ state: snap(null, [], null), line: 6, note: `Island #${count} fully claimed. Continue scanning.` });
        }
      }
    }
    steps.push({ state: snap(null, [], null), line: 12, note: `Every cell scanned. Total islands: ${count}. ✨` });
    return steps;
  },
};

/* ------------------------------------------------------------------ */
/* 6. Binary Tree Level Order Traversal                                */
/* ------------------------------------------------------------------ */
export interface TreeNode {
  id: number;
  val: number;
  left: number | null;
  right: number | null;
  depth: number;
  x: number; // layout x
}
export interface TreeState {
  nodes: TreeNode[];
  queue: number[];
  visited: number[];
  current: number | null;
  levels: number[][];
  activeLevel: number | null;
}

export const levelOrder: Algorithm<TreeState> = {
  id: 'level-order',
  number: 102,
  title: 'Binary Tree Level Order',
  difficulty: 'Medium',
  tags: ['BFS', 'Tree', 'Queue'],
  tagline: 'Descend the canopy one ring of light at a time.',
  color: '#fdba74',
  code: [
    'def levelOrder(root):',
    '    res, queue = [], deque([root])',
    '    while queue:',
    '        level = []',
    '        for _ in range(len(queue)):',
    '            node = queue.popleft()',
    '            level.append(node.val)',
    '            if node.left:  queue.append(node.left)',
    '            if node.right: queue.append(node.right)',
    '        res.append(level)',
    '    return res',
  ],
  generate() {
    // ids as indices
    const raw: [number, number | null, number | null][] = [
      [1, 1, 2], // 0
      [2, 3, 4], // 1
      [3, 5, 6], // 2
      [4, null, null], // 3
      [5, 7, null], // 4
      [6, null, 8], // 5
      [7, null, null], // 6
      [8, null, null], // 7
      [9, null, null], // 8
    ];
    const nodes: TreeNode[] = raw.map(([val, left, right], id) => ({ id, val, left, right, depth: 0, x: 0 }));
    // layout
    const assign = (id: number, depth: number, xmin: number, xmax: number) => {
      const n = nodes[id];
      n.depth = depth;
      n.x = (xmin + xmax) / 2;
      if (n.left !== null) assign(n.left, depth + 1, xmin, n.x);
      if (n.right !== null) assign(n.right, depth + 1, n.x, xmax);
    };
    assign(0, 0, -6, 6);

    const steps: Step<TreeState>[] = [];
    const queue: number[] = [0];
    const visited: number[] = [];
    const levels: number[][] = [];
    const snap = (current: number | null, activeLevel: number | null): TreeState => ({
      nodes,
      queue: [...queue],
      visited: [...visited],
      current,
      levels: levels.map((l) => [...l]),
      activeLevel,
    });
    steps.push({ state: snap(null, null), line: 1, note: 'Place the root in the queue. We will visit the tree ring by ring.' });
    let depth = 0;
    while (queue.length) {
      const size = queue.length;
      levels.push([]);
      steps.push({ state: snap(null, depth), line: 4, note: `Level ${depth} has ${size} node${size > 1 ? 's' : ''} waiting in the queue.` });
      for (let k = 0; k < size; k++) {
        const id = queue.shift()!;
        visited.push(id);
        levels[depth].push(nodes[id].val);
        const kids: string[] = [];
        if (nodes[id].left !== null) {
          queue.push(nodes[id].left!);
          kids.push(String(nodes[nodes[id].left!].val));
        }
        if (nodes[id].right !== null) {
          queue.push(nodes[id].right!);
          kids.push(String(nodes[nodes[id].right!].val));
        }
        steps.push({
          state: snap(id, depth),
          line: kids.length ? 7 : 6,
          note: `Visit node ${nodes[id].val}.${kids.length ? ` Enqueue children ${kids.join(' and ')}.` : ' It is a leaf.'}`,
        });
      }
      steps.push({ state: snap(null, depth), line: 9, note: `Level ${depth} complete: [${levels[depth].join(', ')}].` });
      depth++;
    }
    steps.push({ state: snap(null, null), line: 10, note: `All rings gathered: ${JSON.stringify(levels)} ✨` });
    return steps;
  },
};

/* ------------------------------------------------------------------ */
/* 7. Climbing Stairs                                                  */
/* ------------------------------------------------------------------ */
export interface StairsState {
  n: number;
  dp: (number | null)[];
  i: number | null;
  from: number[]; // indices being summed
}

export const climbStairs: Algorithm<StairsState> = {
  id: 'climbing-stairs',
  number: 70,
  title: 'Climbing Stairs',
  difficulty: 'Easy',
  tags: ['Dynamic Programming', 'Fibonacci'],
  tagline: 'Every step is the sum of the two that came before.',
  color: '#a5b4fc',
  code: [
    'def climbStairs(n):',
    '    dp = [0] * (n + 1)',
    '    dp[0], dp[1] = 1, 1',
    '    for i in range(2, n + 1):',
    '        dp[i] = dp[i - 1] + dp[i - 2]',
    '    return dp[n]',
  ],
  generate() {
    const n = 9;
    const dp: (number | null)[] = Array(n + 1).fill(null);
    const steps: Step<StairsState>[] = [];
    const snap = (i: number | null, from: number[] = []): StairsState => ({ n, dp: [...dp], i, from });
    steps.push({ state: snap(null), line: 1, note: `A staircase of ${n} steps. You may climb 1 or 2 at a time. How many distinct ways to reach the top?` });
    dp[0] = 1;
    dp[1] = 1;
    steps.push({ state: snap(null), line: 2, note: 'Base cases: 1 way to stand on the ground, 1 way to reach step 1.' });
    for (let i = 2; i <= n; i++) {
      steps.push({ state: snap(i, [i - 1, i - 2]), line: 3, note: `Step ${i} can be reached from step ${i - 1} (one hop) or step ${i - 2} (double hop).` });
      dp[i] = dp[i - 1]! + dp[i - 2]!;
      steps.push({ state: snap(i, [i - 1, i - 2]), line: 4, note: `dp[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.` });
    }
    steps.push({ state: snap(n), line: 5, note: `There are ${dp[n]} ways to climb ${n} stairs. ✨` });
    return steps;
  },
};

/* ------------------------------------------------------------------ */
/* 8. Bubble Sort (Sort an Array)                                      */
/* ------------------------------------------------------------------ */
export interface SortState {
  arr: number[];
  a: number | null;
  b: number | null;
  swapping: boolean;
  sortedFrom: number;
  done: boolean;
}

export const bubbleSort: Algorithm<SortState> = {
  id: 'bubble-sort',
  number: 912,
  title: 'Sort an Array',
  difficulty: 'Medium',
  tags: ['Sorting', 'Bubble Sort'],
  tagline: 'The heaviest rise last; the lightest float to the front.',
  color: '#fca5a5',
  code: [
    'def sortArray(nums):',
    '    n = len(nums)',
    '    for end in range(n - 1, 0, -1):',
    '        for j in range(end):',
    '            if nums[j] > nums[j + 1]:',
    '                nums[j], nums[j+1] = nums[j+1], nums[j]',
    '    return nums',
  ],
  generate() {
    const arr = [7, 3, 9, 1, 6, 4, 8, 2];
    const steps: Step<SortState>[] = [];
    let sortedFrom = arr.length;
    const snap = (a: number | null, b: number | null, swapping = false, done = false): SortState => ({
      arr: [...arr],
      a,
      b,
      swapping,
      sortedFrom,
      done,
    });
    steps.push({ state: snap(null, null), line: 1, note: 'An unsorted row of crystals. Adjacent pairs will be compared and swapped if out of order.' });
    for (let end = arr.length - 1; end > 0; end--) {
      for (let j = 0; j < end; j++) {
        steps.push({ state: snap(j, j + 1), line: 4, note: `Compare ${arr[j]} and ${arr[j + 1]}.` });
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({ state: snap(j, j + 1, true), line: 5, note: `${arr[j + 1]} > ${arr[j]} — swap them.` });
        }
      }
      sortedFrom = end;
      steps.push({ state: snap(null, null), line: 2, note: `${arr[end]} has bubbled into its final place.` });
    }
    sortedFrom = 0;
    steps.push({ state: snap(null, null, false, true), line: 6, note: 'The row is sorted. ✨' });
    return steps;
  },
};

export const ALGORITHMS: Algorithm<any>[] = [twoSum, binarySearch, validParens, reverseList, numIslands, levelOrder, climbStairs, bubbleSort];
