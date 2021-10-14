const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const exec = require('child_process').exec
const spawn = require('child_process').spawn
var session = require('express-session')

app.use(session({
  secret: 'bash',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

users = {'root':'toor', 'amul':'1234'}

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('resource'))

app.get('/shell', (req, res) => {
	console.log(req.session.username)
	res.render('shell.ejs')
})

currDir = "./shell"
prevDir = "./shell"

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
	
	req.body.response = ''
	req.body.error = ''
	
	if (req.body.cmd.startsWith("cd ")) {
		dir = req.body.cmd.split(" ")[1]
		if (dir == '\\' || dir == '/' ) {
			currDir = "./shell"
		}
		else if (dir == '..') {
			if (currDir.slice(2).contains('/'))
				currDir = currDir.slice(0, currDir.lastIndexOf('/'))
			else
				currDir = "./shell"
		}
		else
			currDir += '/' + dir;
		req.body.response = ''
		req.body.error = ''
		//res.send(JSON.stringify(req.body))
		//return
	}
	
	cmd = spawn(req.body.cmd, {shell: true, cwd: prevDir})
	req.body.cwd = currDir
	cmd.stdout.on('data', (data) => {
		req.body.response += data.toString()
	})
	cmd.stderr.on('data', (error) => {
		if (req.body.cmd.startsWith("cd ")) {
			req.body.cwd = prevDir
			currDir = prevDir
		}
		console.log(error)
		req.body.error += error.toString()
	})
	
	cmd.on('close', (code) => {
		prevDir = currDir
		res.send(JSON.stringify(req.body))
	})
	cmd.on('error', (error) => {
		console.log(error.toString())
		throw error
	})
})

app.get('/stdout', (req, res) => {
	res.send(JSON.stringify({response: 'Hello !'}))
})

app.post('/auth', (req, res) => {
	if (users[req.body.username] == req.body.password){
		req.session.user = req.body.username;
		res.redirect('/shell');
	}
	else {
		res.redirect('/login?auth=false')
	}
});

app.get('/login', (req, res) => {
	res.render("login", {auth: req.query.auth})
});


app.listen(8080)