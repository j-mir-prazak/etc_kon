function recursePad(number, pad) {
	var pow = Math.pow(10, pad)
	if ( number >= pow ) {
		return pad
	}
	else return recursePad(number, pad-1)

}

function numberPad(number, padding) {
	var number = number
	var padding = padding-1
	var pads = recursePad(number, padding)
	var zeros = "0"
	zeros = zeros.repeat(padding-pads)
	return String(zeros + number)
}

// console.log(numberPad(2000,4))
// console.log(numberPad(20,4))
// console.log(numberPad(2,4))




function numberPad(number, padding) {

	function recursePad(number, pad) {
		var pow = Math.pow(10, pad)
		if ( number >= pow ) {
			return pad
		}
		else return recursePad(number, pad-1)
	}

	var number = number
	var padding = padding-1
	var pads = recursePad(number, padding)
	var zeros = "0"
	zeros = zeros.repeat(padding-pads)
	return String(zeros + number)
}


// console.log(numberPad2(200000,10))
a = function() {
	console.log(a)
}
a.bind(null, "chemo")()
