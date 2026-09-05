export interface Step<S = unknown> {
  state: S;
  line: number; // highlighted code line (0-based)
  note: string; // human explanation
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface AlgorithmMeta {
  id: string;
  number: number;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  tagline: string;
  color: string; // accent
  code: string[];
}

export interface Algorithm<S = unknown> extends AlgorithmMeta {
  generate: () => Step<S>[];
}
