import prisma from '../utils/prisma.js';
import { PAPEIS } from '../utils/autorizacao.js';

// Sem hashing de senha nesta versão do desafio (não é o foco do exercício
// e não há uma camada de segurança/HTTPS definida). Ainda assim, a senha
// nunca é devolvida nas respostas — ver `semSenha()`.
function semSenha(participante) {
  if (!participante) return participante;
  const { senha, ...resto } = participante;
  return resto;
}

function normalizarEmail(email = '') {
  return email.trim().toLowerCase();
}

export async function cadastrar({ nome, email, senha, papel }) {
  const nomeFinal = nome?.trim();
  const emailFinal = normalizarEmail(email);

  if (!nomeFinal) {
    const err = new Error('Digite seu nome.');
    err.status = 400;
    throw err;
  }
  if (!emailFinal) {
    const err = new Error('Digite seu e-mail.');
    err.status = 400;
    throw err;
  }
  if (!senha || senha.length < 4) {
    const err = new Error('A senha precisa de pelo menos 4 caracteres.');
    err.status = 400;
    throw err;
  }

  const existente = await prisma.participante.findUnique({ where: { email: emailFinal } });
  if (existente) {
    const err = new Error('Já existe uma conta com esse e-mail.');
    err.status = 409;
    throw err;
  }

  // Só participantes podem se auto-cadastrar; monitor/admin são promovidos
  // depois por um administrador (seção 15.3 "Gerenciar monitores").
  const papelFinal = PAPEIS.includes(papel) && papel !== 'ADMIN' ? papel : 'PARTICIPANTE';

  const participante = await prisma.participante.create({
    data: { nome: nomeFinal, email: emailFinal, senha, papel: papelFinal },
    include: { equipe: true },
  });

  return semSenha(participante);
}

export async function entrar({ email, senha }) {
  const emailFinal = normalizarEmail(email);
  const participante = await prisma.participante.findUnique({
    where: { email: emailFinal },
    include: { equipe: true },
  });

  if (!participante || participante.senha !== senha) {
    const err = new Error('E-mail ou senha inválidos.');
    err.status = 401;
    throw err;
  }

  return semSenha(participante);
}

export async function listarParticipantes({ equipeId } = {}) {
  const participantes = await prisma.participante.findMany({
    where: equipeId ? { equipeId } : undefined,
    include: { equipe: true },
    orderBy: { nome: 'asc' },
  });
  return participantes.map(semSenha);
}

export async function getParticipanteById(id) {
  const participante = await prisma.participante.findUnique({ where: { id }, include: { equipe: true } });
  if (!participante) {
    const err = new Error('Participante não encontrado.');
    err.status = 404;
    throw err;
  }
  return semSenha(participante);
}

export async function atualizarPerfil(id, { nome, bio }) {
  await getParticipanteById(id);
  const participante = await prisma.participante.update({
    where: { id },
    data: {
      ...(nome?.trim() ? { nome: nome.trim() } : {}),
      ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
    },
    include: { equipe: true },
  });
  return semSenha(participante);
}

// Gerenciar monitores/admins (seção 15.3) — só quem já é ADMIN pode chamar
// esta rota (verificado no controller/middleware).
export async function atualizarPapel(id, papel) {
  if (!PAPEIS.includes(papel)) {
    const err = new Error(`Papel inválido. Use um dos: ${PAPEIS.join(', ')}`);
    err.status = 400;
    throw err;
  }
  await getParticipanteById(id);
  const participante = await prisma.participante.update({ where: { id }, data: { papel } });
  return semSenha(participante);
}
