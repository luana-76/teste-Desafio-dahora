import { randomInt } from 'node:crypto';
import prisma from '../utils/prisma.js';
import { getEquipeById } from './equipes.service.js';
import { textoObrigatorio, textoOpcional, validarId } from '../utils/validacao.js';
import { getDesafioById } from './desafios.service.js';

// Cartas bônus — seções 5 e 30. Cada uso custa 10 minutos do tempo da
// equipe e precisa ficar registrado: equipe, carta, rodada (desafio),
// horário, tempo utilizado, benefício e responsável pelo registro.
const TIPOS_VALIDOS = ['AULA', 'MENTOR', 'DICA'];
const TEMPO_PADRAO_MINUTOS = 10;

function diaAtualRecife() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Recife', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const valores = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]));
  return `${valores.year}-${valores.month}-${valores.day}`;
}

export async function registrarUso({ equipeId, desafioId, tipo, beneficio, responsavel }, usuario = {}) {
  if (usuario.papel === 'ADMIN') {
    const err = new Error('O administrador pode consultar o histórico de cartas, mas não registrar o uso em nome de uma equipe.');
    err.status = 403;
    throw err;
  }
  const equipeIdFinal = validarId(equipeId, 'ID da equipe');
  await getEquipeById(equipeIdFinal);
  if (desafioId) { validarId(desafioId, 'ID do desafio'); await getDesafioById(desafioId); }
  beneficio = textoOpcional(beneficio, 'Benefício', 500);
  responsavel = textoOpcional(responsavel, 'Responsável', 100);

  // Participantes podem ativar cartas somente para a própria equipe.
  // ADMIN/MONITOR continuam podendo registrar o uso em qualquer equipe.
  if (usuario.papel === 'PARTICIPANTE') {
    const participante = await prisma.participante.findUnique({ where: { id: usuario.id } });
    if (!participante || participante.equipeId !== equipeId) {
      const err = new Error('Você só pode usar cartas para a sua própria equipe.');
      err.status = 403;
      throw err;
    }
    responsavel = participante.nome;
    const tipoSolicitado = typeof tipo === 'string' ? tipo.trim().toUpperCase() : '';
    if (!TIPOS_VALIDOS.includes(tipoSolicitado)) {
      const err = new Error(`Tipo de carta inválido. Use um dos: ${TIPOS_VALIDOS.join(', ')}`);
      err.status = 400;
      throw err;
    }
    const desbloqueio = await prisma.cartaDesbloqueio.findUnique({
      where: { participanteId_tipo: { participanteId: usuario.id, tipo: tipoSolicitado } },
    });
    if (!desbloqueio) {
      const err = new Error('Você precisa desbloquear esta carta com um código antes de usá-la.');
      err.status = 403;
      throw err;
    }
  }

  const tipoFinal = tipo?.trim().toUpperCase();
  if (!TIPOS_VALIDOS.includes(tipoFinal)) {
    const err = new Error(`Tipo de carta inválido. Use um dos: ${TIPOS_VALIDOS.join(', ')}`);
    err.status = 400;
    throw err;
  }
  if (!responsavel?.trim()) {
    const err = new Error('Informe quem está registrando o uso da carta (monitor/organização).');
    err.status = 400;
    throw err;
  }

  const diaUso = diaAtualRecife();
  // Considera também registros antigos, criados antes de existir diaUso.
  const inicioDiaRecife = new Date(`${diaUso}T00:00:00-03:00`);
  const amanha = new Date(inicioDiaRecife.getTime() + 24 * 60 * 60 * 1000);
  const usoHoje = await prisma.cartaBonus.findFirst({
    where: {
      equipeId: equipeIdFinal,
      tipo: tipoFinal,
      OR: [
        { diaUso },
        { diaUso: null, horario: { gte: inicioDiaRecife, lt: amanha } },
      ],
    },
    select: { id: true },
  });
  if (usoHoje) {
    const err = new Error(`A equipe já usou a carta ${tipoFinal} hoje. Cada equipe pode usar uma carta de cada tipo por dia.`);
    err.status = 409;
    throw err;
  }

  try {
    return await prisma.cartaBonus.create({
      data: {
        equipeId: equipeIdFinal,
        desafioId: desafioId || null,
        tipo: tipoFinal,
        diaUso,
        tempoUtilizado: TEMPO_PADRAO_MINUTOS,
        beneficio: beneficio || null,
        responsavel,
      },
    });
  } catch (err) {
    // A restrição única também impede usos duplicados em requisições simultâneas.
    if (err.code === 'P2002') {
      const conflito = new Error(`A equipe já usou a carta ${tipoFinal} hoje. Cada equipe pode usar uma carta de cada tipo por dia.`);
      conflito.status = 409;
      throw conflito;
    }
    throw err;
  }
}

export async function listarCartas({ equipeId } = {}) {
  return prisma.cartaBonus.findMany({
    where: equipeId ? { equipeId } : undefined,
    include: { equipe: true, desafio: true },
    orderBy: { horario: 'desc' },
  });
}

export { TIPOS_VALIDOS };


const CODIGOS_ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function gerarCodigo() {
  let codigo = '';
  for (let i = 0; i < 10; i += 1) codigo += CODIGOS_ALFABETO[randomInt(CODIGOS_ALFABETO.length)];
  return `${codigo.slice(0, 5)}-${codigo.slice(5)}`;
}

export async function listarDesbloqueios(participanteId) {
  if (!participanteId) { const err = new Error('Faça login para consultar suas cartas.'); err.status = 401; throw err; }
  return prisma.cartaDesbloqueio.findMany({ where: { participanteId }, orderBy: { desbloqueadaEm: 'desc' } });
}

export async function resgatarCodigo({ codigo }, usuario = {}) {
  if (!usuario.id || usuario.papel !== 'PARTICIPANTE') { const err = new Error('Entre como participante para resgatar um código.'); err.status = 403; throw err; }
  const codigoNormalizado = textoObrigatorio(codigo, 'Código', { minimo: 3, maximo: 30 }).toUpperCase().replace(/\s/g, '');
  const registro = await prisma.codigoCarta.findUnique({ where: { codigo: codigoNormalizado } });
  if (!registro) { const err = new Error('Código inválido. Confira e tente novamente.'); err.status = 404; throw err; }
  if (registro.usado) { const err = new Error('Este código já foi utilizado.'); err.status = 409; throw err; }
  const jaTem = await prisma.cartaDesbloqueio.findUnique({ where: { participanteId_tipo: { participanteId: usuario.id, tipo: registro.tipo } } });
  if (jaTem) { const err = new Error('Você já desbloqueou esse tipo de carta.'); err.status = 409; throw err; }
  try {
    return await prisma.$transaction(async (tx) => {
      const atualizacao = await tx.codigoCarta.updateMany({ where: { id: registro.id, usado: false }, data: { usado: true, usadoPorId: usuario.id, usadoEm: new Date() } });
      if (atualizacao.count !== 1) { const err = new Error('Este código já foi utilizado.'); err.status = 409; throw err; }
      return tx.cartaDesbloqueio.create({ data: { participanteId: usuario.id, tipo: registro.tipo, codigo: registro.codigo } });
    });
  } catch (err) {
    if (err.code === 'P2002') { const e = new Error('Você já desbloqueou esse tipo de carta.'); e.status = 409; throw e; }
    throw err;
  }
}

export async function criarCodigo({ tipo }) {
  const tipoFinal = typeof tipo === 'string' ? tipo.trim().toUpperCase() : '';
  if (!TIPOS_VALIDOS.includes(tipoFinal)) { const err = new Error(`Tipo inválido. Use: ${TIPOS_VALIDOS.join(', ')}.`); err.status = 400; throw err; }
  for (let tentativa = 0; tentativa < 5; tentativa += 1) {
    try { return await prisma.codigoCarta.create({ data: { codigo: gerarCodigo(), tipo: tipoFinal } }); }
    catch (err) { if (err.code !== 'P2002') throw err; }
  }
  const err = new Error('Não foi possível gerar um código único. Tente novamente.'); err.status = 500; throw err;
}
