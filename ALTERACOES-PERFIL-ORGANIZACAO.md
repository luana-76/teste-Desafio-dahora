# Perfil da Organização e senha administrativa

- O perfil ADMIN não exibe equipe, pontos de equipe, posição no ranking de equipes ou desafios concluídos pela equipe.
- As contas administrativas são desvinculadas de qualquer equipe.
- Ao executar o seed, as duas contas institucionais recebem a senha `L13A10@`.

## Aplicar as alterações

Na pasta `backend`, execute:

```bash
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

Credenciais administrativas configuradas pelo seed:
- `organizacao@desafiodahora.com`
- `adminLMA2026@senac.br`

O seed também corrige contas antigas que usavam o e-mail incorreto `adminLMA2026@senac.br.com`.

Senha para ambas: `L13A10@`.

O seed atualiza as contas existentes, portanto execute `npm run prisma:seed` para aplicar a nova senha ao banco local atual. O arquivo `.env` é uma configuração local de SQLite; mantenha-o fora de repositórios públicos.
