# AccesssPoint-Controller
Repositório contento todo conteúdo relacionado ao servidor controlador, o qual é responsável por gerenciar os pontos de acesso (roteadores wireless) com o firmware OpenWrt instalado

<h2 align="center">Procedimentos para instalação</h2>

<h3 align="left">1 - Banco de dados</h3>

Primeiramente, configure um servidor de banco de dados Mysql e crie uma database.

Logo após, clone este repositório em sua máquina, acesse o repositório clonado e realize a importação do arquivo ./BD/controller.sql para a database criada.

<h3 align="left">2 - Node.js</h3>

Para que seja possível a instalação do controlador, é necessário que o servidor que estará rodando o serviço tenha o node.js instalado:
Link para instalação: https://nodejs.org/en/download/package-manager/

<h3 align="left">3 - Instalação e configuração do servidor controlador</h3>

Após as etapas acima, acesse a pasta raiz do projeto e crie o arquivo `.env`. Depois, insira
seus 'pares de chave'/'valor' no seguinte formato de `KEY = VALUE`:

```sh
#Development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=controller

# JWT
JWT_KEY=U6SD7ctbsw3gZK96A1UkUYi4GspAftSR

# API-BasicAuth-AP
AUTH_USER=teste
AUTH_KEY=12345678
```
Configurado as váriaveis ambiente, execute os seguintes comandos abaixo para finalizar a instalação e iniciar o contralador: 

```bash
# Acesse a pasta do projeto no terminal/cmd
$ cd AccesssPoint-Controller

# Instale as dependências
$ npm install

# Execute a aplicação em modo de desenvolvimento
$ npm start

# O servidor inciará na porta:3333 - acesse <http://localhost:3333>
```

### 🛠 Tecnologias utilizadas

As seguintes ferramentas foram usadas na construção do projeto:

- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/en/)
- [JsonWebToken](https://jwt.io/)
- [Mysql](https://www.mysql.com/)


