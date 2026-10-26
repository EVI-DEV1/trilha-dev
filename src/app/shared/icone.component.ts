import { Component, computed, input } from '@angular/core';

/** Ícones de traço (24×24). Para adicionar um, inclua o "d" do path aqui. */
const ICONES = {
  casa: 'M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5',
  trilhas: 'M12 3 2.5 8 12 13l9.5-5L12 3ZM2.5 12 12 17l9.5-5M2.5 16 12 21l9.5-5',
  foco: 'M12 9v4l2.5 1.5M9.5 2.5h5M12 21.5a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  github: 'M7 3.5v11M17 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM7 20.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm10-10.5c0 5-4 7.5-10 8',
  mais: 'M12 5v14M5 12h14',
  voltar: 'M15 18l-6-6 6-6',
  seta: 'M9 18l6-6-6-6',
  busca: 'M11 18.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm9.5 2-4.2-4.2',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  lixeira: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
  pausa: 'M9 5.5v13M15 5.5v13',
  reiniciar: 'M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5',
  pular: 'M6 5.5v13l9-6.5-9-6.5ZM18 5.5v13',
  fechar: 'M6 6l12 12M18 6 6 18',
  chama: 'M12 21.5c3.9 0 6.5-2.8 6.5-6.5 0-4.6-4.5-6.6-4.5-11.5-2.8 1.8-4 4.5-4 6.6-.9-.8-1.8-1.9-2-3.6-1.4 1.5-2.5 4-2.5 8.5 0 3.7 2.6 6.5 6.5 6.5Z',
  estrela: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z',
  externo: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  nota: 'M5 3.5h10l4 4V20.5H5zM15 3.5v4h4M8.5 12h7M8.5 16h4.5',
  meta: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  painel: 'M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z',
  engrenagem: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7.5 7.5 0 0 1-2.1 1.2l-.3 2H10.3l-.3-2a7.5 7.5 0 0 1-2.1-1.2l-1.9.7-2-3.4 1.6-1.2a7.6 7.6 0 0 1 0-2.4L4 10.3l2-3.4 1.9.7A7.5 7.5 0 0 1 10 6.4l.3-2h3.4l.3 2a7.5 7.5 0 0 1 2.1 1.2l1.9-.7 2 3.4-1.6 1.2a7.6 7.6 0 0 1 0 2.4Z',
  sair: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  editar: 'M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4',
  download: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14',
  sol: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4',
  lua: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z',
  baixo: 'M6 9l6 6 6-6',
  relogio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  livro: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15ZM4 20.5A2.5 2.5 0 0 0 6.5 23H20',
} as const;

export type NomeIcone = keyof typeof ICONES;

@Component({
  selector: 'app-icone',
  template: `
    <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      [attr.stroke-width]="espessura()" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path [attr.d]="d()" />
    </svg>
  `,
  styles: `:host { display: inline-flex; flex: none; }`,
})
export class IconeComponent {
  nome = input.required<NomeIcone>();
  tamanho = input(22);
  espessura = input(1.7);
  protected d = computed(() => ICONES[this.nome()]);
}
