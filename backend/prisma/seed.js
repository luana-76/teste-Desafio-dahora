// Prepara o banco pra competição: cria a conta ADMIN da organização (única
// forma de "nascer" um admin, já que o cadastro público só permite
// Participante/Monitor — seção 15.3) e os 36 desafios previstos no
// documento (seção 10): 12 por dia, já categorizados pelo eixo temático de
// cada dia. O seed sincroniza os 36 desafios oficiais com o banco existente,
// preservando status, horários, avaliações e cartas já registradas.
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const DIAS = [
  { dia: 1, categoria: 'IA, Criatividade e Soluções Digitais' },
  { dia: 2, categoria: 'Maker, Robótica e IoT' },
  { dia: 3, categoria: 'Dados, Programação e Inovação' },
];

const ADMIN_EMAIL = 'organizacao@desafiodahora.com';
const ADMIN_SENHA = 'L13A10@';

// Conta ADMIN da organização SENAC (LMA) usada para operar o painel durante
// o evento — mesmo papel ADMIN da conta acima, só que com credenciais
// próprias da equipe organizadora.
const ADMIN_SENAC_EMAIL = 'adminLMA2026@senac.br.com';
const ADMIN_SENAC_SENHA = 'L13A10@';

async function seedAdmin() {
  // A conta da organização nunca pertence a uma equipe. Ao executar o seed,
  // atualizamos também contas já existentes para aplicar a nova senha.
  await prisma.participante.upsert({
    where: { email: ADMIN_EMAIL },
    update: { nome: 'Organização', senha: ADMIN_SENHA, papel: 'ADMIN', equipeId: null },
    create: { nome: 'Organização', email: ADMIN_EMAIL, senha: ADMIN_SENHA, papel: 'ADMIN', equipeId: null },
  });
  console.log(`Conta da organização configurada -> e-mail: ${ADMIN_EMAIL} | senha: ${ADMIN_SENHA}`);

  // Corrige também o e-mail antigo que estava com o sufixo incorreto .br.com.
  const emailAntigoSenac = 'adminLMA2026@senac.br.com';
  const contaAntiga = await prisma.participante.findUnique({ where: { email: emailAntigoSenac } });
  const contaCorreta = await prisma.participante.findUnique({ where: { email: ADMIN_SENAC_EMAIL } });
  if (contaAntiga && !contaCorreta) {
    await prisma.participante.update({
      where: { id: contaAntiga.id },
      data: { email: ADMIN_SENAC_EMAIL, nome: 'Organização SENAC', senha: ADMIN_SENAC_SENHA, papel: 'ADMIN', equipeId: null },
    });
  } else if (contaAntiga && contaCorreta) {
    await prisma.participante.update({ where: { id: contaAntiga.id }, data: { senha: ADMIN_SENAC_SENHA, papel: 'ADMIN', equipeId: null } });
  }

  await prisma.participante.upsert({
    where: { email: ADMIN_SENAC_EMAIL },
    update: { nome: 'Organização SENAC', senha: ADMIN_SENAC_SENHA, papel: 'ADMIN', equipeId: null },
    create: { nome: 'Organização SENAC', email: ADMIN_SENAC_EMAIL, senha: ADMIN_SENAC_SENHA, papel: 'ADMIN', equipeId: null },
  });
  console.log(`Conta ADMIN SENAC configurada -> e-mail: ${ADMIN_SENAC_EMAIL} | senha: ${ADMIN_SENAC_SENHA}`);
}

const DESAFIOS = [
  // Dia 1 — IA, Criatividade e Soluções Digitais
  { numero: 1, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Desafio Prompt Master', descricao: 'Criar o melhor prompt para resolver um problema social.', instrucoes: 'Ferramentas sugeridas: Copilot e ChatGPT. Entrega: prompt utilizado e resultado gerado.' },
  { numero: 2, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Desafio Gerador de Imagens', descricao: 'Criar uma campanha visual sobre sustentabilidade.', instrucoes: 'Ferramentas sugeridas: Copilot Image Creator e Designer. Entrega: poster digital.' },
  { numero: 3, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Crie uma Logo para uma Startup', descricao: 'Desenvolver uma identidade visual para uma startup fictícia.', instrucoes: 'Entrega: logo e slogan da startup.' },
  { numero: 4, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Criação de Vídeo com IA', descricao: 'Produzir um vídeo curto com apoio de ferramentas de inteligência artificial.', instrucoes: 'Entrega: vídeo de 30 segundos.' },
  { numero: 5, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Criar Música com IA', descricao: 'Criar uma música curta que represente tecnologia e inovação.', instrucoes: 'Entrega: jingle tecnológico.' },
  { numero: 6, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Chatbot Relâmpago', descricao: 'Criar um chatbot básico para atendimento.', instrucoes: 'Demonstre uma conversa funcional e os principais caminhos de atendimento.' },
  { numero: 7, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Construir Site em 1 Hora', descricao: 'Criar um site simples para apresentar uma ideia ou serviço.', instrucoes: 'Ferramentas sugeridas: Canva ou Google Sites. Entrega: site navegável.' },
  { numero: 8, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Pitch Flash', descricao: 'Apresentar uma ideia e convencer investidores em dois minutos.', instrucoes: 'Prepare uma apresentação objetiva com problema, solução, público e diferencial.' },
  { numero: 9, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Caça aos Bugs', descricao: 'Encontrar e corrigir erros em um código simples.', instrucoes: 'Explique os bugs identificados e demonstre o código corrigido.' },
  { numero: 10, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Dashboard Express', descricao: 'Criar um painel visual para comunicar dados.', instrucoes: 'Ferramenta sugerida: Power BI. Destaque indicadores e conclusões relevantes.' },
  { numero: 11, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Automação Instantânea', descricao: 'Montar um fluxo de automação para simplificar uma tarefa.', instrucoes: 'Ferramenta sugerida: Power Automate. Demonstre o gatilho, as etapas e o resultado.' },
  { numero: 12, dia: 1, categoria: 'IA, Criatividade e Soluções Digitais', titulo: 'Missão Surpresa', descricao: 'Resolver um desafio secreto anunciado pela organização na hora.', instrucoes: 'A missão, os critérios e a entrega serão informados no início da atividade.' },
  // Dia 2 — Maker, Robótica e IoT
  { numero: 13, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Acenda o LED', descricao: 'Montar um circuito simples para acender um LED.', instrucoes: 'Demonstre o circuito funcionando e explique seus componentes.' },
  { numero: 14, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Semáforo Inteligente', descricao: 'Construir uma simulação de semáforo com sequência de luzes.', instrucoes: 'Programe os tempos e a sequência de LEDs de forma segura e organizada.' },
  { numero: 15, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Sensor de Presença', descricao: 'Criar um sistema que detecte presença usando um sensor.', instrucoes: 'Demonstre a detecção e uma resposta do circuito.' },
  { numero: 16, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Alarme de Distância', descricao: 'Criar um alarme que responda à distância medida por sensor.', instrucoes: 'Defina um limite e demonstre como o sistema reage quando um objeto se aproxima.' },
  { numero: 17, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Monitor de Temperatura', descricao: 'Montar um protótipo que leia e apresente a temperatura.', instrucoes: 'Mostre a leitura do sensor e como o valor é apresentado ao usuário.' },
  { numero: 18, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Circuito Mais Eficiente', descricao: 'Projetar ou melhorar um circuito priorizando eficiência e clareza.', instrucoes: 'Apresente o circuito e justifique as escolhas feitas.' },
  { numero: 19, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Programação com Blocos', descricao: 'Resolver uma tarefa usando programação visual por blocos.', instrucoes: 'Demonstre o programa executando a tarefa proposta.' },
  { numero: 20, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Missão ESP32', descricao: 'Enviar dados de um ESP32 para um celular.', instrucoes: 'Demonstre a transmissão dos dados e explique como a comunicação foi feita.' },
  { numero: 21, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Mini Robô Virtual', descricao: 'Criar ou programar um mini robô em ambiente virtual ou simulador.', instrucoes: 'Demonstre o robô completando uma tarefa definida pela equipe.' },
  { numero: 22, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Drone Challenge Simulado', descricao: 'Resolver uma missão de navegação em simulador de drone.', instrucoes: 'Planeje uma rota virtual e demonstre como o drone completa o percurso.' },
  { numero: 23, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Impressão 3D', descricao: 'Modelar um objeto útil que possa ser produzido por impressão 3D.', instrucoes: 'Entrega: modelo digital e explicação da utilidade do objeto.' },
  { numero: 24, dia: 2, categoria: 'Maker, Robótica e IoT', titulo: 'Grande Desafio Maker', descricao: 'Combinar os conhecimentos e recursos maker trabalhados no dia.', instrucoes: 'Apresente um protótipo integrado, demonstre seu funcionamento e explique a contribuição de cada componente.' },
  // Dia 3 — Dados, Programação e Inovação
  { numero: 25, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Limpeza de Dados', descricao: 'Preparar uma base de dados, corrigindo inconsistências e valores ausentes.', instrucoes: 'Apresente os problemas encontrados e a base limpa.' },
  { numero: 26, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Criar Dashboard', descricao: 'Construir um dashboard que transforme dados em informações úteis.', instrucoes: 'Inclua indicadores, visualizações claras e uma breve conclusão.' },
  { numero: 27, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Encontrar Tendências', descricao: 'Analisar dados e identificar padrões ou tendências relevantes.', instrucoes: 'Apresente as evidências utilizadas e explique as conclusões.' },
  { numero: 28, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Previsão Simples usando IA', descricao: 'Usar uma ferramenta de IA para criar uma previsão simples a partir de dados.', instrucoes: 'Explique os dados de entrada, o resultado previsto e suas limitações.' },
  { numero: 29, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Criar Assistente Inteligente', descricao: 'Desenvolver um assistente digital que ajude a resolver uma necessidade concreta.', instrucoes: 'Demonstre uma interação e explique o problema que o assistente resolve.' },
  { numero: 30, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Resolver Problema da Cidade', descricao: 'Propor uma solução para um problema urbano definido por tema sorteado.', instrucoes: 'A organização anunciará o tema. Apresente o problema, a solução e como ela poderia funcionar.' },
  { numero: 31, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Desafio Saúde', descricao: 'Criar uma solução digital para uma necessidade relacionada à saúde.', instrucoes: 'Apresente o público beneficiado, o funcionamento e os cuidados com privacidade e acessibilidade.' },
  { numero: 32, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Desafio Educação', descricao: 'Criar uma ferramenta digital que apoie o ensino ou a aprendizagem.', instrucoes: 'Demonstre um fluxo de uso e explique como a ferramenta ajuda estudantes ou educadores.' },
  { numero: 33, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Desafio Inclusão', descricao: 'Criar uma tecnologia acessível para reduzir uma barreira de participação.', instrucoes: 'Explique a barreira escolhida e demonstre os recursos de acessibilidade da solução.' },
  { numero: 34, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Desafio Sustentabilidade', descricao: 'Desenvolver uma ideia tecnológica que contribua para a sustentabilidade.', instrucoes: 'Apresente o impacto esperado, o público e como a solução poderia ser aplicada.' },
  { numero: 35, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Startup em 60 Minutos', descricao: 'Estruturar uma startup em uma hora, da ideia à apresentação.', instrucoes: 'Entrega: nome, logo, modelo de negócio e pitch.' },
  { numero: 36, dia: 3, categoria: 'Dados, Programação e Inovação', titulo: 'Problema Real em 60 Minutos', descricao: 'Receber um problema real e desenvolver uma solução em 60 minutos.', instrucoes: 'A organização apresentará um problema real. Em 60 minutos, desenvolva a solução, crie um protótipo e prepare uma apresentação.' },
];

async function seedDesafios() {
  // Atualiza também os 36 desafios que já existirem, sem alterar seus status,
  // horários, avaliações ou cartas vinculadas. Assim o conteúdo novo chega
  // ao banco existente sem apagar o progresso do evento.
  for (const desafio of DESAFIOS) {
    await prisma.desafio.upsert({
      where: { numero: desafio.numero },
      update: {
        titulo: desafio.titulo,
        descricao: desafio.descricao,
        categoria: desafio.categoria,
        instrucoes: desafio.instrucoes,
        dia: desafio.dia,
      },
      create: {
        ...desafio,
        status: 'BLOQUEADO',
      },
    });
  }
  console.log('36 desafios dos três dias cadastrados/atualizados.');
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
