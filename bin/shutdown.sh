#!/bin/sh
cd /home/pi/trafikanten-hjemme/app
if [ -f pidfile ];
then
old_pid=`cat pidfile`
sudo kill ${old_pid}
fi
