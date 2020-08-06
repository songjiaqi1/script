import React from 'react';
import styles from '../css/plugin-layout.module.css';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('prismjs/themes/prism.css');
require('../css/editor.css');

class CodeMirror extends React.Component {

  state = {
    isFocused: false
  }

  getCodeMirrorInstance () {
    return this.props.codeMirrorInstance || require('codemirror');
  }

  componentDidMount () {
    const codeMirrorInstance = this.getCodeMirrorInstance();
    this.codeMirror = codeMirrorInstance.fromTextArea(this.textareaNode, this.options = {
      lineNumbers: true,
      mode: 'javascript',
    });
    this.codeMirror.on('change', this.codemirrorValueChanged);
    this.codeMirror.on('focus', this.focusChanged.bind(this, true));
    this.codeMirror.on('blur', this.focusChanged.bind(this, false));
  }

  componentWillUnmount () {
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.initialValue);
    this.codeMirror.setValue(nextProps.initialValue);
  }

  focus = () => {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  }

  focusChanged = (focused) => {
    this.setState({
      isFocused: focused,
    });
  }

  cursorActivity = (cm) => {
    this.props.onCursorActivity && this.props.onCursorActivity(cm);
  }

  codemirrorValueChanged = (doc, change) => {
    this.props.onChange(doc.getValue());
  }

  render () {

    const editorClassName = styles['editor'];
    return (
      <div className={editorClassName}>
        <textarea
          ref={ref => this.textareaNode = ref}
          name={this.props.name || this.props.path}
          defaultValue={this.props.initialValue}
          autoComplete="off"
          autoFocus={this.props.autoFocus}
        />
      </div>
    );
  }

}


export default CodeMirror;