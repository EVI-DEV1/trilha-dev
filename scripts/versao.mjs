// Antes do build (npm run build), grava o número da versão do app em dois lugares:
//  - src/app/core/data/versao.ts → a versão que está rodando (aparece em Conta → Atualizar app);
//  - ngsw-config.json (appData) → o service worker entrega esse dado quando chega uma versão nova,
//    então o app consegue dizer "Versão nova: X" antes de atualizar.
// O número vem do "version" do package.json: aumente-o a cada entrega (ex.: 1.2.0 → 1.3.0).
import { readFileSync, writeFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const data = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date()); // AAAA-MM-DD
const commit = (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7);
const info = { numero: version, data, commit };

writeFileSync(
  'src/app/core/data/versao.ts',
  `// Gerado por scripts/versao.mjs no build — não edite à mão (mude o "version" do package.json).
import { InfoVersao } from '../models/versao.model';

export const VERSAO_ATUAL: InfoVersao = ${JSON.stringify(info, null, 2).replace(/"(\w+)":/g, '$1:').replace(/"/g, "'")};
`,
);

const ngsw = JSON.parse(readFileSync('ngsw-config.json', 'utf8'));
ngsw.appData = info;
writeFileSync('ngsw-config.json', JSON.stringify(ngsw, null, 2) + '\n');

console.log(`[versao] Trilha ${version} (${data}${commit ? ' · ' + commit : ''})`);
