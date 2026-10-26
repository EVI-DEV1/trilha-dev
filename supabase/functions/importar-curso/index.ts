// Edge Function "importar-curso" — recebe o link de um curso e devolve título e módulos.
// Deploy: painel do Supabase → Edge Functions → Deploy a new function → Via editor (nome: importar-curso)
// ou `supabase functions deploy importar-curso`.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const NAVEGADOR = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};
const LIMITE_BYTES = 4_000_000;
const MAX_MODULOS = 80;

type Resultado = { titulo: string; plataforma: string; modulos: string[]; fonte: string };

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

/** Bloqueia endereços internos (proteção contra SSRF). */
function urlPermitida(u: URL): boolean {
  if (!['http:', 'https:'].includes(u.protocol)) return false;
  const h = u.hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || h === 'metadata.google.internal') return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h) || h.includes(':')) return false; // sem IP literal
  return h.includes('.');
}

async function baixar(url: string, extra: Record<string, string> = {}): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const r = await fetch(url, { headers: { ...NAVEGADOR, ...extra }, signal: ctrl.signal, redirect: 'follow' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const texto = await r.text();
    return texto.slice(0, LIMITE_BYTES);
  } finally {
    clearTimeout(t);
  }
}

const ENTIDADES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function textoLimpo(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) => {
      if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
      return ENTIDADES[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function unicos(lista: string[]): string[] {
  const vistos = new Set<string>();
  const saida: string[] = [];
  for (const bruto of lista) {
    const t = bruto.replace(/\s+/g, ' ').trim().slice(0, 140);
    const chave = t.toLowerCase();
    if (t.length < 2 || vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push(t);
  }
  return saida.slice(0, MAX_MODULOS);
}

function nomePlataforma(host: string): string {
  const conhecidas: Record<string, string> = {
    'youtube.com': 'YouTube', 'youtu.be': 'YouTube', 'udemy.com': 'Udemy', 'alura.com.br': 'Alura',
    'dio.me': 'DIO', 'coursera.org': 'Coursera', 'rocketseat.com.br': 'Rocketseat', 'edx.org': 'edX',
    'freecodecamp.org': 'freeCodeCamp', 'cursoemvideo.com': 'Curso em Vídeo', 'origamid.com': 'Origamid',
    'ev.org.br': 'Escola Virtual', 'fiap.com.br': 'FIAP', 'domestika.org': 'Domestika', 'linkedin.com': 'LinkedIn Learning',
  };
  const h = host.replace(/^www\./, '');
  for (const [dominio, nome] of Object.entries(conhecidas)) if (h === dominio || h.endsWith('.' + dominio)) return nome;
  const base = h.split('.').slice(-3)[0] ?? h;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

// ---------- YouTube (playlist) ----------
function coletar(obj: unknown, chave: string, saida: unknown[] = []): unknown[] {
  if (Array.isArray(obj)) obj.forEach((o) => coletar(o, chave, saida));
  else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k === chave) saida.push(v);
      coletar(v, chave, saida);
    }
  }
  return saida;
}
function textoYt(t: any): string {
  return t?.simpleText ?? (t?.runs ?? []).map((r: any) => r.text).join('') ?? '';
}
async function youtube(u: URL): Promise<Resultado | null> {
  const lista = u.searchParams.get('list');
  if (!lista) return null;
  const html = await baixar(`https://www.youtube.com/playlist?list=${encodeURIComponent(lista)}&hl=pt`, { Cookie: 'CONSENT=YES+1' });
  const m = html.match(/ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s);
  if (!m) return null;
  const dados = JSON.parse(m[1]);
  const videos = [...coletar(dados, 'playlistVideoRenderer'), ...coletar(dados, 'lockupViewModel')] as any[];
  const titulos = videos.map((v) => textoYt(v?.title) || v?.metadata?.lockupMetadataViewModel?.title?.content || '').filter(Boolean);
  const meta = (coletar(dados, 'playlistMetadataRenderer')[0] ?? {}) as any;
  const titulo = meta.title ?? textoYt((coletar(dados, 'playlistHeaderRenderer')[0] as any)?.title) ?? 'Playlist do YouTube';
  return { titulo, plataforma: 'YouTube', modulos: unicos(titulos), fonte: 'youtube' };
}

// ---------- Udemy (currículo público) ----------
async function udemy(html: string): Promise<string[]> {
  const id = html.match(/data-clp-course-id="(\d+)"/)?.[1] ?? html.match(/"course_id"\s*:\s*(\d+)/)?.[1];
  if (!id) return [];
  try {
    const json = JSON.parse(await baixar(`https://www.udemy.com/api-2.0/course-landing-components/${id}/me/?components=curriculum_context`));
    const secoes = json?.curriculum_context?.data?.sections ?? [];
    return secoes.map((s: any) => s.title).filter(Boolean);
  } catch {
    return [];
  }
}

// ---------- JSON-LD (schema.org Course / ItemList) ----------
function jsonLd(html: string): { titulo?: string; modulos: string[] } {
  const blocos = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  let titulo: string | undefined;
  const modulos: string[] = [];
  for (const b of blocos) {
    try {
      const dados = JSON.parse(b[1].trim());
      const itens = ([] as any[]).concat(dados, dados?.['@graph'] ?? []);
      for (const it of itens) {
        const tipo = ([] as string[]).concat(it?.['@type'] ?? []);
        if (tipo.includes('Course')) {
          titulo ??= it.name;
          for (const k of ['syllabusSections', 'hasPart', 'coursePrerequisites']) {
            if (k === 'coursePrerequisites') continue;
            for (const p of ([] as any[]).concat(it[k] ?? [])) if (p?.name) modulos.push(p.name);
          }
        }
        if (tipo.includes('ItemList')) {
          for (const e of it.itemListElement ?? []) {
            const n = e?.name ?? e?.item?.name;
            if (n) modulos.push(n);
          }
        }
      }
    } catch {
      /* JSON-LD inválido: ignora */
    }
  }
  return { titulo, modulos };
}

// ---------- HTML genérico ----------
const PALAVRA_MODULO = /^(m[oó]dulo|aula|cap[ií]tulo|se[cç][aã]o|unidade|parte|etapa|semana|module|lesson|chapter|section|unit|week|part)\b\s*\d*/i;
const LIXO = /^(menu|entrar|login|cadastr|inscrev|compartilh|coment|avalia|pre[çc]o|faq|perguntas|contato|sobre|termos|pol[ií]tica|cookies|newsletter|blog|instrutor|professor|depoimentos|certificado|requisitos|descri[çc][aã]o|o que voc[eê] (vai )?aprender|cursos relacionados|veja tamb[eé]m)/i;

function htmlGenerico(html: string): string[] {
  const corpo = html.replace(/<(script|style|noscript|svg|nav|footer|header)\b[\s\S]*?<\/\1>/gi, ' ');
  const pegar = (re: RegExp) => [...corpo.matchAll(re)].map((m) => textoLimpo(m[1])).filter((t) => t.length >= 3 && t.length <= 140);
  const titulos = pegar(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi);
  const itens = pegar(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  const outros = pegar(/<(?:summary|button|span|div|p)[^>]*>([^<]{3,140})<\/(?:summary|button|span|div|p)>/gi);

  const comPalavra = unicos([...titulos, ...itens, ...outros].filter((t) => PALAVRA_MODULO.test(t)));
  if (comPalavra.length >= 2) return comPalavra;
  return unicos(titulos.filter((t) => !LIXO.test(t)));
}

function tituloDaPagina(html: string): string {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title/i)?.[1];
  const t = og ?? html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  return textoLimpo(t).replace(/\s*[|–—-]\s*[^|–—-]{2,40}$/, '').slice(0, 120);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return resposta({ erro: 'Use POST.' }, 405);

  let u: URL;
  try {
    const { url } = await req.json();
    u = new URL(String(url).trim());
  } catch {
    return resposta({ erro: 'Link inválido.' }, 400);
  }
  if (!urlPermitida(u)) return resposta({ erro: 'Esse endereço não é permitido.' }, 400);

  try {
    const host = u.hostname.replace(/^www\./, '');
    if (host.endsWith('youtube.com') || host === 'youtu.be') {
      const yt = await youtube(u);
      if (yt && yt.modulos.length) return resposta(yt);
      return resposta({ erro: 'Use o link de uma playlist do YouTube (com "list=" no endereço).' }, 422);
    }

    const html = await baixar(u.toString());
    const ld = jsonLd(html);
    let modulos = ld.modulos;
    let fonte = 'json-ld';
    if (modulos.length < 2 && host.endsWith('udemy.com')) {
      modulos = await udemy(html);
      fonte = 'udemy';
    }
    if (modulos.length < 2) {
      modulos = htmlGenerico(html);
      fonte = 'html';
    }
    const resultado: Resultado = {
      titulo: (ld.titulo ?? tituloDaPagina(html)) || 'Novo curso',
      plataforma: nomePlataforma(u.hostname),
      modulos: unicos(modulos),
      fonte,
    };
    return resposta(resultado);
  } catch (e) {
    return resposta({ erro: 'Não conseguimos abrir essa página (ela pode exigir login).', detalhe: String(e) }, 502);
  }
});
