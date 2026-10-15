// Validações reutilizáveis para entradas da API.
export function erroValidacao(mensagem, status = 400) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

export function textoObrigatorio(valor, campo, { minimo = 1, maximo = 120 } = {}) {
  if (typeof valor !== 'string') throw erroValidacao(`${campo} deve ser um texto.`);
  const texto = valor.trim();
  if (texto.length < minimo) throw erroValidacao(`${campo} é obrigatório.`);
  if (texto.length > maximo) throw erroValidacao(`${campo} deve ter no máximo ${maximo} caracteres.`);
  return texto;
}

export function textoOpcional(valor, campo, maximo = 2000) {
  if (valor === undefined || valor === null) return valor;
  if (typeof valor !== 'string') throw erroValidacao(`${campo} deve ser um texto.`);
  const texto = valor.trim();
  if (texto.length > maximo) throw erroValidacao(`${campo} deve ter no máximo ${maximo} caracteres.`);
  return texto || null;
}

export function numeroInteiro(valor, campo, { minimo = Number.MIN_SAFE_INTEGER, maximo = Number.MAX_SAFE_INTEGER } = {}) {
  if (valor === undefined || valor === null || valor === '') throw erroValidacao(`${campo} é obrigatório.`);
  const numero = Number(valor);
  if (!Number.isSafeInteger(numero) || numero < minimo || numero > maximo) {
    throw erroValidacao(`${campo} deve ser um número inteiro entre ${minimo} e ${maximo}.`);
  }
  return numero;
}

export function validarEmail(email) {
  const normalizado = textoObrigatorio(email, 'E-mail', { maximo: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) {
    throw erroValidacao('Informe um endereço de e-mail válido.');
  }
  return normalizado;
}

export function validarId(id, campo = 'ID') {
  if (typeof id !== 'string' || !id.trim() || id.length > 100) {
    throw erroValidacao(`${campo} inválido.`);
  }
  return id.trim();
}

// Não permite que objetos/arrays sejam enviados como corpo em endpoints que
// esperam um objeto JSON; evita erros de destructuring e falhas pouco claras.
export function validarObjetoBody(req, res, next) {
  const metodoExigeCorpo = ['POST', 'PUT'].includes(req.method);
  if (metodoExigeCorpo && req.body === undefined) {
    return res.status(400).json({ error: 'Envie um corpo JSON com os dados da requisição.' });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'O corpo da requisição deve ser um objeto JSON.' });
    }
  }
  next();
}

export function tratarErroGlobal(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'O corpo da requisição excede o limite permitido (1 MB).' });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido. Verifique a sintaxe do corpo enviado.' });
  }
  if (err?.code === 'P2002') {
    return res.status(409).json({ error: 'Já existe um registro com esses dados.' });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado.' });
  }
  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status === 500) console.error('[API] Erro interno:', err);
  return res.status(status).json({ error: status === 500 ? 'Erro interno do servidor.' : (err.message || 'Requisição inválida.') });
}
