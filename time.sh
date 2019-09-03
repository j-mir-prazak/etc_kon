#!/bin/bash
if [ $1 == "fake" ]
then

sudo systemctl stop systemd-timesyncd.service
sudo systemctl disable systemd-timesyncd.service

sudo service systemd-timesyncd stop
sudo service hwclock.sh stop
date --s "14:59:45"

elif [ $1 == "true" ]
then

sudo systemctl enable systemd-timesyncd.service
sudo systemctl start systemd-timesyncd.service

sudo service systemd-timesyncd start
sudo service hwclock.sh start
fi
