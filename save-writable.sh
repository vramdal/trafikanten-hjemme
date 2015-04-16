#!/bin/sh
echo "Saving files from writable area"
if [ -d /etc_rw/usernodes_w ];
then
echo "Mounting in writable mode"
sudo /usr/local/bin/mount_writable
echo "Removing old version"
rm -rf /home/pi/trafikanten-hjemme/usernodes_w
echo "Saving files"
mkdir /home/pi/trafikanten-hjemme/usernodes_w
cp -r /etc_rw/usernodes_w/* /home/pi/trafikanten-hjemme/usernodes_w/
else
echo Nothing to save
fi

