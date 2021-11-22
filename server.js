const net = require("net");
const clients = [];
const PORT = 8888;
net
  .createServer(function (socket) {
    socket.setEncoding("utf8");

    const pos = clients.length;
    clients.push(socket);

    if (clients.length <= 4) {
      socket.on("data", function (data) {
        const dataSplitted = data.split(" ");
        switch (dataSplitted[0]) {
          case "/USUARIOS":
            console.log("Lista de usuários:");
            clients.forEach((client) => console.log("- " + client.nick));
            break;

          case "/NICK":
            if (isNickRepeated(dataSplitted[1]))
              socket.write("Nick já existente");
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
            socket.write("Aviso: Você encerrou a conexão!");
            sendAlert(
              clients[pos],
              `O usuário ${clients[pos].nick} se desconectou do chat`
            );
            clients[pos] = null;
            socket.destroy();
            break;

          default:
            if (clients[pos].nick !== undefined)
              sendMessage(clients[pos], data);
            else
              socket.write(
                "Aviso: Você precisar informar um apelido válido! (Use /NICK {nick} para atualizar seu apelido) "
              );
            break;
        }
      });

      socket.on("close", function () {
        sendAlert(
          clients[pos],
          `Aviso: O usuário ${clients[pos].nick} se desconectou do chat`
        );
        console.log(clients[pos].nick + " se desconectou");
        clients.splice(clients.indexOf(socket), 1);
      });
    } else {
      socket.write(
        "Aviso: Erro ao conectar ao servidor. O máximo de usuários (4) foi atingido"
      );
      clients[pos] = null;
      socket.destroy();
    }
  })
  .listen(PORT);

function sendMessage(from, message) {
  const msg = from !== undefined ? `${from.nick}: ${message}` : message;
  clients.forEach(function (incoming_socket) {
    if (incoming_socket !== from && incoming_socket !== null) {
      incoming_socket.write(msg);
    }
  });
}

function sendAlert(from, message) {
  clients.forEach((client) => {
    if (client !== from) client.write(`Aviso: ${message}`);
  });
}

function isNickRepeated(nick) {
  let repeated = false;
  clients.forEach((client) => {
    if (client.nick === nick) repeated = true;
  });
  return repeated;
}
