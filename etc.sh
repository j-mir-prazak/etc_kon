#!/bin/bash

Process="node"
counter=0

function terminate {

	kill -SIGINT $PROC1
	echo -e "KILLING SUB"
	kill -SIGTERM $PROC1
	echo -e "\e[33m\n\n"
	echo -e "-----------------------------"
	echo -e "       VALVE TERMINATED.     "
	echo -e "-----------------------------"
	echo -e "\n\n"
	trap SIGTERM
	trap SIGINT
	echo -e "KILLING MAIN"
	kill -SIGTERM $$
	}

trap terminate SIGINT
# trap 'echo int; kill -SIGINT $PROC1' SIGINT
trap terminate SIGTERM


function looping {
	while true; do
	  echo -e "\e[34m"
	  echo "-----------------------------"
	  echo "       Starting nodejs.      "
	  echo "-----------------------------"
	  echo ""
	  echo ""
		PROC2=""
		m1=""
		m2=""
		m1=$(ls -d /media/pi/* | tail -n 1)
		# m2=$(ls /media/pi/* | tail -n -1)
		# media=$(ls /media/* | tail -n -1)
		media="$m1/$m2"
	  if [ "$media" != "" ]
		then
			echo "Sourcing flash drive."
			node index.js "$media" &
		else
			echo "Sourcing assets."
			node index.js &
		fi
		PROC2=$!
		trap 'break' SIGINT
		trap 'break' SIGTERM
		wait
		echo ""
	  counter=$(expr $counter + 1)
	  echo "Error. Retrying. Rerun #$counter."
	  echo  ""
	  sleep 5
	done
}

looping &
PROC1=$!
wait
