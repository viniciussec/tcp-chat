const net = require("net");
const clients = [];
const PORT = 8888;
net
  .createServer(function (socket) {
    socket.setEncoding("utf8");

    const pos = clients.length;
    clients.push(socket);

    if (clientsLength(clients) <= 4) {
      socket.on("data", function (data) {
        data = JSON.parse(data.toString()).message;
        const dataSplitted = data.split(" ");
        switch (dataSplitted[0]) {
          case "/USUARIOS":
            let string = "";
            string += "Lista de usuários:\n";
            clients.forEach((client) => {
              if (client !== null) string += "- " + client.nick + "\n";
            });
            socketWrite(string, socket);
            break;

          case "/NICK":
            if (isNickRepeated(dataSplitted[1]))
              socketWrite("Nick já existente", socket);
            else {
              if (clients[pos].nick !== undefined)
                sendMessage(
                  undefined,
                  `Aviso: O usuário ${clients[pos].nick} alterou seu apelido para ${dataSplitted[1]}`
                );
              else
                sendAlert(
                  clients[pos],
                  `O usuário ${dataSplitted[1]} se conectou`
                );
              clients[pos].nick = dataSplitted[1];
              console.log("Novo nick: " + clients[pos].nick);
            }
            break;

          case "/SAIR":
            socketWrite("Aviso: Você encerrou a conexão!", socket);
            socket.destroy();
            break;

          default:
            if (clients[pos].nick !== undefined)
              sendMessage(clients[pos], data);
            else
              socketWrite(
                "Aviso: Você precisar informar um apelido válido! (Use /NICK {nick} para atualizar seu apelido) ",
                socket
              );
            break;
        }
      });

      socket.on("close", function () {
        sendAlert(
          clients[pos],
          `O usuário ${clients[pos].nick} se desconectou do chat`
        );
        console.log(clients[pos].nick + " se desconectou");
        clients[pos] = null;
      });
    } else {
      socketWrite(
        "Aviso: Erro ao conectar ao servidor. O máximo de usuários (4) foi atingido",
        socket
      );
      clients[pos] = null;
      socket.destroy();
    }
  })
  .listen(PORT);

function sendMessage(from, message) {
  const msg =
    from !== undefined
      ? Buffer.from(JSON.stringify({ message: `${from.nick}: ${message}` }))
      : Buffer.from(JSON.stringify({ message: message }));
  clients.forEach(function (incoming_socket) {
    if (incoming_socket !== from && incoming_socket !== null) {
      incoming_socket.write(msg);
    }
  });
}

function sendAlert(from, message) {
  clients.forEach((client) => {
    if (client !== from && client !== null)
      client.write(
        Buffer.from(JSON.stringify({ message: `Aviso: ${message}` }))
      );
  });
}

function isNickRepeated(nick) {
  let repeated = false;
  clients.forEach((client) => {
    if (client !== null && client.nick === nick) repeated = true;
  });
  return repeated;
}

function socketWrite(msg, socket) {
  socket.write(Buffer.from(JSON.stringify({ message: msg })));
}

function clientsLength(array) {
  let length = 0;
  array.forEach((client) => {
    if (client !== null) length++;
  });
  return length;
}
