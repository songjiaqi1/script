class Output {
  constructor(callback) {
    this.actions = [];
    this.callback = callback;
  }
  
  text(text) {
    // const newActions = [...this.actions, {type: 'text', value: text}];
    // this.actions = newActions;
    this.callback({type: 'text', value: text});
  }

  markdown(value) {
    // this.actions = [...this.actions, { type: 'markdown', value }];
    this.callback({ type: 'markdown', value });
  }

  error(error) {
    // this.actions = [...this.actions, { type: 'error', value: 'error: ' + error.message }];
    this.callback({ type: 'error', value: 'error: ' + error.message });
  }

  clear = () => {
    this.actions = [];
  }
}

export default Output;