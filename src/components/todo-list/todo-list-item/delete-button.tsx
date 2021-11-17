import { FC, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import { Todo } from "../../../types/api";
import RequestState from "../../../utils/request-state";
import { useTodoListContext } from "../context";

interface DeleteButtonProps {
  todo: Todo;
}

const DeleteButton: FC<DeleteButtonProps> = ({ todo }) => {
  const { actions } = useTodoListContext();
  const [requestState, setRequestState] = useState(RequestState.Idle);

  const handleClick = async () => {
    setRequestState(RequestState.Pending);
    await actions.remove(todo.ref['@ref'].id);
    setRequestState(RequestState.Success);
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={handleClick}
      disabled={requestState === RequestState.Pending}
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
          <FaTrashAlt />
        )
      }
    </Button>
  )
}

export default DeleteButton;
