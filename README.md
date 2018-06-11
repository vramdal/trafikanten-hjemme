# trafikanten-hjemme

![Photo](trafikanten-hjemme-liten.png)

[![Build Status](https://travis-ci.org/vramdal/trafikanten-hjemme.svg?branch=dev)](https://travis-ci.org/vramdal/trafikanten-hjemme)

## Installation
### Create Google Calendars
Create a calendar in Google Calendars. Call it "Public transport" or similar. 
Set up the display schedule as calendar events. Give each event a location.

Create another calendar, call it "Weather". Set up one or more events. Do not use the Location field, instead, in the 
description field, enter a location string on the form used by Yr.no URLs, for example `Norway/Oslo/Oslo/Kikutstua/`. 

For each of the two calendars, copy the _private_ ICS URL and copy them into the ...

### Configuration file
Create a configuration file `.trafikanten-hjemme` in your home directory, with the following JSON structure:

```
{
  "calendars": [
    {
      "name": "Entur",
      "url": "YOUR-PUBLIC_TRANSPORT-ICS-URL-HERE",
      "messageProvider": "Entur"
    },
    {
      "name": "Weather",
      "url": "YOUR-WEATHER-ICS-URL-HERE",
      "messageProvider": "Yr"
    }
  ],

  "home": {
    "coordinates": {
      "latitude": 123.45,
      "longitude": 678.90
    },
    "name": "Home, sweet home"
  }
}

```

Make sure you enter the coordinates for your home.

## Starting the application
```
cd bin
./run.sh
```

Browse to [http://localhost:6060/html-led.html](http://localhost:6060/html-led.html)