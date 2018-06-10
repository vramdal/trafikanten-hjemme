# trafikanten-hjemme

![Photo](trafikanten-hjemme-liten.png)

[![Build Status](https://travis-ci.org/vramdal/trafikanten-hjemme.svg?branch=dev)](https://travis-ci.org/vramdal/trafikanten-hjemme)

## Installation
Create a configuration file `.trafikanten-hjemme` in your home directory, with the following JSON structure:

```
{
  "calendars": [
    {
      "name": "Entur",
      "url": "https://calendar.google.com/calendar/ical/....../....../basic.ics",
      "messageProvider": "Entur"
    },
    {
      "name": "Weather",
      "url": "https://calendar.google.com/calendar/ical/....../....../basic.ics",
      "messageProvider": "Yr"
    }
  ],

  "googleMapsApiKey": "......",
  "home": {
    "coordinates": {
      "latitude": 123.45,
      "longitude": 678.90
    },
    "name": "Home, sweet home"
  }
}

```


## Starting the application
```
cd bin
./run.sh
```

Browse to [http://localhost:6060/html-led.html](http://localhost:6060/html-led.html)