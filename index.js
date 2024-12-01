const express = require("express");
const ejs = require("ejs");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, "public")));
app.set("view", path.join(__dirname, "public"));
app.engine("html", ejs.renderFile);

app.use("/", (req, res) => {
  res.render("index.html");
});

// Conectando ao MongoDB (Criação ou uso do banco de dados)
mongoose
  .connect("mongodb+srv://marianalima:password@cluster0.qduzk.mongodb.net/chatDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conectado ao MongoDB");
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB:", err);
  });

// Definir o esquema e modelo de mensagem
const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

io.on("connection", (socket) => {
  console.log("Novo usuário conectado! " + socket.id);

  // Recuperar e enviar as mensagens do banco de dados
  Message.find().then((messages) => {
    socket.emit("previousMessage", messages);  // Envia as mensagens salvas para o frontend
  });

  // Disparar ações quando recebe as mensagens do frontend
  socket.on("sendMessage", (data) => {
    // Verifique se 'user' e 'message' estão sendo passados corretamente
    console.log("Usuário:", data.user);
    console.log("Mensagem:", data.message);

    // Criar um novo documento de mensagem
    const newMessage = new Message({
      user: data.user,
      message: data.message,
    });

    // Salvar a mensagem no banco de dados
    newMessage
      .save()
      .then(() => {
        console.log("Mensagem salva no banco de dados!");
        
        // Emitir a mensagem para todos os outros usuários, mas não para o remetente
        socket.broadcast.emit("newMessage", data);  // Emitir para todos, exceto o remetente
      })
      .catch((err) => {
        console.error("Erro ao salvar a mensagem:", err);
      });
  });
});

server.listen(3000, () => {
  console.log("listening on port 3000");
});
