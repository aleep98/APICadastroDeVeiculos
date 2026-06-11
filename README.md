# 🚗 API Cadastro de Veículos

API REST para cadastro e gerenciamento de veículos com autenticação de usuários.

## 🚀 Quick Start

### 1. Instalação de Dependências

```bash
npm install
npm run setup
npm install dotenv joi
```

### 2. Configuração do Banco de Dados

Certifique-se de que o MongoDB está rodando localmente ou ajuste a `MONGODB_URI` no `.env`:

```bash
# .env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/api-cadastro-veiculos
```

### 3. Iniciar o Servidor

**Desenvolvimento (com hot reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor iniciará na porta `3000` (ou conforme configurado).

---

## 📚 Documentação da API

### Baseado em:
- **URL Base:** `http://localhost:3000`
- **Formato de Resposta:** JSON
- **Autenticação:** Não implementada (próxima fase)

---

## 🚗 Endpoints - Veículos

### Listar Todos os Veículos
```http
GET /veiculos
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "placa": "ABC1234",
      "modelo": "Civic",
      "cor": "Azul",
      "ano": 2022,
      "proprietario": "João Silva",
      "createdAt": "2025-06-11T16:30:00Z",
      "updatedAt": "2025-06-11T16:30:00Z"
    }
  ]
}
```

### Obter Veículo por ID
```http
GET /veiculos/:id
```

### Criar Novo Veículo
```http
POST /veiculos
Content-Type: application/json

{
  "placa": "ABC1234",
  "modelo": "Civic",
  "cor": "Azul",
  "ano": 2022,
  "proprietario": "João Silva"
}
```

**Validação:**
- `placa`: String obrigatória, deve ser única
- `modelo`: String obrigatória
- `cor`: String obrigatória
- `ano`: Número obrigatório (1900 - ano atual + 1)
- `proprietario`: String obrigatória

### Atualizar Veículo
```http
PUT /veiculos/:id
Content-Type: application/json

{
  "placa": "ABC1234",
  "modelo": "Accord",
  "cor": "Preto",
  "ano": 2023,
  "proprietario": "Maria Santos"
}
```

### Deletar Veículo
```http
DELETE /veiculos/:id
```

---

## 👤 Endpoints - Usuários

### Listar Todos os Usuários
```http
GET /users
```

### Obter Usuário por ID
```http
GET /users/:id
```

### Criar Novo Usuário
```http
POST /users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Validação:**
- `name`: String obrigatória
- `email`: Email válido e único
- `password`: Mínimo 6 caracteres

### Atualizar Usuário
```http
PUT /users/:id
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "password": "novasenha123"
}
```

### Deletar Usuário
```http
DELETE /users/:id
```

---

## 📁 Estrutura do Projeto

```
api-cadastro-veiculos/
├── src/
│   ├── config/
│   │   └── database.js           # Conexão MongoDB
│   ├── controllers/
│   │   ├── usuarioExiste.js
│   │   └── veiculoExiste.js
│   ├── middleware/
│   │   ├── errorHandler.js       # Tratamento global de erros
│   │   └── validation.js         # Validação de schemas
│   ├── models/
│   │   ├── User.js
│   │   └── Veiculo.js
│   ├── routes/
│   │   ├── users.routes.js
│   │   └── veiculos.routes.js
│   ├── services/
│   │   ├── user.service.js       # Lógica de negócio
│   │   └── veiculo.service.js
│   └── index.js                  # Setup da aplicação
├── server.js                     # Entry point
├── package.json
├── .env                          # Variáveis de ambiente
├── .gitignore
└── README.md
```

---

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework Web
- **MongoDB** - Banco de Dados
- **Mongoose** - ODM MongoDB
- **Joi** - Validação de Schemas
- **Chalk** - Colorização de logs
- **Dotenv** - Gerenciamento de variáveis de ambiente
- **Nodemon** - Auto-reload em desenvolvimento

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/api-cadastro-veiculos
```

---

## 🔄 Tratamento de Erros

Todos os erros são capturados globalmente e retornam JSON:

```json
{
  "success": false,
  "error": {
    "message": "Descrição do erro",
    "status": 400
  }
}
```

**Códigos de Status:**
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

---

## 🧪 Testando a API

Use Postman, Insomnia ou curl:

```bash
# Criar veículo
curl -X POST http://localhost:3000/veiculos \
  -H "Content-Type: application/json" \
  -d '{"placa":"ABC1234","modelo":"Civic","cor":"Azul","ano":2022,"proprietario":"João"}'

# Listar veículos
curl http://localhost:3000/veiculos

# Criar usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@example.com","password":"senha123"}'
```

---

## 🔧 Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar hash de senha (bcrypt)
- [ ] Testes unitários e de integração
- [ ] Documentação com Swagger/OpenAPI
- [ ] Logs estruturados
- [ ] Rate limiting
- [ ] CORS configurado

---

## 📝 Licença

ISC

---

## 🤝 Contribuindo

Sinta-se à vontade para fazer PR ou abrir issues!
