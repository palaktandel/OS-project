const spawn = require('child_process').spawn

cmd = spawn('cmd')

/*cmd.stdout.on('data', (data) => {
	console.log(data.toString())
})*/

cmd.stdout.pipe(process.stdout);

cmd.on('exit', (code) => {
	console.log('exited !')
})
cmd.on('error', (error) => {
	console.log(error.toString())
	throw error
})

cmd.stdin.write('echo Hello World');
