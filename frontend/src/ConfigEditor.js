import React, {Component} from 'react';
import {string, arrayOf, shape, oneOf} from 'prop-types';

export default class ConfigEditor extends Component
{
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.fetch()
    }

    render() {
        if (!this.props.calendars) {
            return <div>Loading ...</div>;
        }
        return (
            <form>
            {this.props.calendars.map(CalendarComponent)}
        </form>
        );
    }

}

const CalendarComponent = ({
                               name,
                               url,
                               messageProviderName
}) =>

    <fieldset>
        <legend>Calendar</legend>
        <p>
            <label>Name: </label>
            <input type="text" id="nameField" name={name} defaultValue={name}/>
        </p>
        <p>
            <label>URL</label>
            <input type="url" id="nameField" name={url} defaultValue={url}/>
        </p>
        <p>
            <label>Message provider</label>
            <select name="messageProvider">
                {MESSAGEPROVIDERS.map(mpn => (
                    <option value={mpn} selected={mpn === messageProviderName}>{mpn}</option>
                ))}
            </select>
        </p>
    </fieldset>;

const MESSAGEPROVIDERS = ["Entur", "Yr"];

ConfigEditor.propTypes = {
    calendars: arrayOf(shape({
        name: string.isRequired,
        url: string.isRequired,
        messageProvider: oneOf(MESSAGEPROVIDERS).isRequired
    }))
};