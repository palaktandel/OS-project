const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const exec = require('child_process').exec
const spawn = require('child_process').spawn
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('resource'))

app.get('/shell', (req, res) => {
	res.render('shell.ejs')
})

users = {'root':'toor', 'amul':'1234'}

var cmd = null

app.post('/execute', (req, res) => {
	console.log(req.body.cmd)
	/*exec(req.body.cmd, (error, stdout, stderr) => {
		if (error)
			req.body.error = error.toString()
		if (stderr)
			req.body.error = stderr
		req.body.response = stdout
		console.log(req.body)
		res.send(JSON.stringify(req.body))
	})*/
	cmd = spawn(req.body.cmd, {shell: true})
	cmdRes = {cmd: req.body.cmd}
	cmdRes.response = ''
	cmdRes.error = ''
	cmd.stdout.on('data', (data) => {
		cmdRes.response += data.toString()
	})
	cmd.stderr.on('data', (error) => {
		//console.log(error)
		cmdRes.error += error.toString()
	})
	
	cmd.on('close', (code) => {
		//res.send(JSON.stringify(req.body))
	})
	cmd.on('error', (error) => {
		console.log(error.toString())
		throw error
	})
})

app.get('/stdout', (req, res) => {
	while (!(cmdRes.response || cmdRes.error));
	res.send(JSON.stringify(cmdRes))
	cmdRes.response = ''
	cmdRes.error = ''
})

app.post('/auth', (req, res) => {
	if (users[req.body.username] == req.body.password)
		res.redirect('/shell');
	else
		res.redirect('/login?auth=false')
});

//app.get('/')

app.listen(8080)