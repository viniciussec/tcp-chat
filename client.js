const readline = require("readline");
const net = require("net");
const client = new net.Socket();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const config = {
  ip: "",
  port: "",
  nickname: "",
};

rl.question("Qual o comando? ", function (command) {
  if (command === "/ENTRAR") {
    rl.question("Informe o IP: ", function (ip) {
      config.ip = ip;
      rl.question("Informe a porta: ", function (port) {
        config.port = port;
        rl.question("Informe seu apelido: ", function (nickname) {
          config.nickname = nickname;
          clientConnected(config);
        });
      });
    });
  } else {
    rl.write("Você precisa entrar antes de mandar mensagens!");
  }
});

function clientConnected(config) {
  process.stdin.setEncoding("utf8");
  process.stdin.resume();
  client.connect({ host: config.ip, port: config.port }, function () {
    console.log("Aviso: Você se conectou ao servidor");
  });
  send("/NICK " + config.nickname);
  let string = "";
  process.stdin.on("data", function (data) {
    if (data !== "\r") string += data;
    else {
      send(string);
      string = "";
    }
  });

  client.on("data", function (data) {
    console.log(String(data));
  });

  function send(msg) {
    client.write(msg);
  }
}
