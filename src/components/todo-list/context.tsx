import { createContext, FC, useContext } from "react";
import useSWR from "swr";
import { Id, Todo, TodoInput } from "../../types/api";
import lambdaFetcher from "../../utils/lambdaFetcher";

interface TodoListContextValue {
  todos: Todo[];
  isValidating: boolean;
  actions: {
    create: (input: TodoInput) => Promise<void>;
    update: (id: Id, input: Partial<TodoInput>) => Promise<void>;
    remove: (id: Id) => Promise<void>;
  }
}

const TodoListContext = createContext<TodoListContextValue | undefined>(undefined);

export const useTodoListContext = () => {
  const context = useContext(TodoListContext);
  if (typeof context === 'undefined') {
    throw new Error('Context should not be undefined. Did you forget to wrap your components inside a TodoListContextProvider?');
  }
  return context;
}

export const TodoListContextProvider: FC = ({ children }) => {
  const { data, mutate, isValidating } = useSWR<Todo[], Error>('/todos', lambdaFetcher);
  const todos = data || [];

  const create = async(input: TodoInput) => {
    const newTodo: Todo = await fetch(`/.netlify/functions/todos`, {
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json());

    await mutate([ ...todos, newTodo ]);
  }

  const update = async (id: Id, input: Partial<TodoInput>) => {
    const updatedTodo = await fetch(`/.netlify/functions/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json());
    
    await mutate(
      todos.map(todo => todo.ref['@ref'].id === id ? updatedTodo : todo)
    );
  }

  const remove = async (id: Id) => {
    await fetch(`/.netlify/functions/todos/${id}`, {
      method: 'DELETE',
    });

    await mutate(
      todos.filter(todo => todo.ref['@ref'].id !== id)
    );
  }

  const value = {
    todos,
    isValidating,
    actions: {
      create,
      update,
      remove,
    }
  }

  return (
    <TodoListContext.Provider value={value}>
      {children}
    </TodoListContext.Provider>
  );
}
