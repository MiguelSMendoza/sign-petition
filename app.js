var express = require('express');
var app = express();
var mongodb = require('mongodb');
var assert = require('assert');
var bodyParser = require('body-parser');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
var url = 'mongodb://localhost:27017/test';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/Form', express.static(__dirname + '/public'));

var insertSign = function(db, sign, callback) {
	db.collection('sign').insertOne( {
		"nif" : sign.nif,
		"name" : sign.name,
		"surname" : sign.surname,
		"cause" : sign.cause
	}, function(err, result) {
		assert.equal(err, null);
		console.log("Inserted a sign into the signs collection.");
		callback(result);
	});
};

app.post('/Sign', function (req, res) {
	var s = {};
	s.nif = req.body.nif;
	s.name = req.body.name;
	s.surname = req.body.surname;
	s.cause = req.body.cause;
	MongoClient.connect(url, s, function(err, db) {
		assert.equal(null, err);
		insertSign(db, s, function() {
			res.send({"error": "", "errorcode": 0});
			db.close();
		});
	});
});

app.get('/SignList', function(req, res) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		findSigns(db, function(result) {
			res.send(result);
			db.close();
		});
	});
});

var findSigns = function(db, callback) {
	db.collection('sign').aggregate(
		[
			{ 
				$group: { 
					_id: "$nif", 
					nombre: {"$first": "$name"}, 
					apellidos:{"$first": "$surname"}, 
					causa:{"$first": "$cause"} 
				}
			}
		]
	).toArray(function(err, result) {
		assert.equal(err, null);
		console.log(result);
		callback(result);
	});
};

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send({
		message: err.message,
		error: {}
	});
});
