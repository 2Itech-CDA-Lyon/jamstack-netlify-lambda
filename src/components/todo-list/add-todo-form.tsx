import { FC, FormEventHandler, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import RequestState from "../../utils/request-state";
import { useTodoListContext } from "./context";

const AddTodoForm: FC = () => {
  const { actions } = useTodoListContext();

  const [text, setText] = useState('');
  const [requestState, setRequestState] = useState(RequestState.Idle);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();

    setRequestState(RequestState.Pending);
    await actions.create({
      text,
      done: false
    });
    setRequestState(RequestState.Success);

    setText('');
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Control
        type="text"
        placeholder="Entrez une nouvelle tâche"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button
        variant="primary"
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
  )
}

export default AddTodoForm;
