import React from 'react';
import processor from '../parse-markdown';
import styles from '../css/plugin-layout.module.css';

class Output extends React.Component {

  parseMarkdown(markdwonContent){
    const value = processor.processSync(markdwonContent);
    return String(value);
  }

  renderContent = () => {
    const actions = this.props.actions;
    const children = actions.map((action, index) => {
      const type = action.type;
      if (type === 'text') {
        return <div key={"content- " + index}>{action.value}</div>
      } else if (type === 'markdown') {
        const html = this.parseMarkdown(action.value);
        return <div key={"content- " + index} className="article" dangerouslySetInnerHTML={{ __html: html }}></div>
      } else if (type === 'error') {
        return <div key={"content- " + index} className={styles['error']}>{action.value}</div>
      } else if (type === 'input_text_async') {
        return <div key={"content- " + index} ><input type="text"/><button onClick={() => window.input.interrupt.next({type: 'text_content', value: '111111'})}>提交</button></div>
      }
    });
    return children;
  }

  render() {
    return (
      <div className={styles['script-plugin-result']}>
        {this.renderContent()}
      </div>
    )
  }
}

export default Output;