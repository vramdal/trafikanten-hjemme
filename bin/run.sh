#!/bin/sh
#Should check for updates
pushd ../app
if [ -f pidfile ];
then
old_pid=`cat pidfile`
kill ${old_pid}
fi
node_modules/flow-remove-types/flow-node --harmony --inspect ./Main.js -s 6061 --timingfactor 2.0
some_pid=$!
echo ${some_pid} > pidfile
#wait ${some_pid}