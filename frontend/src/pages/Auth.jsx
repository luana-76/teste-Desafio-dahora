import { useState } from 'react';
import { cadastrar, entrar } from '../services/auth';

export default function Auth({ onAutenticado }) {
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [tremer, setTremer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function trocarModo(novoModo) {
    if (novoModo === modo) return;
    setModo(novoModo);
    setErro('');
    setSenha('');
    setConfirmarSenha('');
  }

  function dispararErro(mensagem) {
    setErro(mensagem);
    setTremer(true);
    setTimeout(() => setTremer(false), 420);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (modo === 'cadastro') {
      if (!nome.trim()) return dispararErro('Digite seu nome.');
      if (!email.trim()) return dispararErro('Digite seu e-mail.');
      if (senha.length < 4) return dispararErro('A senha precisa de pelo menos 4 caracteres.');
      if (senha !== confirmarSenha) return dispararErro('As senhas não coincidem.');
    } else {
      if (!email.trim() || !senha) return dispararErro('Preencha e-mail e senha.');
    }

    setEnviando(true);

    // Pequeno delay proposital só pra dar tempo do spinner/animação aparecer.
    setTimeout(() => {
      try {
        const usuario = modo === 'cadastro' ? cadastrar({ nome, email, senha }) : entrar({ email, senha });
        setEnviando(false);
        setSucesso(true);
        setTimeout(() => onAutenticado(usuario), 650);
      } catch (err) {
        setEnviando(false);
        dispararErro(err.message);
      }
    }, 500);
  }

  return (
    <div className="auth-screen">
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />
      <div className="auth-blob auth-blob-3" aria-hidden="true" />

      <div className={`auth-card ${tremer ? 'auth-card-tremer' : ''} ${sucesso ? 'auth-card-sucesso' : ''}`}>
        <div className="auth-card-glow" aria-hidden="true" />

        <div className="auth-logo">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path
              d="M3 8.5 12 3l9 5.5v6L12 20l-9-5.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11.3" r="2.1" fill="currentColor" />
          </svg>
          <span>
            Desafio <em>Dahora</em>
          </span>
        </div>

        {sucesso ? (
          <div className="auth-sucesso">
            <span className="auth-sucesso-check">
              <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
                <path
                  d="M4.5 12.5 9 17l10.5-11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p>{modo === 'cadastro' ? 'Conta criada! Preparando seu perfil…' : 'Bem-vindo de volta!'}</p>
          </div>
        ) : (
          <>
            <div className="auth-tabs">
              <span className={`auth-tabs-indicador ${modo === 'cadastro' ? 'auth-tabs-indicador-direita' : ''}`} />
              <button
                type="button"
                className={modo === 'login' ? 'ativo' : ''}
                onClick={() => trocarModo('login')}
              >
                Entrar
              </button>
              <button
                type="button"
                className={modo === 'cadastro' ? 'ativo' : ''}
                onClick={() => trocarModo('cadastro')}
              >
                Cadastrar
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} key={modo}>
              {modo === 'cadastro' && (
                <label className="auth-campo" style={{ '--atraso': '0ms' }}>
                  Nome completo
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como você quer aparecer"
                    autoFocus
                  />
                </label>
              )}

              <label className="auth-campo" style={{ '--atraso': modo === 'cadastro' ? '60ms' : '0ms' }}>
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  autoFocus={modo === 'login'}
                />
              </label>

              <label className="auth-campo" style={{ '--atraso': modo === 'cadastro' ? '120ms' : '60ms' }}>
                Senha
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              {modo === 'cadastro' && (
                <label className="auth-campo" style={{ '--atraso': '180ms' }}>
                  Confirmar senha
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="••••••••"
                  />
                </label>
              )}

              {erro && <p className="auth-erro">{erro}</p>}

              <button type="submit" className="auth-submit" disabled={enviando}>
                <span>{enviando ? 'Só um instante…' : modo === 'cadastro' ? 'Criar conta' : 'Entrar'}</span>
              </button>
            </form>

            <p className="auth-troca">
              {modo === 'login' ? (
                <>
                  Ainda não tem conta?{' '}
                  <button type="button" onClick={() => trocarModo('cadastro')}>
                    Cadastre-se
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{' '}
                  <button type="button" onClick={() => trocarModo('login')}>
                    Entrar
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
