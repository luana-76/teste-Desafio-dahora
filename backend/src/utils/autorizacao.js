// Autorização por papel — seção 15 do documento (Participante / Monitor /
// Administrador). Não existe um sistema de login com token nesta versão do
// desafio, então o cliente se identifica em cada requisição sensível
// enviando os headers "x-participante-id" e "x-papel" (preenchidos pelo
// front-end a partir da sessão local, logo depois do login).
//
// Isso NÃO é um mecanismo de segurança para produção — é o suficiente para
// impedir que a interface de um Participante comum consiga, por engano ou
// de propósito, chamar rotas administrativas (criar/editar desafios,
// lançar avaliações, gerenciar equipes e monitores). Se um dia este
// projeto ganhar autenticação de verdade (JWT, sessão no servidor etc.),
// basta trocar a leitura do header por essa fonte confiável aqui dentro.

export const PAPEIS = ['PARTICIPANTE', 'MONITOR', 'ADMIN'];

export function identificarUsuario(req, res, next) {
  req.usuario = {
    id: req.header('x-participante-id') || null,
    papel: (req.header('x-papel') || 'PARTICIPANTE').toUpperCase(),
  };
  next();
}

// Uso: router.post('/desafios', somentepapel('ADMIN'), controller.store)
export function somentePapel(...papeisPermitidos) {
  return (req, res, next) => {
    const papel = req.usuario?.papel;
    if (!papeisPermitidos.includes(papel)) {
      return res.status(403).json({
        error: `Ação restrita a: ${papeisPermitidos.join(', ')}. Seu papel atual é ${papel || 'desconhecido'}.`,
      });
    }
    next();
  };
}
