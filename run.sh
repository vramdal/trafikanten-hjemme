#!/bin/sh
#Should check for updates
cd /home/pi/trafikanten-hjemme
if [ -f pidfile ];
then
old_pid=`cat pidfile`
sudo kill ${old_pid}
fi
sudo node Main.js > Main.log &
some_pid=$!
echo ${some_pid} > pidfile
#wait ${some_pid}