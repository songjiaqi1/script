


class Input {
  constructor(callback) {
    this.callback = callback;
    this.interrupt = null;
  }
  
  inputTextAsync() {
    this.callback({type: 'input_text_async'});
    return new Promise((resolve, reject) => {
      const generator = function*() {
        const content = yield;
        console.log(content);
        resolve(content.value);
      }
      this.interrupt = generator();
      this.interrupt.next();
    });
  }

  // markdown(value) {
  //   this.callback({ type: 'markdown', value });
  // }

  // error(error) {
  //   this.actions = [...this.actions, { type: 'error', value: 'error: ' + error.message }];
  //   this.callback( { type: 'error', value: 'error: ' + error.message });
  // }

  // clear = () => {
  //   this.actions = [];
  // }
}

export default Input;