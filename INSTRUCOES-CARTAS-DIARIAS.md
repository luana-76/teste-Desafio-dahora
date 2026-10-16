# Atualização — controle diário das cartas

## O que mudou
- O administrador não possui mais o formulário para registrar uma carta escolhendo uma equipe. A tela **Cartas** do administrador mostra o histórico geral em modo de consulta.
- O histórico lista data/horário, equipe, tipo de carta, desafio, responsável e tempo utilizado.
- Cada equipe pode usar uma carta de cada tipo (Aula, Mentoria e Dica) por dia, considerando o fuso `America/Recife`.
- A API rejeita uma segunda utilização do mesmo tipo no mesmo dia e o frontend do participante indica `JÁ USADA HOJE`.
- A restrição diária também é aplicada no backend e reforçada por uma chave única no banco.

## Aplicar a alteração no banco
Na pasta `backend`, com o arquivo `.env` configurado, execute:

```bash
npm install
npx prisma generate
npx prisma db push
```

Depois inicie o backend (`npm run dev`) e o frontend (`npm run dev` na pasta `frontend`). `db push` adiciona a nova coluna `diaUso` e a restrição única necessária.

## Observação
O administrador pode consultar todos os usos pela opção **Cartas** no menu. Monitores continuam podendo registrar o uso em nome de uma equipe, mas também estão sujeitos ao limite diário.
