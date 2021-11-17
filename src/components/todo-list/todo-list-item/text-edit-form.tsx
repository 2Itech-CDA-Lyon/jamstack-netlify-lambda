import { useState, FormEventHandler, FC, useRef, useLayoutEffect, KeyboardEventHandler } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { FaCheck, FaPenAlt, FaTimes } from "react-icons/fa";
import RequestState from "../../../utils/request-state";
import { useTodoListContext } from "../context";
import { Todo } from '../../../types/api';

interface TextEditFormProps {
  todo: Todo;
}

const TextEditForm: FC<TextEditFormProps> = ({ todo }) => {
  const { actions } = useTodoListContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(todo.data.text);
  const [requestState, setRequestState] = useState(RequestState.Idle);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setRequestState(RequestState.Pending);
    await actions.update(todo.ref['@ref'].id, { text: inputText });
    setRequestState(RequestState.Success);
    setIsEditing(false);
  }

  const handleKeyPress: KeyboardEventHandler = (event) => {
    if (event.key === 'Escape') {
      setIsEditing(false);
    }
  }

  useLayoutEffect(
    () => {
      if (isEditing) {
        if (inputRef.current !== null) {
          inputRef.current.focus();
        }
      }
    },
    [isEditing]
  );

  if (isEditing) {
    return (
      <Form
        className="d-flex flex-grow-1"
        onSubmit={handleSubmit}
      >
        <Form.Control
          type="text"
          size="sm"
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={handleKeyPress}
          ref={inputRef}
        />
        <Button
          variant="light"
          size="sm"
          onClick={() => setIsEditing(false)}
        >
          <FaTimes />
        </Button>
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
    );
  }

  return (
    <div className="flex-grow-1">
      {todo.data.text}
      {' '}
      <Button
        variant="light"
        size="sm"
        onClick={() => setIsEditing(true)}
      >
        <FaPenAlt />
      </Button>
    </div>
  )
}

export default TextEditForm;
