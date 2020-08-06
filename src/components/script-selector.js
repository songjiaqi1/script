import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from './select';

const propTypes = {
  configSetting: PropTypes.object,
  onSelectChange: PropTypes.func,
};

class LocationSettingItem extends Component {

  createOptions = () => {
    let { configSetting } = this.props;
    return configSetting.scripts.map(option => {
      return this.createOption(option);
    });
  }

  createOption = (option) => {
    return ({
      label: (<span className='select-option-name'>{option.name}</span>),
      value: { name: option.name },
    });
  }

  onSelectChange = (option) => {
    this.props.onSelectChange(option);
  }

  render() {
    let { configSetting } = this.props;
    let { active, scripts } = configSetting;
    let activeOption = scripts.find(script => script.name === active);
    return (
      <div className={'script-list'}>
        <Select
          className="dtable-plugin-location-select"
          value={this.createOption(activeOption)}
          options={this.createOptions()}
          onSelectOption={this.onSelectChange}
        />
      </div>
    );
  }
}

LocationSettingItem.propTypes = propTypes;

export default LocationSettingItem;
