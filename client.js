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
          connectClient(config);
        });
      });
    });
  } else {
    rl.write("Você precisa entrar antes de mandar mensagens!");
  }
});

function connectClient(config) {
  client.setEncoding("utf8");
  try {
    client.connect({ host: config.ip, port: config.port }, function () {
      console.log("Aviso: Você se conectou ao servidor");
    });
  } catch (e) {
    console.log("Erro ao conectar ao servidor: \n" + e);
  }

  send(`/NICK ${config.nickname}`);

  rl.on("line", (input) => {
    send(input);
  });

  client.on("data", function (data) {
    console.log(JSON.parse(data.toString()).message);
  });

  client.on("close", function (data) {
    process.exit();
  });

  function send(msg) {
    client.write(Buffer.from(JSON.stringify({ message: msg })));
  }
}
