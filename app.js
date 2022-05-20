"use strict";

//link packages

var express = require("express");
var bodyParser = require("body-parser");
var fileUpload = require("express-fileupload");
const { render, get } = require("express/lib/response");

//Essential variables for running SQL and server connectivity.
var port = 8000;
var app = express()
var session = require('express-session');
var sessionData;
var mysql = require("mysql");
var likesArray = [];
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "project2"
  });
app.use(express.static("static"));
app.set("view-engine", "ejs");
app.set("views", "templates");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(session({
  secret: 'crmoryx678ygh8iruudsygyudsivhjo;khjefB66^^&fjdfyjngaklfdhf', resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 6000000 }
  }));
app.use(function(req, res, next) {
    console.log(req.url);
    next();
});

//Render Homepage once connected to server.
app.get("/", function (req, res){
  sessionData = req.session.username;
  //if user has logged in
  if (sessionData){
    con.query(`SELECT * FROM images`, function(err, results) {
      if (err) {
          res.send("A database error occurred: "+err);
      } else {
        if (results.length >0) {
        con.query(`SELECT * FROM likes `, function(err, likeResults) {
          if (err) {
            res.send("A database error occurred: "+err);
        } 
          else {
              likesArray = likeResults;
              const images = results.map(item => {
              const imageID = item["imageLink"];
              const imageLikes = likeResults.filter(likeItem => likeItem.imageID === imageID).length;
              return {...item, likes: imageLikes};
            });
           res.render("home.ejs", {"data": "profile", "name": "Profile", "images": images, "username": sessionData });
          }
        });
      }
      else{
        res.render("home.ejs", {"data": "profile", "name": "Profile", "images": results, "likes": results });
      }
    }
   });  
  }
  //if the user is not logged in.
  else {
    con.query(`SELECT * FROM images`, function(err, results) {
      if (err) {
          res.send("A database error occurred: "+err);
      } else {
          if (results.length >0) {
            con.query(`SELECT * FROM likes `, function(err, likeResults) {
              if (err) {
                res.send("A database error occurred: "+err);
            } 
              else {
                 likesArray = likeResults;
                  const images = results.map(item => {
                  const imageID = item["imageLink"];
                  const imageLikes = likeResults.filter(likeItem => likeItem.imageID === imageID).length;
                  return {...item, likes: imageLikes};
                });
               res.render("home.ejs", {"data": "login", "name": "Log in!", "images": images});
              }
            });
          } else {
            res.render("home.ejs", {"data": "login", "name": "Log in!", "images": results, "likes": "likes" });
          }
      }
   });
}
});

// render image table - cats example from class

//Login page for when the user clicks the 'log in' button on the homepage.
app.get("/login", function (req, res) {
  res.render("login.ejs");
});

//After user inputs name and password profile is rendered.
app.post("/profile", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    //SQL password and username verification.
		con.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(err, results, fields) {
      if (err) {
        res.send("A database error occurred: "+err);
      } else {
        con.query(`SELECT * FROM images WHERE username = ?`, [username], function(err, imageResults) {
        if (results.length > 0) {
          //If the credentials match up, render the profile ejs with the username presented.
          req.session.loggedin = true;
          req.session.username = username;
          sessionData = username;
          res.render('profile.ejs', {"username": sessionData, "users": results, "images": imageResults});
        } else {
          //If the credentials don't match up, render the loginWrong ejs to ask again.
          res.render('loginWrong.ejs')
		  	}	
		});
    }
  });
	} else {
    res.render('loginWrong.ejs')
	} 
});

//Render profile displaying the user's name and pictures only they have uploaded.
  app.get("/profile", function(req, res) {
  req.session.loggedin = true;
  con.query(`SELECT * FROM users WHERE username = ?`, [sessionData], function(err, results) {
    if (err) {
      res.send("A database error occurred: "+err);
     } else { 
  con.query(`SELECT * FROM images WHERE username = ?`, [sessionData], function(err, imageResults) {
    if (err) {
      res.send("A database error occurred: "+err);
    } else {
  res.render('profile.ejs', {"username": sessionData, "users": results, 'images': imageResults});
    }
  });
  } 
 });
});

//alter account details page
app.get("/alter", function (req, res) {
  sessionData = req.session.username;
  res.render("editProfile.ejs", {"username": sessionData, "data": "/profile", "name": "Profile"});
});

//deleat session data upon logout button being pressed.
app.get("/logout", function(req, res) {
  req.session.loggedin = false;
  req.session.destroy();
  res.redirect("/");
});

//sign up page for new users
app.get("/SignUp", function(req, res) {
	req.session.loggedin = false;
	res.render('signUp.ejs');
});

//uploade image page.
app.get("/upload", function (req, res){
  sessionData = req.session.username;
  res.render('upload.ejs', {"username": sessionData});
});

//page for specific images to show all their details.
app.get("/:imageLink", function(req,res) {
  var imageID = req.params.imageLink;
  //when logged in.
  if(sessionData){
      con.query('SELECT * FROM comments WHERE imageID = ?', [imageID], function(err, commentResults, fields) {
        if (err) {
          res.send("A database error occurred: "+err);
      } else {
      con.query('SELECT * FROM images WHERE imageLink = ?', [imageID], function(err, imageResults, fields) {
        if (err) {
          res.send("A database error occurred: "+err);
        } else{
      con.query(`SELECT * FROM likes WHERE imageID = ?`, [imageID], function(err, likeResults) {
        if (err) {
          res.send("A database error occurred: "+err);
        } else{
      res.render("imageViewer.ejs", {"data": "profile", "name": "Profile", "imageLink": imageID, "comments": commentResults, "imageDetails": imageResults, "likes": likeResults.length});
        }
      });
      }
    });
    }
  });
  //when not logged in.
  }else{
      con.query('SELECT * FROM comments WHERE imageID = ?', [imageID], function(err, commentResults, fields) {
        if (err) {
          res.send("A database error occurred: "+err);
        } else {
      con.query('SELECT * FROM images WHERE imageLink = ?', [imageID], function(err, imageResults, fields) {
        if (err) {
          res.send("A database error occurred: "+err);
        } else {
      con.query(`SELECT * FROM likes WHERE imageID = ?`, [imageID], function(err, likeResults) {
        if (err){
          res.send("A database error occurred: "+err);
        } else {
      res.render("imageViewer.ejs", {"data": "login", "name": "Log In!", "imageLink": imageID, "comments": commentResults, "imageDetails": imageResults,  "likes": likeResults.length});
        }
      });
    }
    });
  }
  });
  }
 });

//posting for account creation page.
app.post('/Register', function (req, res) {
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    //query that checks if username has already been used in the database
    con.query("SELECT * FROM users WHERE username = ?", [username], function(err, usernameResult){
    if(usernameResult.length > 0) {
      res.render("signUpWrong.ejs");
    } else {
    //now that we know the username has not been used, lets insert all the data into the table.
    var sql = "INSERT INTO users (firstname, lastname, username, password) VALUES ('" +firstName+ "','" +lastName+ "', '" +username+ "', '" +password+"')";
    req.session.username = username;
    sessionData = req.session.username;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 user inserted into database");
    });
    res.render('signUpComplete.ejs', { "username": sessionData});
    }
  });
  }
});

//uploading image to sql database through an app.post submition. 
app.post("/upload", function (req, res) {
  var file = req.files.myimage;
  sessionData = req.session.username;
  var current = new Date();
  var date = current.toLocaleDateString();
  var caption = req.body.caption;
  file.mv("static/uploadedFiles/" + file.name );
  var sql = "INSERT INTO images (imageLink, username, date, caption) VALUES ( '" +file.name+ "', '" +sessionData+"', '" +date+"', '" +caption+"')";
  con.query(sql, function (err) {
    if (err) throw err;
    console.log("1 image uploaded");
  });
    con.query('SELECT * FROM comments WHERE imageID = ?', [file.name], function(err, commentResults, fields) {
      if (err) {
        res.send("A database error occurred: "+err);
      } else {
    con.query('SELECT * FROM images WHERE imageLink = ?', [file.name], function(err, imageResults, fields) {
      if (err) {
        res.send("A database error occurred: "+err);
      } else {
    con.query(`SELECT * FROM likes WHERE imageID = ?`, [file.name], function(err, likeResults) {
      if (err) {
        res.send("A database error occurred: "+err);
      } else {
        res.render("imageViewer.ejs", {"data": "profile", "name": "Profile", "imageLink": file.name, "comments": commentResults, "imageDetails": imageResults, "likes": likeResults.length});
      }
    });
  }
  });
}
});
});

//posting a like made by user
app.post("/like", function (req, res) {
  sessionData = req.session.username;
  var imageID = req.query.imageID;
  //if they are logged in:
  if (sessionData){
    con.query(`SELECT * FROM likes WHERE imageID = ?`, [imageID], function(err, likeResults) {
      if (err) {
        res.send("A database error occurred: "+err);
      } else {
        con.query('SELECT * FROM likes WHERE imageID = ? AND username = ?', [imageID, sessionData], function(err, results, fields) {
        if (results.length > 0) {
        console.log(sessionData+ " already Liked "+ imageID);
        //string will be sent to ajax and lead to an alert informing the user they have already liked the image.
        res.json(("alreadyLiked"));
      }
      else {
        var sql = "INSERT INTO likes (username, imageID) VALUES ( '" +sessionData+ "', '" +imageID+ "' )";
        con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(sessionData + " liked "+ imageID);
        //sending new like amount to AJAX to allow for live update on screen.
        res.json(likeResults.length + 1);
    });
    }
    });
    }
    });
    }
  //if they are not logged in
  else {
    con.query(`SELECT * FROM likes WHERE imageID = ?`, [imageID], function(err, likeResults) {
      if (err) {
        res.send("A database error occurred: "+err);
      } else {
        //string will be sent to AJAX and lead to login page being loaded.
        res.json(("noSessiondata"));
      }
    });
 }
}); 

//posting comments made by user.
app.post("/comment", function (req, res) {
  sessionData = req.session.username;
  var imageID = req.body.imageID;
  var comment = req.body.comment;
  if (sessionData){
  var sql = "INSERT INTO comments (imageID, username, comments) VALUES ( '" +imageID+ "', '" +sessionData+ "', '" +comment+ "')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(sessionData + " wrote a comment on "+ imageID);
    con.query('SELECT * FROM comments WHERE imageID = ?', [imageID], function(err, commentResults, fields) {
      if (err) {
        res.send("A database error occurred: "+err);
      }else{
      con.query('SELECT * FROM images WHERE imageLink = ?', [imageID], function(err, imageResults, fields) {
        if (err) {
          res.send("A database error occurred: "+err);
        }else{
      con.query(`SELECT * FROM likes WHERE imageID = ?`, [imageID], function(err, likeResults) {
        if (err) {
          res.send("A database error occurred: "+err);
        }else
      res.render("imageViewer.ejs", {"data": "profile", "name": "Profile", "imageLink": imageID, "comments": commentResults, "imageDetails": imageResults, "likes": likeResults.length});
      });
    }
    });
  }
  });
});
  }
  else {
      res.render("login.ejs");
  }
}); 

//posting account alterations made by user.
app.post("/alter", function (req, res){
  sessionData = req.session.username;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var password = req.body.password;
  var sql = "UPDATE `users` SET firstname='" +firstName+ "', lastname='" +lastName+ "', password='" +password+ "' WHERE username=?"
  con.query(sql,[sessionData], function(err){
    if (err) {
      res.send("A database error occurred: "+err);
    } else{
      res.render('signUpComplete.ejs', { "username": sessionData});
    }
  });
});

//Terminal dialogue for the programmer to make sure SQL is connected.
con.connect(function(err) {
  if (err)
  console.log("Error connecting to Database "+ err);
  else
  console.log("Connected to Database");
  });

//Start the server
app.listen(port);
console.log("Server running on http://localhost:" + port);
