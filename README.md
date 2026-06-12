# API Cadastro de Veículos

API REST simples para gerenciar veículos e usuários (veículos, usuários, autenticação com JWT e refresh tokens).

## Rápido (setup)
1. npm install
2. crie um arquivo `.env` com as variáveis (exemplo abaixo)
3. npm run dev

## Variáveis de ambiente (.env)
- MONGODB_URI=mongodb://localhost:27017/api_cadastro_veiculos
- JWT_SECRET=uma_chave_forte_para_dev (ou use AWS Secrets Manager em produção)
- NODE_ENV=development
- Opcional para AWS Secrets Manager:
  - AWS_REGION
  - JWT_SECRET_NAME

## Scripts
- npm start — inicia o app
- npm run dev — inicia com nodemon (desenvolvimento)

## Endpoints principais
- GET /health - para testes
- POST /users — registrar (gera access token + refresh token cookie)
- POST /users/login — autenticar (gera access + refresh)
- GET /users, GET /users/:id, PUT /users/:id, DELETE /users/:id
- POST /auth/refresh — troca refresh token por novo access token
- POST /auth/logout — revoga refresh token e limpa cookie
- CRUD de veículos em /veiculos (GET protegido por token)

## Autenticação
- Access token: JWT curto (1h) enviado em Authorization: Bearer <token>
- Refresh token: token longo enviado como cookie HttpOnly; armazenado somente o hash no banco e rotacionado no /auth/refresh

## Principais bibliotecas usadas
- express — servidor HTTP
- mongoose — ODM MongoDB
- joi — validação de payloads
- bcryptjs — hashing de senhas
- jsonwebtoken — criação/validação de JWTs
- cookie-parser — leitura de cookies (refresh tokens)
- @aws-sdk/client-secrets-manager — integração opcional com AWS Secrets Manager
- dotenv — carregamento de .env
- nodemon — desenvolvimento
- chalk — logs coloridos

## Segurança e notas
- Não commite o `.env` no repositório
- Em produção, armazene secrets em um secrets manager (AWS Secrets Manager, Vault)
- Use HTTPS em produção (cookies secure)
- Senhas são hasheadas com bcrypt; refresh tokens são hasheados antes de persistir

## Changelog
Ver `CHANGELOG.md` para detalhes das mudanças recentes (implementação de refresh tokens, secrets manager, logout, etc.).

Contribuições: PRs e issues são bem-vindas. Para dúvidas ou ajuda, abra uma issue ou pergunte no repositório.
