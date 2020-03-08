import * as React from 'react';
import { FormControl, Form, Modal, Button } from 'rsuite';

interface IState {
  note: string;
}

interface IProps {
  note: string;
  onClose: () => void;
  onNoteSave: (note: string) => void;
}

export default class NoteModal extends React.Component<IProps, IState> {
  state: IState = {
    note: this.props.note,
  };

  handleNoteChange = (note: string) => {
    this.setState({
      note,
    });
  };

  updateNote = () => {
    this.props.onNoteSave(this.state.note);
  };

  render() {
    return (
      <Modal size="sm" show={true} onHide={this.props.onClose}>
        <Modal.Header>
          <Modal.Title>Edit Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <FormControl
              componentClass="textarea"
              rows={3}
              value={this.state.note}
              onChange={this.handleNoteChange}
              style={{ width: '100%' }}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.updateNote} appearance="primary">
            Ok
          </Button>
          <Button onClick={this.props.onClose} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
