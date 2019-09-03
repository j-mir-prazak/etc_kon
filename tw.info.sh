#!/bin/bash
cd /home/pi
echo $(date) >/home/pi/tw.info
teamviewer info >>/home/pi/tw.info
sudo mv /home/pi/tw.info /boot/tw.info
