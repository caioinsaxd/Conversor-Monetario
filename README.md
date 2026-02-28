# Conversor Monetário

API REST em Node.js para conversão de moedas em tempo real, com autenticação, cache e validação de dados.

---

## Features

- Conversão de moedas via cotação em tempo real (AwesomeAPI);
- Autenticação por API Key e JWT;
- Cache com TTL configurável para evitar requisições desnecessárias à API externa;
- Validação de entrada com Zod;
- Tratamento de erros;
- Testes unitários e de integração;
- Documentação interativa com Swagger/OpenAPI;

---

## Instalação

```bash
# 1.Instalar dependências
npm install

# 2.Configurar env
cp .env.example .env

# 3.Iniciar o servidor
npm start
```

---

## Autenticação

A API suporta dois métodos de autenticação:

**API Key** — informe sua chave no header `Authorization`:

```
Authorization: Bearer seu_api_key
```

**JWT** — gere um token e utilize da mesma forma:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/token | jq -r '.token')
```

---

## Endpoints

### `POST /api/convert`

Converte um valor de uma moeda para outra.

**Headers**

| Header          | Valor                        |
|-----------------|------------------------------|
| Content-Type    | application/json             |
| Authorization   | Bearer `<token_ou_api_key>`  |

**Body**

```json
{
  "fromCurrency": "USD",
  "toCurrency": "BRL",
  "value": 100
}
```

**Resposta**

```json
{
  "data": {
    "fromCurrency": "USD",
    "toCurrency": "BRL",
    "value": 100,
    "convertedValue": 550.00,
    "rate": 5.5,
    "source": "AwesomeAPI",
    "timestamp": "2024-02-20T10:30:45.123Z"
  },
  "metadata": {
    "timestamp": "2024-02-20T10:30:45.123Z",
    "apiVersion": "1.0.0"
  }
}
```

O campo `source` indica se o dado veio da API (`"AwesomeAPI"`) ou do cache (`"cache"`).

---

## Exemplos com cURL

**API Key**

```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_api_key" \
  -d '{
    "fromCurrency": "USD",
    "toCurrency": "BRL",
    "value": 100
  }'
```

**JWT**

```bash
#Gerar token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/token | jq -r '.token')

#Realizar conversão
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fromCurrency": "USD",
    "toCurrency": "BRL",
    "value": 100
  }'
```

## Exemplos com postman

**Gerando token no postman**


![Gerando token no postman](docs/auth_token.png)


**Colocando token no bearer**


![Colocando token no bearer](docs/token_apply.png)


**Realizar conversão**


![Realizar conversão](docs/converter.png)


---

## Testes

```bash
#Todos os testes
npm test

#Apenas unitário
npm run test:unit

#Apenas integração
npm run test:integration

#Com relatório de cobertura
npm test -- --coverage
```

---

## Lint

```bash
npm run lint
npm run lint:fix
```

---

## Documentação Interativa (Swagger)

A API possui documentação interativa via Swagger UI (disponível apenas em desenvolvimento):

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

---

## Arquitetura

```
src/
├── config/                     # Configurações da aplicação;
├── data-access/                # Cache e integração com API externa;
├── domain/                     # Lógica de negócio;
│   ├── services/               # Serviços de conversão e cotação;
│   └── validators/             # Validação de dados com Zod;
├── entry-points/               # Pontos de entrada da API;
│   ├── api/                    # Controllers e rotas;
│   └── middleware/             # Middlewares de autenticação e erros;
├── utils/                      # Erros customizados;
├── swagger.js                  # Configuração do Swagger;
├── app.js                      # Configuração do Express;
└── index.js                    # Entry point da aplicação;
```