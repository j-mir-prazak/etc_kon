#!/usr/bin/node
//modules declaration
var spawner = require('child_process')
var StringDecoder = require('string_decoder').StringDecoder
var events = require('events')
var fs = require('fs')
var schedule = require('node-schedule')
var omx = require('node-omxplayer')


//parameters handling
var media = process.argv[2];

if ( media ) {
	console.log('flash drive name: ' + media);
	// process.emit("SIGINT");
	// process.exit(0);
}

// if ( ! fs.existsSync('assets')) {
// 	console.log("no assets folder")
// 	process.exit(0)
// }
//
// var assets = new Array();
// assets = fs.readdirSync('assets')
// if ( assets.length < 1) {
// 	console.log("no assets")
// 	process.exit(0)
// }
// else {
// 	console.log(assets)
// }


//clean up
process.on('SIGHUP',  function(){ console.log('\nCLOSING: [SIGHUP]'); process.emit("SIGINT"); })
process.on('SIGINT',  function(){
	 console.log('\nCLOSING: [SIGINT]');
	 for (var i = 0; i < pids.length; i++) {
		console.log("KILLING: " + pids[i])
		process.kill(-pids[i])
 	}
	 process.exit(0);
 })
process.on('SIGQUIT', function(){ console.log('\nCLOSING: [SIGQUIT]'); process.emit("SIGINT"); })
process.on('SIGABRT', function(){ console.log('\nCLOSING: [SIGABRT]'); process.emit("SIGINT"); })
process.on('SIGTERM', function(){ console.log('\nCLOSING: [SIGTERM]'); process.emit("SIGINT"); })

var pids = new Array();

function cleanPID(pid) {
	var pid = pid || false
	for (var i = 0; i < pids.length; i++) {
		if ( pids[i] == pid ) {
			pids.splice(i, 1)
			console.log("PID"+pid+" deleted")
		}
	}
}

//global vars
var date
// date = new Date()
// var obj = JSON.parse(fs.readFileSync('schedule.json', 'utf8'))
// var sch = obj.schedule
var obj
var sch

var version = false

function startCycle() {

	console.log("------------------  n e w  c y c l e  ------------------")
	console.log(""+new Date())

	var cycle = new Array();

	var filename = "bad_trip_" + version + ".mp4"
	if ( media ) cycle["player"] = omx(media + 'rpi/' + filename, 'alsa')
	else cycle["player"] = omx('assets/' + filename, 'alsa')
	// cycle["player"] = omx('assets/' + filename, 'alsa')
	pids.push(cycle["player"].pid)
	console.log("PID"+cycle["player"].pid + ' pid added')
	console.log("PID"+cycle["player"].pid + ' playback started')
	return cycle

}

var queueRunning = false
var playerQueue = new Array()

function queueHandler() {
	if ( playerQueue.length == 0 ) {
		queueRunning = false
		return true
	}
	queueRunning = true
	var value = playerQueue.shift()
	var entry = value()
	if ( typeof entry == 'object') {
		var pid = entry.player.pid
		entry["player"].on('close', function (pid){
			console.log("PID"+pid + ' playback ended')
			cleanPID(pid)
			console.log("----------------  c y c l e  e n d e d  ----------------")
			setupJob()
			queueHandler()
			//bind pid number - player won't exist after closing, so you won't get the pid from the Object
		}.bind(null,pid))
	}
	queueHandler()
}

function generalPad(string, padding, filler=0) {
	var string = string
	var padding = padding
	var filler = String( filler )

	return filler.repeat(padding - String( string ).length) + string

}

function getDay(daynum, array) {
	var sch = array.concat()
	var daynum = daynum
	var day = new Array()
	for ( var i = 0; i < array.length; i++ ) {
		if ( sch[i].daynum == daynum) day.push(sch[i])
	}
	return day
}


function openDay(daynum, days=false) {
	if ( daynum > 100 ) {
		console.log("something wrong with the schedule.json")
		return false
	}

	obj = JSON.parse(fs.readFileSync('schedule.json', 'utf8'));
	sch = obj.schedule
	date = new Date()

	var daynum = parseInt(daynum)
	//day array
	var days = days || getDay(daynum%7, sch)
	console.log(daynum + " " + days.length)

	if ( days.length < 1 ) return openDay(daynum+1)
	var day = days.shift()


	version = day.version

	var ohour = day.ohour
	var chour = day.chour
	if ( ohour === "" || chour === "" ) {
		if ( days.length < 1 ) return openDay(daynum+1)
		else return openDay(daynum, days)
	}

	var playtimes = day.playtimes
	if ( date.getDay() == daynum ) {
		console.log("1")

		if ( date.getHours() < ohour ) {
			return new Date( date.getFullYear(), date.getMonth(), date.getDate(), ohour, playtimes[0], 0, 0)
		}

		console.log("2")

		var slot = closestSlot(playtimes)

		if ( date.getHours() > chour || ( slot == "plushour" && date.getHours()+1 > chour ) ) {
			console.log("3")
			if ( days.length < 1 ) return openDay(daynum+1)
			else return openDay(daynum, days)
		}

		else if (  slot == "plushour" && date.getHours()+1 <= chour && date.getHours()+1 < 24  ) {
			console.log("4")
			return new Date( date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()+1, playtimes[0], 0, 0)
		}

		else {
			console.log("5")
			return new Date( date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), slot, 0, 0)
		}
	}

	else {
		console.log( "next day:\t" + day.name )
		var nextday = new Date( date.getFullYear(), date.getMonth(), date.getDate(), ohour, playtimes[0], 0)
		var milis = Math.abs( (daynum) - date.getDay() )
		milis *= (24*60*60*1000)
		var utc = Date.parse(nextday)
		utc = utc + milis
		var d = new Date()
		d.setTime(utc)
		return d
	}
	return false
}

function closestSlot(array) {
	console.log("6")
	var times = array.concat() || false
	if (times === false) {
		console.log("10")
		return false
	}
	var slot = times.shift()
	date = new Date()

	if ( slot > date.getMinutes() ) {
		console.log("7")
		return slot
		}
	else if ( times.length > 0 ) {
		console.log("8")
		return closestSlot(times)
		}
	else {
		console.log("9")
		return "plushour"
	}
}

function setupJob(){
	console.log("------------------  n e w  s e t u p  ------------------")
	obj = JSON.parse(fs.readFileSync('schedule.json', 'utf8'));
	sch = obj.schedule

	date = new Date()

	var job = openDay(date.getDay())

	console.log("job scheduled at: " + job)
	console.log("version: " + version)




	var j = schedule.scheduleJob(job, function(fireDate){
		console.log('new cycle enqueued')
		playerQueue.push(function() {
			return startCycle()
		})
		if ( queueRunning === false ) queueHandler()
	});
}




//first job setup
setupJob()
