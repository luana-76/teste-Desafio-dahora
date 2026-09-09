// Serviço de clima usando Open-Meteo (gratuito, sem chave de API).
// Serve para o widget "tempo" da topbar — pensado para quem acompanha
// entregas e quer saber rapidinho se vai chover.

const FALLBACK = { lat: -23.5505, lon: -46.6333, cidade: 'São Paulo' };

// Códigos "weathercode" do Open-Meteo, resumidos em português.
const WEATHER_CODES = {
  0: { desc: 'Céu limpo', icon: '☀' },
  1: { desc: 'Poucas nuvens', icon: '🌤' },
  2: { desc: 'Parcialmente nublado', icon: '⛅' },
  3: { desc: 'Nublado', icon: '☁' },
  45: { desc: 'Neblina', icon: '🌫' },
  48: { desc: 'Neblina', icon: '🌫' },
  51: { desc: 'Garoa fraca', icon: '🌦' },
  53: { desc: 'Garoa', icon: '🌦' },
  55: { desc: 'Garoa forte', icon: '🌦' },
  61: { desc: 'Chuva fraca', icon: '🌧' },
  63: { desc: 'Chuva', icon: '🌧' },
  65: { desc: 'Chuva forte', icon: '🌧' },
  71: { desc: 'Neve fraca', icon: '🌨' },
  73: { desc: 'Neve', icon: '🌨' },
  75: { desc: 'Neve forte', icon: '🌨' },
  80: { desc: 'Pancadas de chuva', icon: '🌦' },
  81: { desc: 'Pancadas de chuva', icon: '🌧' },
  82: { desc: 'Pancadas fortes', icon: '🌧' },
  95: { desc: 'Trovoadas', icon: '⛈' },
  96: { desc: 'Trovoadas com granizo', icon: '⛈' },
  99: { desc: 'Trovoadas com granizo', icon: '⛈' },
};

function describe(code) {
  return WEATHER_CODES[code] || { desc: 'Tempo estável', icon: '🌤' };
}

async function getWeatherAt({ lat, lon, cidade }) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao buscar o clima');
  const data = await res.json();
  const { desc, icon } = describe(data.current_weather?.weathercode);
  return {
    cidade,
    temperatura: Math.round(data.current_weather?.temperature),
    descricao: desc,
    icone: icon,
  };
}

// Tenta a localização do navegador; se não tiver permissão, cai no fallback.
export function fetchWeather() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      getWeatherAt(FALLBACK).then(resolve).catch(reject);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeatherAt({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          cidade: 'Sua região',
        })
          .then(resolve)
          .catch(reject);
      },
      () => getWeatherAt(FALLBACK).then(resolve).catch(reject),
      { timeout: 4000 }
    );
  });
}
