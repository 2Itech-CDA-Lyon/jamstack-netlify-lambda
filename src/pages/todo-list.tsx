import { FC, FormEventHandler, useState } from "react";
import { Button, Container, Form, ListGroup } from "react-bootstrap";
import useSWR from "swr";
import { Todo } from "../types/api";
import lambdaFetcher from "../utils/lambdaFetcher";
import { TodoListItem } from "../components/todo-list";
import { FaPlus } from 'react-icons/fa';

const TodoListPage: FC = () => {
  const { data } = useSWR<Todo[], Error>('/todos', lambdaFetcher);

  const [text, setText] = useState('');

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    setText('');
  }

  if (typeof data === 'undefined') {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <h1 className="mt-4 mb-4">Todo list</h1>
      <ListGroup className="mb-2">
        {
          data.map(
            todo => (
              <TodoListItem todo={todo} />
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
        <Button type="submit">
          <FaPlus /> Ajouter
        </Button>
      </Form>
    </Container>
  )
}

export default TodoListPage;
