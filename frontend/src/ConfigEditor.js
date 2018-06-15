import React, {Component} from 'react';
import {string, arrayOf, shape, oneOf, func} from 'prop-types';
// import fetch from 'fetch-hoc';
import './ConfigEditor.css';
import autoBind from 'auto-bind';
import {remove, without} from 'lodash';

class ConfigEditor extends Component
{
    constructor(props) {
        super(props);
        autoBind(this);
        this.state = {calendars: (props.data && props.data.calendars) || undefined};
    }

    componentDidMount() {
        fetch(`http://${window.location.hostname}:6060/config.json`)
            .then(response => response.json())
            .then(configuration => this.setState({configuration}));
    }

    addButtonClicked() {
        this.setState({
            configuration: Object.assign({}, this.state.configuration, {calendars: this.state.configuration.calendars.concat({name: '', url: '', messageProvider: ''})})
        });
    }

    deleteButtonClicked(evt) {
        const url = evt.target.dataset.url;
        console.log("url = ", url);
        remove(this.state.configuration.calendars, (cal) => {
            console.log('Tester', cal.url, "mot", url);
            return cal.url === url;
        });
        const updatedArray = [].concat(this.state.configuration.calendars);
        this.setState({
            configuration: Object.assign({}, this.state.configuration, {calendars: updatedArray})
        })
    }

    submitButtonClicked() {

    }



    render() {
        if (!this.state.configuration) {
            return <div>Loading ...</div>;
        }
        return (
            <form>
                {this.state.configuration.calendars.map(calendar => <CalendarComponent key={calendar.url} {...calendar} deleteButtonClicked={this.deleteButtonClicked}/>)}
                <button type="button" onClick={this.addButtonClicked}>Add calendar</button>
                <button type="submit" onClick={this.submitButtonClicked}>Save</button>
        </form>
        );
    }
}

export default ConfigEditor;

const CalendarComponent = ({
                               name,
                               url,
                               messageProviderName,
                               deleteButtonClicked
}) =>

    <fieldset>
        <legend>Calendar</legend>
        <p>
            <label>Name </label><br/>
            <input type="text" id="nameField" name={name} defaultValue={name}/>
        </p>
        <p>
            <label>URL</label><br/>
            <input type="url" id="nameField" name={url} defaultValue={url}/>
        </p>
        <p>
            <label>Message provider</label><br/>
            <select name="messageProvider" defaultValue={messageProviderName}>
                {MESSAGEPROVIDERS.map(mpn => (
                    <option key={mpn} value={mpn}>{mpn}</option>
                ))}
            </select>
        </p>
        <button type="button" className="deleteCalendarButton" data-url={url} onClick={deleteButtonClicked}>Delete</button>
    </fieldset>;

const MESSAGEPROVIDERS = ["Entur", "Yr"];

const calendarProps = {
    name: string.isRequired,
    url: string.isRequired,
    messageProvider: oneOf(MESSAGEPROVIDERS).isRequired
};

CalendarComponent.propTypes = {
    deleteButtonClicked: func.isRequired,
    ...calendarProps
};

ConfigEditor.propTypes = {
    calendars: arrayOf(shape(calendarProps))
};