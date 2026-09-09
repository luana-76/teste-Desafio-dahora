// Como não existe uma entidade "cliente" com foto, geramos um avatar de
// iniciais com uma cor estável (sempre a mesma para o mesmo nome).
const CORES = ['tomato', 'mustard', 'sage', 'slate'];

export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function corAvatar(nome = '') {
  let hash = 0;
  for (let i = 0; i < nome.length; i += 1) {
    hash = (hash * 31 + nome.charCodeAt(i)) % 997;
  }
  return CORES[hash % CORES.length];
}
