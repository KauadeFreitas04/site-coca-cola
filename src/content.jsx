// Textos do site. O vídeo com scroll fica só na abertura (Hero); o resto da página rola normalmente.

export const nav = [
  { href: '#historia', label: 'História' },
  { href: '#evolucao', label: 'Evolução' },
  { href: '#garrafa', label: 'A garrafa' },
  { href: '#marcas', label: 'Marcas' },
  { href: '#fim', label: 'Abra a sua' }
];

// Legendas sobre o vídeo da abertura. from/to = trecho do scroll (0–1) em que cada uma aparece.
// Os trechos acompanham o comercial: garrafa parada → gelo e espiral → tampa estoura.
export const captions = [
  { from: 0.2, to: 0.38, tag: 'Desde 1886', title: <>Gelada<br />desde <em>sempre</em>.</> },
  { from: 0.42, to: 0.6, tag: 'A receita', title: <>Um sabor,<br /><em>200</em> países.</> },
  { from: 0.64, to: 0.8, tag: 'A abertura', title: <>O som que<br />você <em>conhece</em>.</> }
];

export const timeline = [
  { year: '1886', title: 'Atlanta', text: "Em 8 de maio, o farmacêutico John S. Pemberton serve o primeiro copo na Jacobs' Pharmacy, por 5 centavos." },
  { year: '1886', title: 'A letra', text: 'Frank M. Robinson, contador de Pemberton, batiza a bebida e escreve o logotipo em letra Spencerian.' },
  { year: '1915', title: 'A Contour', text: 'A Root Glass Company cria a garrafa que pode ser reconhecida pelo toque, no escuro, ou mesmo quebrada.' },
  { year: '1942', title: 'Brasil', text: 'A Coca-Cola chega ao Brasil. Hoje está em mais de 200 países e territórios.' }
];

export const bottleStats = [[330, ' ml', 'GARRAFA DE VIDRO'], [139, '', 'KCAL'], [35, ' g', 'DE AÇÚCARES']];

// Evolução da garrafa. x = posição (%) de cada garrafa na foto, da esquerda para a direita.
export const bottles = [
  { year: '1894', x: 10.6, title: 'A primeira garrafa', text: 'Joseph Biedenharn engarrafa Coca-Cola pela primeira vez, em Vicksburg, Mississippi, numa garrafa de vidro comum fechada com rolha.' },
  { year: '1900', x: 30, title: 'Reta, com diamante', text: 'Garrafas retas de vidro com o logotipo em relevo. A partir de 1906 ganham o rótulo de papel em forma de diamante.' },
  { year: '1915', x: 48, title: 'O protótipo Contour', text: 'A Root Glass Company, de Terre Haute, cria uma garrafa curvilínea para ser reconhecida pelo toque, até no escuro.' },
  { year: '1916', x: 64.4, title: 'A Contour padrão', text: 'O protótipo fica mais esguio para rodar nas máquinas de envase e vira o padrão de todos os engarrafadores.' },
  { year: '1957', x: 78.3, title: 'Logo pintado', text: 'O relevo dá lugar ao logotipo pintado em branco direto no vidro, mais visível nas prateleiras.' },
  { year: 'Hoje', x: 91.1, title: 'Rótulo vermelho', text: 'A mesma silhueta de 1916, agora com o rótulo vermelho e a letra Spencerian de Frank M. Robinson.' }
];

export const marquee = ['Abra a felicidade', 'Coca-Cola desde 1886'];
