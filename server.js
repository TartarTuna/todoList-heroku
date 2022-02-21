const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandler = require('./errorHandler.js');

const todoList = [];

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Control-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
    'Content-Type': 'application/json'
  };

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': todoList
    }));
    res.end();
  } else if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;

        if (title !== undefined) {
          const newTodo = {
            'title': title,
            'id': uuidv4()
          };
          todoList.push(newTodo);

          res.writeHead(200, headers);
          res.write(JSON.stringify({
            'status': 'success',
            'data': todoList
          }));
          res.end();
        } else {
          errorHandler(res);
        };
      } catch {
        errorHandler(res);
      }
    });
  } else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
    req.on('end', () => {
      try {
        const newTitle = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const index = todoList.findIndex(item => item.id === id);

        if (newTitle !== undefined && index !== -1) {
          todoList[index].title = newTitle;
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            'status': 'success',
            'data': todoList
          }));
          res.end();
        } else {
          errorHandler(res);
        };
      } catch {
        errorHandler(res);
      }
    });
  } else if (req.url === '/todos' && req.method === 'DELETE') {
    todoList.length = 0;
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': todoList
    }));
    res.end();
  } else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const index = todoList.findIndex(item => item.id === id);

    if (index !== -1) {
      todoList.splice(index, 1);
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        'status': 'success',
        'data': todoList
      }));
      res.end();
    } else {
      errorHandler(res);
    }
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      'status': 'false',
      'message': 'route not found'
    }));
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 8084);