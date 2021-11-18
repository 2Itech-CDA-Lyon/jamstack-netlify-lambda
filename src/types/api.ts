export type Id = string;

interface FaunaRef {
  '@ref': {
    id: Id;
    collection?: FaunaRef;
  }
}

export interface FaunaEntity<T> {
  ref: FaunaRef;
  ts: number;
  data: T;
}

export type Todo = FaunaEntity<{
  text: string;
  done: boolean;
}>;

export interface TodoInput {
  text: string;
  done: boolean;
}
