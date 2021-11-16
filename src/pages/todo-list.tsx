import { FC, FormEventHandler, useState } from "react";
import { Button, Container, Form, ListGroup, Spinner } from "react-bootstrap";
import useSWR from "swr";
import { Id, Todo, TodoInput } from "../types/api";
import lambdaFetcher from "../utils/lambdaFetcher";
import { TodoListItem } from "../components/todo-list";
import { FaPlus } from 'react-icons/fa';
import RequestState from "../utils/request-state";

const TodoListPage: FC = () => {
  const { data, mutate, isValidating } = useSWR<Todo[], Error>('/todos', lambdaFetcher);
  const todos = data || [];

  const [text, setText] = useState('');
  const [requestState, setRequestState] = useState(RequestState.Idle);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();

    setRequestState(RequestState.Pending);
    const newTodo: Todo = await fetch(`/.netlify/functions/todos`, {
      method: 'POST',
      body: JSON.stringify({
        text,
        done: false
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json());
    setRequestState(RequestState.Success);

    setText('');

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
    
    mutate(
      todos.map(todo => todo.id === id ? updatedTodo : todo)
    );
  }

  const remove = async (id: Id) => {
    await fetch(`/.netlify/functions/todos/${id}`, {
      method: 'DELETE',
    });

    mutate(
      todos.filter(todo => todo.id !== id)
    );
  }

  if (todos.length === 0 && isValidating) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <h1 className="mt-4 mb-4">Todo list</h1>
      <ListGroup className="mb-2">
        {
          todos.map(
            todo => (
              <TodoListItem
                key={todo.id}
                todo={todo}
                update={update}
                remove={remove}
              />
            )
          )
        }
      </ListGroup>

      <Form onSubmit={handleSubmit}>
        <Form.Control
          type="text"
          placeholder="Entrez une nouvelle tâche"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <Button
          type="submit"
          disabled={requestState === RequestState.Pending || text.length === 0}
        >
          {
            requestState === RequestState.Pending ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <FaPlus />
            )
          }
          {' '}Ajouter
        </Button>
      </Form>
    </Container>
  )
}

export default TodoListPage;
