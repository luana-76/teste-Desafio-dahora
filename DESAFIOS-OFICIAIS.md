# Desafios oficiais — Desafio Dahora

A plataforma contém 36 desafios oficiais, 12 por dia, com títulos, descrições e instruções informados para o evento.

O `backend/prisma/seed.js` sincroniza os desafios pelo número: atualiza títulos, categorias, descrições e instruções em bancos já existentes, sem alterar status, horários, avaliações ou cartas registradas.

## Aplicar as alterações

Na pasta `backend`, execute:

```bash
npx prisma generate
npm run prisma:seed
```

O arquivo `backend/.env` precisa conter `DATABASE_URL`. Não é necessário executar `prisma db push` para esta atualização, pois o schema não mudou.

## Perfil da Organização

O widget de troféu/pontuação de equipe fica oculto para contas administrativas e para contas identificadas como Organização pelo nome ou e-mail.
