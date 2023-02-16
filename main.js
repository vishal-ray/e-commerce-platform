const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb')
var multer = require("multer")
var session = require("express-session")
const app = express()


var uri = "mongodb+srv://app:ixNNXYMf9mKIiFnK@cluster1.om0ee8a.mongodb.net/?retryWrites=true&w=majority";
var client = new MongoClient(uri, { useNewUrlParser: true}, {useUnifiedTopology: true}, {serverApi: ServerApiVersion.v1},{ keepAlive: 1} );
const dbName= 'ecommerce';

app.set("view engine","ejs");

const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
    "310fe50b92f9c9ac1539a82a6e17c68b",
    "b78bee31e647dfebde672b5c29cd4054",
);

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))

const upload = multer({ dest:'uploads/images' })
const port = 3000

app.use(express.json()) //gets json data, without it app.post function would show print undefined
app.use(express.urlencoded( { extended:true }))
app.use(upload.single("task-picture"))
app.use(express.static("./operations"))
app.use(express.static("./uploads"))

app.get("/verify", function(req,res)
{
	let username = req.session.x;
	console.log(username)
	var collection = dba.collection('User_List')
	console.log("In")
	collection.updateOne( { username : username }, { $set: {verified :true} }, function(err,data)
	{
		console.log("verified")
		console.log(err)
		res.redirect("/login")
	})
})

app.get("/",function(req,res)
{
	if(req.session.isAuthenticated)
	{
		var name = req.session.name;
		var collection = dba.collection('product_list')
		collection.find({ }).toArray(function(err,data)
		{
			console.log(err)
			res.render("index.ejs", { username : name, ecommerce : data } )
		})
		return
	}
	else if(!req.session.isAuthenticated)
	{
		var collection = dba.collection('product_list')
		collection.find({ }).toArray(function(err,data)
		{
			console.log(err)
			res.render("index_wl.ejs", { ecommerce : data } )
		})
		return
	}
	res.redirect("/login.html");
})


app.get("/login",function(req,res)
{
	if(req.session.isAuthenticated)
	{
		res.redirect("/")
		return
	}
})

app.post("/login", function(req,res)
{

	let username = req.body.username;
	let password = req.body.password;

		getAllUsers((err, data)=>
	{
		var erri ="";
		if(err)
		{
			res.end("something is wrong")
			console.log(err)
			return
		}
		if(username){
		var filteredUsers = data.filter(function(user)
		{
			if(!user.username)
			{
				erri = "User not present"
			}
			else if(user.verified === false)
			{
				erri = "User not verified."
			}
			else if(user.password !== password)
			{
				erri = "Password Incorrect"
			}

			if(user.username && user.verified)
				{
					if(user.password === password)
					{
						return true
					}
				}
		})
		if(filteredUsers.length)
		{
			req.session.isAuthenticated = true;
			req.session.name = username;
			res.redirect("/")
			return
		}
			}
		res.render("login.ejs",{err : erri})
	})
	
	
	

})


app.post("/logout",function(req,res)
{
	req.session.destroy();
  res.redirect("/")
})

app.get("/changepassword",function(req,res)
{
	res.redirect("/changepassword.html");
})

app.post("/changepassword", async function(req,res)
{
	var username =req.session.name;
	var pd = req.body.password;
	var collection = dba.collection('User_List')
	collection.updateOne( { username : username }, { $set: {password :pd} }, function(err,data)
	{
		console.log(err)
	})
	var html = "Password Changed Successfully."
	 getAllUsers((err, data)=>
	{
		if(err)
		{
			res.end("something is wrong")
			console.log(err)
			return
		}
		data.filter(async function(user)
		{
			if(user.username)
				{
					var email = user.email;
					await sendDemoMail(username,email,html);
					return
				}
		})
	})		
		res.redirect("/");
})

app.get("/resetpassword",function(req,res)
{
	res.redirect("/resetpassword.html");
})

app.post("/resetpassword", async function(req,res)
{
	var username =req.body.username;
	var pd = req.body.password;
	console.log(username);
	var collection = dba.collection('User_List')
	collection.updateOne( { username : username }, { $set: { password :pd} }, function(err,data)
	{
		console.log(err)
	})
	res.redirect("/");
})

app.get("/forgotpassword",function(req,res)
{
	res.redirect("/forgotpassword.html");
})

app.post("/forgotpassword",async function(req,res)
{
	var email = req.body.email;
	var html = "<h3>Dear User, Welcome to E-kart. Click <a href=\"https://ecommerce3-fork-fork-3p34g825jkhl78ykcr5.codequotient.in/resetpassword\">here</a> to reset Password<h3>";
	await sendDemoMail("user",email,html);
	res.render("signup.ejs",{err : "Check your email!"})
})

app.post("/addtocart", function(req,res)
{
	var username = req.session.name;
	var name = req.body.name;
	var id = req.body.id;
	var image = req.body.image;
	var price = req.body.price;
	getAllPairs((err, data)=>
	{
		if(err)
		{
			res.end("something is wrong")
			console.log(err)
			return
		}
	    if(data){
			var flag=false;
			console.log(flag)
			data.forEach(function(pair)
			{
			if(pair.username === username && pair.product_id === id)
			{
				var quantity = pair.quantity+1;
				console.log("inn");
				var collection = dba.collection('Cart')
				collection.deleteOne({ username : username, product_id : id })
				var pair = {
				username : username,
				productname : name,
				product_id : id,
				image : image,
				price : price,
				quantity : quantity
				}
				saveAllproduct(pair,function(err)
				{
					if(err)
					{
						console.log(err)
						res.end("something is wrong")
					}
				})
				flag= true;
				return
			}
		})
		console.log(flag)
		if(flag === false)
		{
			console.log("out")
			var pair = {
				username : username,
				productname : name,
				product_id : id,
				image : image,
				price : price,
				quantity : 1
				}
				saveAllproduct(pair,function(err)
				{
					if(err)
					{
						console.log(err)
						res.end("something is wrong")
						return
					}
				})
		}
	}
  })
	res.redirect("/");
})

app.get("/showcart",function(req,res)
{
	if(req.session.isAuthenticated)
	{
		var name = req.session.name;
		var collection = dba.collection('Cart')
		collection.find({ username : req.session.name }).toArray(function(err,data)
		{
			console.log(err)
			res.render("showcart.ejs", { username : name, cart : data } )
		})
		return
	}
	res.redirect("/login.html");
})

app.post("/showcart",function(req,res)
{
		var name = req.session.name;
		var collection = dba.collection('Cart')
		collection.find({ username : req.session.name }).toArray(function(err,data)
		{
			console.log(err)
			res.render("showcart.ejs", { username : name, cart : data } )
		})
		return
})

app.post("/delete-product",function(req,res)
{
	var collection = dba.collection('Cart')

	collection.deleteOne({ username : req.body.username, productname : req.body.productname }, function(err,data)
	{
		console.log("hi")
		res.redirect("/showcart")
	})
})
app.post("/signup", async function(req,res)
{
	var username = req.body.username;
	var password = req.body.password;
	var email =req.body.email;
	req.session.x = username;
	var verified = false;
	var err = "Mail Sent!! Verify your Account to login.";
	getAllUsers((err, data)=>
	{
		if(err)
		{
			res.end("something is wrong")
			console.log(err)
			return
		}
		var filteredUsers = data.filter(function(user)
		{
			
			if(user.username === username)
			{
				res.render("signup.ejs",{err : "Username Already Present.Try something else."})
				return true;
			}
		})
		if(filteredUsers.length)
		{
			err = "Username Already Present"
			return
		}
		
	})
	var html = "<h3>Dear "+username+", Welcome to E-kart. Click <a href=\"https://ecommerce3-fork-fork-3p34g825jkhl78ykcr5.codequotient.in/verify\">here</a> to verify your account.May the delivery force be with you!<h3>";
	await sendDemoMail(username,email,html);
		var user = {
			username : username,
			password : password,
			email : email,
			verified : verified
		}

		saveAllUser(user, function(err)
		{
		if(err)
		{
			console.log(err)
			res.end("something is wrong")
			return
		}
		
		})
		res.render("signup.ejs",{err : err})

})

function getAllUsers(callback)
{
	var collection = dba.collection('User_List')
	collection.find({}).toArray(callback)
}

function getAllPairs(callback)
{
	var collection = dba.collection('Cart')
	collection.find({}).toArray(callback)
}

function saveAllUser(user, callback)
{
	var collection = dba.collection('User_List')
	collection.insertOne(user, callback);
}

function saveAllproduct(pair,callback)
{
	var collection1 = dba.collection('Cart')
	collection1.insertOne(pair,callback)
}

client.connect(function()
{
	console.log("It's Connected")

	dba = client.db(dbName);
	
	app.listen(port, () => {
		console.log(`Example app listening at http://localhost:${port}`)
	})
})

	
function sendDemoMail(username,email,html)
	{
	const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: "vrayvishal@gmail.com",
                Name: "E-Kart"
              },
              To: [
                {
                  Email: email,
                  Name: username
                }
              ],
              Subject: "Verify Account!",
              TextPart: "Hola!",
              HTMLPart: html
            }
          ]
        })

	return request
  .then(result => {
    console.log(result.body)
  })
  .catch(err => {
    console.log(err.statusCode)
  })
}