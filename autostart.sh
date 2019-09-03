#!/bin/bash
CURDIR=$(dirname $0)
cd "$CURDIR"

MAINPID=$$

if [ -p input.pipe ]
then
	rm input.pipe
fi

if [ -f output.file ]
then
	echo -ne "" > output.file
fi

echo -ne "\n\e[94m" >> output.file
date >> output.file

if [ -z $1 ]
then
echo -e "-----------------------------" >> output.file
echo -e "    STARTED BY LXSESSION.    " >> output.file
fi
echo -e "-----------------------------" >> output.file
echo -e "          AUTOSTART.         " >> output.file
echo -e "-----------------------------" >> output.file
echo -e "" >> output.file
echo -e "" >> output.file

function terminate {

	echo -e "\e[33m\n\n" | tee -a output.file
	echo -e "-----------------------------" | tee -a output.file
	echo -e "    AUTOSTART TERMINATED.    " | tee -a output.file
	echo -e "-----------------------------" | tee -a output.file
	echo -e "\n\n" | tee -a output.file

	disown $PROC1 2>/dev/null
	kill -SIGTERM $PROC1

	disown $PROC2 2>/dev/null
	kill -SIGTERM $PROC2

	# disown $PROC3
	kill -SIGTERM $PROC3 2>/dev/null

	trap SIGINT;
	trap SIGTERM;
	kill $$ 2>/dev/null
	# kill -2 $MAINPID
	}

trap terminate SIGINT
trap terminate SIGTERM


./bootstrap.sh >> output.file & PROC1=$!
tail -f output.file & PROC2=$!
##creates input pipe for kill command
./input.sh $MAINPID & PROC3=$!
wait
