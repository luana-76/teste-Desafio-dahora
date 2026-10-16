# Atualização do painel da Organização e dos desafios

## O que mudou
- O widget de troféu/pontuação/posição da equipe não é exibido para contas com papel `ADMIN`, pois esse perfil representa a Organização.
- Os 36 desafios foram atualizados conforme o roteiro enviado: 12 desafios em cada um dos três dias.
- Cada desafio inclui título, categoria, descrição e instruções/entrega quando aplicável.
- O seed agora atualiza os desafios existentes por número, preservando status, horários, avaliações e cartas vinculadas.

## Como aplicar no banco existente
Na pasta `backend`, execute:

```bash
npx prisma generate
npm run prisma:seed
```

Se a variável `DATABASE_URL` ainda não estiver configurada, crie o arquivo `backend/.env` com a URL do seu SQLite, por exemplo:

```env
DATABASE_URL="file:./dev.db"
```

O caminho `file:./dev.db` é relativo ao diretório do schema (`backend/prisma`), conforme a configuração atual.

> O seed também executa outras rotinas existentes do projeto, incluindo a configuração das contas administrativas e dados de equipes de teste. Faça uma cópia do arquivo SQLite antes de executar em um banco com dados importantes.
