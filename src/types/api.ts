export type Id = string;

interface FaunaRef {
  '@ref': {
    id: Id;
    collection?: FaunaRef;
  }
}

export interface Entity {
  ref: FaunaRef;
  ts: number;
}

export interface Todo extends Entity {
  data: {
    text: string;
    done: boolean;
  }
}

export interface TodoInput {
  text: string;
  done: boolean;
}
