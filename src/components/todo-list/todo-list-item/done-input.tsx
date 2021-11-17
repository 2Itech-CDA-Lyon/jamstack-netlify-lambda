import { ChangeEventHandler, FC } from "react";
import { Form } from "react-bootstrap";
import { Todo } from "../../../types/api";
import { useTodoListContext } from "../context";

interface DoneInputProps {
  todo: Todo;
}

const DoneInput: FC<DoneInputProps> = ({ todo }) => {
  const { actions } = useTodoListContext();

  const handleCheck: ChangeEventHandler<HTMLInputElement> = (event) => {
    actions.update(todo.ref['@ref'].id, { done: event.target.checked });
  }

  return (
    <Form.Check
      type="checkbox"
      checked={todo.data.done}
      onChange={handleCheck}
    />
  );
}

export default DoneInput;
