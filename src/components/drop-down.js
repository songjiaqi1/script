import React, { Fragment } from 'react';
import intl from 'react-intl-universal';
import styles from '../css/plugin-layout.module.css';
import TabDropdownMenu from './tab-dropdown-menu';
import ModalPortal from './modal-portal';

class ScriptTabDropdownmenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isRenameDialogShow: false,
      isTabDropdownShow: false
    };
  }

  onTabDropDownHide = (event) => {
    if (this.tabDropDownRef && event &&!this.tabDropDownRef.contains(event.target)) {
      this.setState({ isTabDropdownShow: false });
    }
  }

  deleteScript = () => {
    this.props.deleteScript();
    // this.setState({ isTabDropdownShow: false });
  }

  renameScript = () => {
    this.props.toggleRenameScriptDialog();
    this.setState({ isTabDropdownShow: false });
  }

  onToggleTabDropDown = () => {
    let {top, left, height} = this.tabDropDownRef.parentNode.getBoundingClientRect();
    this.setState({ isTabDropdownShow: !this.state.isTabDropdownShow, tabDropdownMenuStyle: {top: top + height, left, zIndex: 1051} });
  }

  render() {
    return (
      <Fragment>
        <span className={styles["script-tab-dropdown"]} ref={ref => this.tabDropDownRef = ref} onClick={this.onToggleTabDropDown}>
          <i className={"dtable-font dtable-icon-drop-down " + styles['script-tab-dropdown-icon']}></i>
        </span>
        {(this.state.isTabDropdownShow) && (
          <ModalPortal>
            <TabDropdownMenu
              dropdownMenuPosition={{ top: this.state.tabDropdownMenuStyle.top, left: this.state.tabDropdownMenuStyle.left, zIndex: this.state.tabDropdownMenuStyle.zIndex }}
              deleteScript={this.deleteScript}
              renameScript={this.renameScript}
              scriptSettings={this.props.scriptSettings}
              onTabDropDownHide={this.onTabDropDownHide}
            />
          </ModalPortal>
        )}
      </Fragment>
    );
  }
}

export default ScriptTabDropdownmenu;