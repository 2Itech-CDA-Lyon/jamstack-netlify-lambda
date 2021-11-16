import { ChangeEventHandler, FC, FormEventHandler, useState } from "react";
import { ListGroup, Form, Button, Spinner } from "react-bootstrap";
import { FaCheck, FaPenAlt, FaTrashAlt } from "react-icons/fa";
import { Id, Todo, TodoInput } from "../../types/api";
import RequestState from "../../utils/request-state";

interface TodoListItemProps {
  todo: Todo;
  update: (id: Id, input: Partial<TodoInput>) => void;
  remove: (id: Id) => void;
}

const TodoListItem: FC<TodoListItemProps> = ({ todo, update, remove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(todo.text);
  const [requestState, setRequestState] = useState(RequestState.Idle);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setRequestState(RequestState.Pending);
    await update(todo.id, { text: inputText });
    setRequestState(RequestState.Success);
    setIsEditing(false);
  }

  const handleCheck: ChangeEventHandler<HTMLInputElement> = (event) => {
    update(todo.id, { done: event.target.checked });
  }

  return (
    <ListGroup.Item className="d-flex justify-content-between gap-3">
      <Form.Check
        type="checkbox"
        checked={todo.done}
        onChange={handleCheck}
      />
      {
        isEditing ? (
          <Form
            className="d-flex flex-grow-1"
            onSubmit={handleSubmit}
          >
            <Form.Control
              type="text"
              size="sm"
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
            />
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={requestState === RequestState.Pending || inputText.length === 0}
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
                  <FaCheck />
                )
              }
            </Button>
          </Form>
        ) : (
          <div className="flex-grow-1">
            {todo.text}
            {' '}
            <Button
              variant="light"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <FaPenAlt />
            </Button>
          </div>
        )
      }
      <Button
        variant="danger"
        size="sm"
        onClick={() => remove(todo.id)}
      >
        <FaTrashAlt />
      </Button>
    </ListGroup.Item>
  )
}

export default TodoListItem;
