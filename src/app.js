import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import DTable from 'dtable-sdk';
import intl from 'react-intl-universal';
import Loading from './components/loading';
import OutputComponent from './components/output';
import Output from './utils';
import Input from './input';
import './locale/index.js'
import ScriptTabDropdownmenu from './components/drop-down';
import AddScriptDialog from './components/add-script-dialog';
import RenameScriptDialog from './components/rename-script-dialog';
import ModalPortal from './components/modal-portal';
import CodeMirror from './components/editor';

import styles from './css/plugin-layout.module.css';

const PLUGIN_NAME = 'script';

const propTypes = {
  showDialog: PropTypes.bool
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showDialog: true,
      actions: [],
      isRunning: false,
      scriptSettings: null,
      isShowAddScriptDialog: false,
      isShowRenameScriptDialog: false
    };
    this.scripts = {};
    this.dtable = new DTable();
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});
  } 

  componentWillUnmount() {
    this.unsubscribeLocalDtableChanged();
    this.unsubscribeRemoteDtableChanged();
  }

  async initPluginDTableData() {
    if (window.app === undefined) {
      // local develop
      window.app = {};
      await this.dtable.init(window.dtablePluginConfig);
      await this.dtable.syncWithServer();
      this.dtable.subscribe('dtable-connect', () => { this.onDTableConnect(); });
    } else {
      this.dtable.initInBrowser(window.app.dtableStore);
      this.onDTableConnect();
    }
    this.collaborators = this.dtable.getRelatedUsers();
    this.unsubscribeLocalDtableChanged = this.dtable.subscribe('local-dtable-changed', () => { this.onDTableChanged(); });
    this.unsubscribeRemoteDtableChanged = this.dtable.subscribe('remote-dtable-changed', () => { this.onDTableChanged(); });
    this.resetData();
  }

  onDTableConnect = () => {
    this.initDtableUtils();
    this.getScripts();
  }

  initPluginSettings = () => {

  }

  onDTableChanged = () => {
    this.resetData();
  }

  initDtableUtils = () => {
    const { 
      deleteRowById,
      getActiveTable,
      getRelatedUsers,
      getTables,
      getTableByName,
      getActiveView,
      getViews,
      getViewByName,
      getColumns,
      getShownColumns,
      getColumnByName,
      getColumnsByType,
      getRowById,
      appendRow,
      modifyRow,
      getViewRows,
      getRowCommentCount
    } = this.dtable;
    window.base = {
      deleteRowById: deleteRowById.bind(this.dtable),
      getActiveTable: getActiveTable.bind(this.dtable),
      getRelatedUsers: getRelatedUsers.bind(this.dtable),
      getTables: getTables.bind(this.dtable),
      getTableByName: getTableByName.bind(this.dtable),
      getActiveView: getActiveView.bind(this.dtable),
      getViews: getViews.bind(this.dtable),
      getViewByName: getViewByName.bind(this.dtable),
      getColumns: getColumns.bind(this.dtable),
      getShownColumns: getShownColumns.bind(this.dtable),
      getColumnByName: getColumnByName.bind(this.dtable),
      getColumnsByType: getColumnsByType.bind(this.dtable),
      getRowById: getRowById.bind(this.dtable),
      appendRow: appendRow.bind(this.dtable),
      modifyRow: modifyRow.bind(this.dtable),
      getViewRows: getViewRows.bind(this.dtable),
      getRowCommentCount: getRowCommentCount.bind(this.dtable),
    }
    window.output = new Output(this.setCallback);
    window.input = new Input(this.setCallback);
  }

  resetData = () => {
    
  }

  setCallback = (action) => {
    this.setState({
      actions: [...this.state.actions, action]
    });
  }

  onPluginToggle = () => {
    this.setState({
      showDialog: !this.state.showDialog
    });
    if (window.app) {
      window.app.onCloseOlugin();
    }
  }

  clearAction = () => {
    this.setState({
      actions: []
    })
  }

  getScripts = async () => {
    console.log('get script');
    const scriptSettings = this.dtable.getPluginSettings(PLUGIN_NAME) || {active: null ,scripts: []};    
    if (scriptSettings.scripts.length === 0) {
      console.log('init script settings');
      const scriptName = intl.get('New_script');
      scriptSettings.active = scriptName;
      const scriptUrl = await this.uploadFile(' ', scriptName + '.js');
      console.log('init script url', scriptUrl);
      scriptSettings.scripts.push({name: scriptName, url: scriptUrl});
      console.log('script settings after init', scriptSettings);
      this.dtable.updatePluginSettings(PLUGIN_NAME, scriptSettings);
      this.setState({
        scriptSettings: scriptSettings,
        isLoading: false
      });
      return;
    }
    
    const scripts = scriptSettings.scripts;

    const fileRequests = scripts.map((script) => {
      return new Promise((resolve, reject) => {
        // const previewerUrl =÷ script.url.replace('/asset', '/asset-preview');
        const previewerUrl = script.url + '.js';
        console.log(previewerUrl);
        fetch(previewerUrl).then(res => {
          return res.text();
        }).then((content) => {
          console.log(content);
          resolve({
            content,
            name: script.name
          })
        })
      });
    });

    Promise.all(fileRequests).then((res) => {
      res.forEach((script) => {
        this.scripts[script.name] = script.content;
      });

      this.setState({
        scriptSettings: scriptSettings,
        isLoading: false
      });
    });
  }

  runCode = async () => {
    const { scriptSettings } = this.state;
    const scriptName = scriptSettings.active;
    let value = this.scripts[scriptName];

    const isRunning = this.state.isRunning;

    if (isRunning) {
      window.input.interrupt.return();
      this.setState({
        isRunning: false,
      });
      return;
    }

    this.setState({
      isRunning: true,
      actions: []
    }, async () => {
      // value = '(async function oeration (){' + value + '})()';
      value = '(async function oeration (){try{' + value + '} catch(error) {output.error(error)}})()';
      await eval(value);
      this.setState({
        isRunning: false
      });
    });
  }

  saveCode = async () => {
    const name = this.state.scriptSettings.active;
    const content = this.scripts[name];
    const url = await this.uploadFile(content, name + '.js');
    console.log(url);
  }
  
  deleteScript = () => {
    const { scriptSettings } = this.state;
    const scriptName = scriptSettings.active;
    const index = scriptSettings.scripts.findIndex((script) => {
      return script.name === scriptName;
    });
    const scripts = scriptSettings.scripts;
    scripts.splice(index, 1);
    let activeScript = scripts[index];
    
    if (!activeScript) {
      activeScript = scripts[scripts.length - 1];
    }

    const name = activeScript.name;
    const newScriptSettings = {
      active: name,
      scripts: [...scripts]
    };

    this.setState({
      scriptSettings: newScriptSettings
    });

    this.dtable.updatePluginSettings(PLUGIN_NAME, newScriptSettings);
  }

  renameScript = async (scriptName) => {
    const { scriptSettings } = this.state;
    const activeName = scriptSettings.active;
    const scripts = scriptSettings.scripts;
    const scriptContent = this.scripts[activeName];
    const scriptUrl = await this.uploadFile(scriptContent, scriptName);
    const index = scripts.findIndex((script) => {
      return script.name === activeName;
    });
    scripts.splice(index, 1, {name: scriptName, url: scriptUrl});
    const newScriptSettings = {
      active: scriptName,
      scripts: [...scripts]
    };
    delete this.scripts[activeName];
    this.scripts[scriptName] = scriptContent;
    this.dtable.updatePluginSettings(PLUGIN_NAME, newScriptSettings);
    this.setState({
      scriptSettings: newScriptSettings
    });
    this.toggleRenameScriptDialog(); 
  }

  toggleAddNewScriptDialog = () => {
    this.setState({
      isShowAddScriptDialog: !this.state.isShowAddScriptDialog
    });
  }

  toggleRenameScriptDialog = () => {
    this.setState({
      isShowRenameScriptDialog: !this.state.isShowRenameScriptDialog
    });
  }

  checkScript = (name) => {
    const { scriptSettings } = this.state;
    const newScriptSettings = Object.assign({}, scriptSettings, {active: name});
    this.setState({
      scriptSettings: newScriptSettings
    });
    this.dtable.updatePluginSettings(PLUGIN_NAME, newScriptSettings);
  }

  renderScriptTabs = () => {
    const { scriptSettings } = this.state;
    const activeScriptName = scriptSettings.active;
    return (
      scriptSettings.scripts.map((script, index) => {
        const isSelected = script.name === activeScriptName;
        return <div key={'script-tab-' + index} onClick={() => this.checkScript(script.name)} className={styles['script-tab'] + ' ' + (isSelected ? styles['selected-script-tab'] : '')}>
          {script.name}
          {
            isSelected && <ScriptTabDropdownmenu
              scriptSettings={scriptSettings}
              deleteScript={this.deleteScript}
              toggleRenameScriptDialog={this.toggleRenameScriptDialog}
            />
          }
        </div>
      })
    );
  }

  renderScriptHeader = () => {
    return (
      <div className={styles["script-header"]}>
        <div className={styles['script-tabs-container']}>
          <div className={styles['script-tabs']}>
          {this.renderScriptTabs()}
        </div>
        </div>
        <div onClick={this.toggleAddNewScriptDialog} className={styles['add-new-script']}>
          <span className={styles["add-script-button"]}><i className={"dtable-font dtable-icon-add-table " + styles['add-script-icon']}></i></span>
        </div>
      </div>
    );
  }

  addNewScript = async (scriptName) => {
    let scripts = this.state.scriptSettings.scripts;
    const scriptUrl = await this.uploadFile(' ', scriptName);
    scripts = [...scripts, {name: scriptName, url: scriptUrl}];
    const newScriptSettings = {
      scripts,
      active: scriptName
    }
    this.dtable.updatePluginSettings(PLUGIN_NAME, newScriptSettings);
    this.setState({
      scriptSettings: newScriptSettings
    });
    this.toggleAddNewScriptDialog();
  }

  onChange = (value) => {
    const { scriptSettings } = this.state;
    const activeScriptName = scriptSettings.active;
    this.scripts[activeScriptName] = value;
  }

  uploadFile = async (content, fileName) => {
    if (!window.dtableWebAPI) {
      const url = await this.dtable.uploadScriptContent(content, fileName, true);
      return url;
    } else {
      console.log('start upload file');
      // workspaceID, fileName

      return window.dtableWebAPI.getTableAssetUploadLink(window.dtable.workspaceID, window.dtable.fileName).then((res) => {
        let uploadLink = res.data.upload_link + '?ret-json=1';
        console.log('uploadLink', uploadLink);
        let parentPath = res.data.parent_path;
        const newFile = new File([content], fileName, { type: 'js' });
        let formData = new FormData();
        formData.append('parent_dir', parentPath);
        formData.append('relative_path', 'plugins/scripts');
        formData.append('file', newFile);
        formData.append('replace', 1);
        window.dtableWebAPI.uploadImage(uploadLink, formData).then((res) => {
          let url = window.dtable.server + '/workspace/' + window.dtable.workspaceID + parentPath + '/plugins/scripts/' + encodeURIComponent(res.data[0].name);
          console.log('file content url', uploadLink);
          return url;
        });
      });
    }
  }

  render() {
    const { showDialog, actions, isRunning, isLoading, isShowAddScriptDialog, scriptSettings, isShowRenameScriptDialog } = this.state;
    let initialEditorValue = '';
    if (scriptSettings) {
      initialEditorValue = this.scripts[scriptSettings.active];
      if (initialEditorValue == undefined) initialEditorValue = '';
    }
    return (
      <Fragment>
        <Modal contentClassName={styles['modal-content']} isOpen={showDialog} toggle={this.onPluginToggle} className={ 'script-plugin '+ styles['script-plugin']} size="lg">
          <ModalHeader className={styles['script-plugin-header']} toggle={this.onPluginToggle}>{intl.get('Script_plugin')}</ModalHeader>
          <ModalBody className={styles['script-plugin-content']}>
            {
              !isLoading ?
                <Fragment>
                  <div className={styles['script-plugin-wrapper']}>
                    <div className={styles['script-plugin-wraper-left']}>
                      <div className={styles['script-plugin-toolbar-item'] + ' ' + styles['script-plugin-toolbar-left']}>
                        {this.renderScriptHeader()}
                      </div>
                      <div className={styles["script-plugin-coder"]}>
                        <div className={styles['editor-container']}>
                          <CodeMirror
                            onChange={this.onChange}
                            initialValue={initialEditorValue}
                          />
                        </div>
                      </div>
                      <div className={styles['script-plugin-toolbar-item'] + ' ' + styles['script-plugin-toolbar-right']}>
                        <button type="button" onClick={this.saveCode} className={"btn btn-secondary " + styles['script-button']}>{intl.get('Save')}</button>
                        <button onClick={this.runCode} type="button" className={"btn btn-primary " + styles['script-button']}>{intl.get('Run')}</button>
                      </div>
                    </div>
                    <div className={styles['script-plugin-wraper-right']}>
                      <OutputComponent actions={actions} />
                    </div>
                  </div>
                </Fragment> : <Loading />
            }
          </ModalBody>
        </Modal>
        {
          isShowAddScriptDialog &&
          <ModalPortal>
            <AddScriptDialog
              addNewScript={this.addNewScript}
              scriptSettings={scriptSettings}
              toggleAddNewScriptDialog={this.toggleAddNewScriptDialog}
            />
          </ModalPortal>
        }
        {
          isShowRenameScriptDialog &&
          <ModalPortal>
            <RenameScriptDialog
              scriptSettings={scriptSettings}
              renameScript={this.renameScript}
              toggleRenameScriptDialog={this.toggleRenameScriptDialog}
            />
          </ModalPortal>
        }
      </Fragment>
    );
  }
}

App.propTypes = propTypes;

export default App;
