#!/bin/sh
echo "Preparing writable files"
if [ -d /etc_rw/usernodes_w ];
then
rm -rf /etc_rw/usernodes_w
fi
echo "Copying usernodes to writable area"
cp -r /home/pi/trafikanten-hjemme/usernodes_w /etc_rw/usernodes_w

if [ ! -d /home/pi/trafikanten-hjemme/usernodes ];
then
echo "Creating symlink to writable area"
ln -s /etc_rw/usernodes_w /home/pi/trafikanten-hjemme/usernodes
fi