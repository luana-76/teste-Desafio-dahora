// Não existe backend de autenticação neste projeto (só o CRUD de pedidos).
// Para manter a mesma abordagem que já existia no Perfil (dados guardados
// no navegador), login e cadastro também vivem aqui, em localStorage.
// Não é seguro pra produção — é um mock de sessão pra fins do desafio.

const CHAVE_USUARIOS = 'desafio-dahora:usuarios';
const CHAVE_SESSAO = 'desafio-dahora:sessao';

function lerUsuarios() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
  } catch {
    return [];
  }
}

function salvarUsuarios(usuarios) {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function normalizarEmail(email = '') {
  return email.trim().toLowerCase();
}

export function cadastrar({ nome, email, senha }) {
  const emailNorm = normalizarEmail(email);
  const usuarios = lerUsuarios();

  if (usuarios.some((u) => u.email === emailNorm)) {
    throw new Error('Já existe uma conta com esse e-mail.');
  }

  const usuario = { nome: nome.trim(), email: emailNorm, senha, bio: '' };
  usuarios.push(usuario);
  salvarUsuarios(usuarios);
  localStorage.setItem(CHAVE_SESSAO, emailNorm);
  return usuario;
}

export function entrar({ email, senha }) {
  const emailNorm = normalizarEmail(email);
  const usuario = lerUsuarios().find((u) => u.email === emailNorm);

  if (!usuario || usuario.senha !== senha) {
    throw new Error('E-mail ou senha inválidos.');
  }

  localStorage.setItem(CHAVE_SESSAO, emailNorm);
  return usuario;
}

export function sair() {
  localStorage.removeItem(CHAVE_SESSAO);
}

export function usuarioAtual() {
  const emailSessao = localStorage.getItem(CHAVE_SESSAO);
  if (!emailSessao) return null;
  return lerUsuarios().find((u) => u.email === emailSessao) || null;
}

export function atualizarUsuarioAtual(dados) {
  const atual = usuarioAtual();
  if (!atual) return null;

  const usuarios = lerUsuarios();
  const index = usuarios.findIndex((u) => u.email === atual.email);
  if (index === -1) return null;

  usuarios[index] = { ...usuarios[index], ...dados };
  salvarUsuarios(usuarios);
  return usuarios[index];
}
