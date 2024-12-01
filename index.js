const express = require('express');
const ejs = require('ejs');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server)

app.use(express.static(path.join(__dirname, 'public')));
app.set('view', path.join(__dirname, 'public'));
app.engine('html', ejs.renderFile)

app.use('/', (req, res) => {
  res.render('index.html')
})

let messages = []

io.on('connection', socket => {
  console.log('Novo usuario conectado! ' + socket.id)

  /* recuperar e manter as mensagens do frontend para o backend */
  socket.emit('previousMessage', messages)

  /* dispara ações quando recebe as mensagens do frontend */
  socket.on("sendMessage", data => {
    
    // Adiciona a nova mensagem no final do array(messages)
    messages.push(data)
  
    // Propaga a mensagem para todos os usuarios conectados no chat
    socket.broadcast.emit('')
  
  })

})
server.listen(3000, () => {
  console.log('listening on port 3000');
})