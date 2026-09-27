// Prepara o banco pra competição: cria a conta ADMIN da organização (única
// forma de "nascer" um admin, já que o cadastro público só permite
// Participante/Monitor — seção 15.3) e os 36 desafios previstos no
// documento (seção 10): 12 por dia, já categorizados pelo eixo temático de
// cada dia. Os títulos/descrições dos desafios são só placeholders — a
// organização deve editá-los pelo painel administrativo antes do evento
// (PATCH /desafios/:id).
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DIAS = [
  { dia: 1, categoria: 'IA, Criatividade e Soluções Digitais' },
  { dia: 2, categoria: 'Maker, Robótica e IoT' },
  { dia: 3, categoria: 'Dados, Programação e Inovação' },
];

const ADMIN_EMAIL = 'organizacao@desafiodahora.com';
const ADMIN_SENHA = 'trocar123';

// Conta ADMIN da organização SENAC (LMA) usada para operar o painel durante
// o evento — mesmo papel ADMIN da conta acima, só que com credenciais
// próprias da equipe organizadora.
const ADMIN_SENAC_EMAIL = 'adminLMA2026@senac.br.com';
const ADMIN_SENAC_SENHA = 'senacLMA2026@';

async function seedAdmin() {
  const existente = await prisma.participante.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existente) {
    console.log('Conta de organização já existe — nada a fazer.');
  } else {
    await prisma.participante.create({
      data: { nome: 'Organização', email: ADMIN_EMAIL, senha: ADMIN_SENHA, papel: 'ADMIN' },
    });
    console.log(
      `Conta ADMIN criada -> e-mail: ${ADMIN_EMAIL} | senha: ${ADMIN_SENHA}\n` +
        'IMPORTANTE: entre com essa conta e troque a senha (ou crie outras contas ADMIN) antes do evento — ' +
        'sem um ADMIN ninguém consegue liberar/iniciar desafios nem criar equipes.'
    );
  }

  const existenteSenac = await prisma.participante.findUnique({ where: { email: ADMIN_SENAC_EMAIL } });
  if (existenteSenac) {
    console.log('Conta ADMIN do SENAC (LMA) já existe — nada a fazer.');
    return;
  }
  await prisma.participante.create({
    data: { nome: 'Organização SENAC', email: ADMIN_SENAC_EMAIL, senha: ADMIN_SENAC_SENHA, papel: 'ADMIN' },
  });
  console.log(`Conta ADMIN SENAC criada -> e-mail: ${ADMIN_SENAC_EMAIL} | senha: ${ADMIN_SENAC_SENHA}`);
}

async function seedDesafios() {
  const existentes = await prisma.desafio.count();
  if (existentes > 0) {
    console.log(`Já existem ${existentes} desafios cadastrados — nada a fazer.`);
    return;
  }

  let numero = 1;
  for (const { dia, categoria } of DIAS) {
    for (let i = 1; i <= 12; i += 1) {
      await prisma.desafio.create({
        data: {
          numero,
          titulo: `Desafio #${String(numero).padStart(2, '0')}`,
          categoria,
          dia,
          status: 'BLOQUEADO',
        },
      });
      numero += 1;
    }
  }
  console.log('36 desafios criados (12 por dia).');
}


async function seedEquipeTeste() {
  const existente = await prisma.equipe.findFirst({ where: { nome: 'Equipe Teste' } });
  if (existente) {
    console.log('Equipe Teste já existe — nada a fazer.');
    return;
  }

  await prisma.equipe.create({
    data: {
      nome: 'Equipe Teste',
      cor: 'azul',
    },
  });
  console.log('Equipe Teste criada.');
}

// Mais algumas equipes de teste, já com participantes, só pra ter dado de
// verdade pra ver a tela de Equipes com várias equipes lado a lado (cada
// uma com sua cor, nome e membros). Senha de todo mundo aqui: "teste123".
const EQUIPES_TESTE_EXTRA = [
  {
    nome: 'Equipe Fênix',
    cor: 'roxo',
    membros: [
      { nome: 'Carla Menezes', email: 'carla.menezes@teste.com' },
      { nome: 'Bruno Farias', email: 'bruno.farias@teste.com' },
      { nome: 'Isabela Nogueira', email: 'isabela.nogueira@teste.com' },
    ],
  },
  {
    nome: 'Equipe Aurora',
    cor: 'verde',
    membros: [
      { nome: 'Diego Ramalho', email: 'diego.ramalho@teste.com' },
      { nome: 'Fernanda Aquino', email: 'fernanda.aquino@teste.com' },
      { nome: 'Gustavo Peixoto', email: 'gustavo.peixoto@teste.com' },
      { nome: 'Helena Duarte', email: 'helena.duarte@teste.com' },
    ],
  },
  {
    nome: 'Equipe Nimbus',
    cor: 'ciano',
    membros: [
      { nome: 'Igor Vasconcelos', email: 'igor.vasconcelos@teste.com' },
      { nome: 'Juliana Prado', email: 'juliana.prado@teste.com' },
      { nome: 'Kleber Sá', email: 'kleber.sa@teste.com' },
      { nome: 'Larissa Chagas', email: 'larissa.chagas@teste.com' },
      { nome: 'Marcelo Tavares', email: 'marcelo.tavares@teste.com' },
    ],
  },
];

const SENHA_TESTE = 'teste123';

async function seedEquipesTesteExtra() {
  for (const eq of EQUIPES_TESTE_EXTRA) {
    const existente = await prisma.equipe.findFirst({ where: { nome: eq.nome } });
    if (existente) {
      console.log(`${eq.nome} já existe — nada a fazer.`);
      continue;
    }

    const equipeCriada = await prisma.equipe.create({ data: { nome: eq.nome, cor: eq.cor } });
    for (const membro of eq.membros) {
      const jaExiste = await prisma.participante.findUnique({ where: { email: membro.email } });
      if (jaExiste) continue;
      await prisma.participante.create({
        data: {
          nome: membro.nome,
          email: membro.email,
          senha: SENHA_TESTE,
          papel: 'PARTICIPANTE',
          equipeId: equipeCriada.id,
        },
      });
    }
    console.log(`${eq.nome} criada com ${eq.membros.length} participantes (senha: ${SENHA_TESTE}).`);
  }
}

async function main() {
  await seedAdmin();
  await seedDesafios();
  await seedEquipeTeste();
  await seedEquipesTesteExtra();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
