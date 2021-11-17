import { FC } from "react";
import { Container, ListGroup } from "react-bootstrap";
import { AddTodoForm, TodoListItem } from "../components/todo-list";
import { TodoListContextProvider, useTodoListContext } from "../components/todo-list/context";

const TodoListPage: FC = () => {
  return (
    <TodoListContextProvider>
      <TodoListPageContent />
    </TodoListContextProvider>
  )
}

const TodoListPageContent: FC = () => {
  const { todos, isValidating } = useTodoListContext();

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
                key={todo.ref['@ref'].id}
                todo={todo}
              />
            )
          )
        }
      </ListGroup>

      <AddTodoForm />
    </Container>
  )
}

export default TodoListPage;
