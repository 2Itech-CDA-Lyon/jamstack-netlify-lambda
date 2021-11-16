import { FC, FormEventHandler, useState } from "react";
import { ListGroup, Form, Button } from "react-bootstrap";
import { FaCheck, FaPenAlt, FaTrashAlt } from "react-icons/fa";
import { Todo } from "../../types/api";

interface TodoListItemProps {
  todo: Todo;
}

const TodoListItem: FC<TodoListItemProps> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(todo.text);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setIsEditing(false);
  }

  return (
    <ListGroup.Item key={todo.id} className="d-flex justify-content-between gap-3">
      <Form.Check type="checkbox" value={todo.done ? 1 : 0} />
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
            >
              <FaCheck />
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
      >
        <FaTrashAlt />
      </Button>
    </ListGroup.Item>
  )
}

export default TodoListItem;
