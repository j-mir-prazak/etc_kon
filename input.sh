#!/bin/bash
MAINPID=$1

if [ -p input.pipe ]
then
	rm input.pipe
fi

mkfifo input.pipe

function terminate {

	echo -e "\e[33m\n\n" | tee -a output.file
	echo -e "-----------------------------" | tee -a output.file
	echo -e "      INPUT TERMINATED.      " | tee -a output.file
	echo -e "-----------------------------" | tee -a output.file
	echo -e "\n\n" | tee -a output.file

	trap SIGINT;
	trap SIGTERM;
	kill -SIGINT $MAINPID 2>/dev/null
	kill -SIGINT $PROC1 2>/dev/null
	kill -SIGINT $$
	# kill -2 $MAINPID
	}

trap terminate SIGINT
trap terminate SIGTERM

function looping {
	while true;
	do read STRING <input.pipe;
	 	if [ "$STRING" == "die-now" ]
	 	then
			terminate
			# kill -SIGINT $$ 2>/dev/null
		fi
	done
}

looping &
PROC1=$!
wait
