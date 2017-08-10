var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('TODO API root');
});

app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};
	if(query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if(query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%'+query.q+'%'
		};
	}
	db.todo.findAll({where: where}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	})
});

app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    db.todo.findById(todoId).then(function(todo) {
    	if(todo) {
    		res.json(todo.toJSON());
    	} else {
    		res.status(404).send();
    	}
    }, function (e) {
    	res.status(505).send();
    }
    );

});


app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
    db.todo.create(body).then(function(todo) {
    	res.json(todo.toJSON())
    }, function(e) {
    	res.status(404).json(e);
    });

})
 
app.put('/todos/:id', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

})

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	if (!matchedTodo) {
		res.status(404).json({
			"error": "NO matched todo"
		});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}
})

db.sequelize.sync().then(function() {

	app.listen(PORT, function() {
	console.log('Express listening on port' + PORT + " ");
})
})

