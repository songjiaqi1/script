import React, { Fragment } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Button } from 'reactstrap';
import intl from 'react-intl-universal';

class AddScriptDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      scriptName: ''
    }
  }

  handleSubmit = () => {
    let { scriptName } = this.state;
    scriptName = scriptName.trim();
    if (!scriptName) {
      this.setState({errMessage: intl.get('Name_is_required')});
      return;
    }

    const scripts = this.props.scriptSettings.scripts;

    if (scripts.findIndex((script) => scriptName === script.name) > -1) {
      this.setState({
        errMessage: intl.get('This_name_is_already_taken')
      });
      return;
    }

    this.props.addNewScript(scriptName);
  }

  handleChange = (event) => {
    event.stopPropagation();
    let value = event.target.value;
    if (value === this.state.scriptName) {
      return;
    }
    this.setState({scriptName: value});
  }

  toggle = (e) => {
    this.props.toggleAddNewScriptDialog();
  }

  render() {
    return (
      <Modal isOpen={true} toggle={this.toggle} autoFocus={false}>
        <ModalHeader toggle={this.toggle}>{intl.get('Add_script')}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="tableName">{intl.get('Name')}</Label>
              <Input id="tableName" autoFocus={true} value={this.state.scriptName} innerRef={input => { this.newInput = input; }} onChange={this.handleChange} onScroll={this.onScroll} />
            </FormGroup>
          </Form>
          {this.state.errMessage && <Alert color="danger" className="mt-2">{this.state.errMessage}</Alert>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggle}>{intl.get('Cancel')}</Button>
          <Button color="primary" onClick={this.handleSubmit}>{intl.get('Submit')}</Button>
        </ModalFooter>
      </Modal>
    )
  }
}

export default AddScriptDialog;