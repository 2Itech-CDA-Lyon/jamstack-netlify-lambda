import { FC } from "react";
import { ListGroup } from "react-bootstrap";
import { Todo } from "../../../types/api";
import DeleteButton from "./delete-button";
import DoneInput from "./done-input";
import TextEditForm from "./text-edit-form";

interface TodoListItemProps {
  todo: Todo;
}

const TodoListItem: FC<TodoListItemProps> = ({ todo }) => {
  return (
    <ListGroup.Item className="d-flex justify-content-between gap-3">
      <DoneInput todo={todo} />
      <TextEditForm todo={todo} />
      <DeleteButton todo={todo} />
    </ListGroup.Item>
  )
}

export default TodoListItem;
