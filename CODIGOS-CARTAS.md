# Desbloqueio de cartas por código

## Como funciona
- A página Cartas de Poder agora tem a aba **Desbloquear com código**.
- Um código válido libera uma carta específica (AULA, MENTOR ou DICA) para o participante conectado.
- Cada código só pode ser resgatado uma vez. O mesmo participante não pode desbloquear o mesmo tipo de carta duas vezes.
- O backend também verifica o desbloqueio antes de permitir o uso da carta.

## Atualizar banco existente
Na pasta `backend`, configure seu `.env` a partir de `.env.example` e rode:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

`prisma db push` adiciona as novas tabelas `CodigoCarta` e `CartaDesbloqueio` ao SQLite existente sem apagar os registros atuais.

## Gerar um código para entregar a um participante
Entre como ADMIN ou MONITOR e faça uma requisição `POST` para `http://localhost:3333/cartas/codigos`, enviando os headers `x-participante-id` e `x-papel` da sessão administrativa e um JSON com o tipo da carta.

Exemplo de corpo:

```json
{ "tipo": "MENTOR" }
```

Tipos aceitos: `AULA`, `MENTOR`, `DICA`.

A resposta inclui o código gerado, por exemplo `ABCDE-FG234`. Entregue o código ao participante. **Guarde-o antes de fechar a resposta**, pois ele não é mostrado novamente por uma tela administrativa neste momento.

## Endpoints
- `GET /cartas/desbloqueadas` — lista os desbloqueios do participante conectado.
- `POST /cartas/desbloquear` — recebe `{ "codigo": "ABCDE-FG234" }` e resgata o código.
- `POST /cartas/codigos` — ADMIN/MONITOR gera um código, recebendo `{ "tipo": "AULA" }`.

> Nota de segurança: a autorização do projeto ainda se baseia nos cabeçalhos `x-participante-id` e `x-papel`, que podem ser falsificados por clientes. Antes de publicar o sistema na internet, substitua esse mecanismo por autenticação de servidor (por exemplo, sessão segura ou JWT validado).
