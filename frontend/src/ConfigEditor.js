import React, {Component} from 'react';
import {string, arrayOf, shape, oneOf, func} from 'prop-types';
// import fetch from 'fetch-hoc';
import './ConfigEditor.css';
import autoBind from 'auto-bind';
import {remove} from 'lodash';
import objectPath from 'object-path';

class ConfigEditor extends Component
{
    constructor(props) {
        super(props);
        autoBind(this);
        this.state = {};
    }

    componentDidMount() {
        this.fetchConfig();
    }

    fetchConfig() {
        fetch(this.getEndpointUrl())
            .then(response => response.json())
            .then(configuration => this.setState({configuration}));
    }

    // noinspection JSMethodCanBeStatic
    getEndpointUrl() {
        return `http://${window.location.hostname}:6060/config.json`;
    }

    addButtonClicked() {
        if (this.state.configuration.calendars.find(cal => cal.url === "")) {
            return;
        }
        const updatedConfiguration = {...this.state.configuration};
        const model = objectPath(updatedConfiguration);
        model.push("calendars", {name: '', url: '', messageProvider: MESSAGEPROVIDERS[0]});
        this.setState({configuration: updatedConfiguration});
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

    onSubmit(evt) {
        evt.preventDefault();
        fetch(evt.target.action, {
            method: "POST",
            body: JSON.stringify(this.state.configuration),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then(result => result.json())
            .then(configuration => this.setState({configuration: configuration}))
            .catch(err => console.error(err));
    }

    onReset(evt) {
        evt.preventDefault();
        this.fetchConfig();
    }

    onFieldChange(evt) {
        const path = evt.target.name;
        const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
        const target = {...this.state.configuration};
        objectPath.set(target, path, value);
        const model = objectPath(this.state);
        model.set(path, value);
        this.setState({configuration: target});
    }

    render() {
        if (!this.state.configuration) {
            return <div>Loading ...</div>;
        }
        return (
            <form onSubmit={this.onSubmit} onReset={this.onReset} action={this.getEndpointUrl()}>
                <fieldset>
                    <legend>Home location</legend>
                    <label>Latitude</label>
                    <input type="number" name="home.coordinates.lat" value={this.state.configuration.home.coordinates.latitude} onChange={this.onFieldChange} />
                    <label>Longitude</label>
                    <input type="number" name="home.coordinates.lon" value={this.state.configuration.home.coordinates.longitude} onChange={this.onFieldChange}/>

                </fieldset>
                {this.state.configuration.calendars.map((calendar, idx) => (
                    <CalendarComponent name={"calendars." + idx + "."}
                        calendar={calendar}
                        key={`calendar-${idx}`}
                        onFieldChange={this.onFieldChange}
                        deleteButtonClicked={this.deleteButtonClicked}/>
                    )
                )}
                <button type="button" onClick={this.addButtonClicked}>Add calendar</button>
                <div className="form-buttons">
                    <button type="reset">Reset</button>
                    <button type="submit">Save</button>
                </div>
        </form>
        );
    }
}

export default ConfigEditor;

const CalendarComponent = ({
                                calendar,
                               deleteButtonClicked,
                               onFieldChange,
                               name,
}) =>

    <fieldset>
        <legend>Calendar</legend>
        <p>
            <label>Name </label><br/>
            <input type="text" name={`${name}name`} defaultValue={calendar.name} onChange={onFieldChange}/>
        </p>
        <p>
            <label>URL</label><br/>
            <input type="url" name={`${name}url`} defaultValue={calendar.url} onChange={onFieldChange}/>
        </p>
        <p>
            <label>Message provider</label><br/>
            <select name={`${name}messageProvider`} value={calendar.messageProvider} onChange={onFieldChange}>
                {MESSAGEPROVIDERS.map(mpn => (
                    <option key={mpn} value={mpn}>{mpn}</option>
                ))}
            </select>
        </p>
        <p>
            <label><input type="checkbox" name={`${name}displayEventTitle`} checked={calendar.displayEventTitle} onChange={onFieldChange}/> Display event titles</label>
        </p>
        <button type="button" className="deleteCalendarButton" data-url={calendar.url} onClick={deleteButtonClicked}>Delete</button>
    </fieldset>;

const MESSAGEPROVIDERS = ["Entur", "Yr", "Bysykkel", "Textmessage"];

const calendarProps = {
    name: string.isRequired,
    url: string.isRequired,
    messageProvider: oneOf(MESSAGEPROVIDERS).isRequired
};

CalendarComponent.propTypes = {
    deleteButtonClicked: func.isRequired,
    calendar: shape(calendarProps),
    onFieldChange: func.isRequired,
    name : string.isRequired,
};

ConfigEditor.propTypes = {
    calendars: arrayOf(shape(calendarProps))
};