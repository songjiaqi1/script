import React from 'react';
import intl from 'react-intl-universal';
import styles from '../css/plugin-layout.module.css';

class TabDropdownMenu extends React.Component {

  componentDidMount() {
    document.addEventListener('click', this.props.onTabDropDownHide);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.props.onTabDropDownHide);
  }

  renameScript = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.renameScript();
  }

  deleteScript = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.deleteScript();
  }

  render() {
    const scriptCount = this.props.scriptSettings.scripts.length;
    return (
      <div className="dtable-dropdown-menu dropdown-menu large show" style={this.props.dropdownMenuPosition}>
        <button className={styles['script-dropdown-item'] + " dropdown-item"} onClick={this.renameScript}>
          <i className={styles['dropdown-icon'] + " dtable-font dtable-icon-rename"}></i>
          <span className="item-text">{intl.get('Rename_script')}</span>
        </button>
        {(scriptCount > 1 &&
          <button className={styles['script-dropdown-item'] + " dropdown-item"} onClick={this.deleteScript}>
            <i className={styles['dropdown-icon'] + " dtable-font dtable-icon-delete"}></i>
            <span className="item-text">{intl.get('Delete_script')}</span>
          </button>
        )}
      </div>
    );
  }
}

export default TabDropdownMenu;
