export enum EBank {
  bancoDoBrasil = "001",
  bradesco = "237",
  itau = "341",
  santander = "033",
  caixa = "104",
  nubank = "260",
  inter = "077",
  original = "212",
  c6Bank = "336",
  pagSeguro = "290",
  picPay = "380",
  stone = "197",
  votorantim = "655",
  banrisul = "041",
  sicredi = "748",
  sicoob = "756",
  ailos = "085",
  brb = "070",
  mercantil = "389",
  safra = "422",
  hsbcBrasil = "399",
  abcBrasil = "246",
  citibank = "745",
  crefisa = "069",
}

export const banks = new Map<
  EBank,
  {
    code: string;
    name: string;
    image: string;
  }
>([
  [
    EBank.bancoDoBrasil,
    {
      code: EBank.bancoDoBrasil,
      name: "Banco do Brasil S.A.",
      image: "assets/images/banks/banco-do-brasil.jpg",
    },
  ],
  [
    EBank.bradesco,
    {
      code: EBank.bradesco,
      name: "Banco Bradesco S.A.",
      image: "assets/images/banks/bradesco.png",
    },
  ],
  [
    EBank.itau,
    {
      code: EBank.itau,
      name: "Itaú Unibanco S.A.",
      image: "assets/images/banks/itau.png",
    },
  ],
  [
    EBank.santander,
    {
      code: EBank.santander,
      name: "Banco Santander (Brasil) S.A.",
      image: "assets/images/banks/santander.jpg",
    },
  ],
  [
    EBank.caixa,
    {
      code: EBank.caixa,
      name: "Caixa Econômica Federal",
      image: "assets/images/banks/caixa.jpg",
    },
  ],
  [
    EBank.nubank,
    {
      code: EBank.nubank,
      name: "Nu Pagamentos S.A. (Nubank)",
      image: "assets/images/banks/nubank.jpg",
    },
  ],
  [
    EBank.inter,
    {
      code: EBank.inter,
      name: "Banco Inter S.A.",
      image: "assets/images/banks/inter.jpg",
    },
  ],
  [
    EBank.original,
    {
      code: EBank.original,
      name: "Banco Original S.A.",
      image: "assets/images/banks/banco-original.jpg",
    },
  ],
  [
    EBank.c6Bank,
    {
      code: EBank.c6Bank,
      name: "Banco C6 S.A. (C6 Bank)",
      image: "assets/images/banks/c6-bank.jpg",
    },
  ],
  [
    EBank.pagSeguro,
    {
      code: EBank.pagSeguro,
      name: "PagSeguro Internet S.A.",
      image: "assets/images/banks/pagseguro.png",
    },
  ],
  [
    EBank.picPay,
    {
      code: EBank.picPay,
      name: "PicPay Serviços S.A.",
      image: "assets/images/banks/picpay.jpg",
    },
  ],
  [
    EBank.stone,
    {
      code: EBank.stone,
      name: "Stone Pagamentos S.A.",
      image: "assets/images/banks/stone.png",
    },
  ],
  [
    EBank.votorantim,
    {
      code: EBank.votorantim,
      name: "Banco Votorantim S.A.",
      image: "assets/images/banks/votorantim.png",
    },
  ],
  [
    EBank.banrisul,
    {
      code: EBank.banrisul,
      name: "Banco do Estado do Rio Grande do Sul S.A. (Banrisul)",
      image: "assets/images/banks/banrisul.png",
    },
  ],
  [
    EBank.sicredi,
    {
      code: EBank.sicredi,
      name: "Banco Cooperativo Sicredi S.A.",
      image: "assets/images/banks/sicredi.png",
    },
  ],
  [
    EBank.sicoob,
    {
      code: EBank.sicoob,
      name: "Banco Cooperativo do Brasil S.A. (Sicoob)",
      image: "assets/images/banks/sicoob.png",
    },
  ],
  [
    EBank.ailos,
    {
      code: EBank.ailos,
      name: "Cooperativa Central de Crédito Urbano (Ailos)",
      image: "assets/images/banks/ailos.png",
    },
  ],
  [
    EBank.brb,
    {
      code: EBank.brb,
      name: "Banco de Brasília S.A. (BRB)",
      image: "assets/images/banks/brb.png",
    },
  ],
  [
    EBank.mercantil,
    {
      code: EBank.mercantil,
      name: "Banco Mercantil do Brasil S.A.",
      image: "assets/images/banks/bancoMercantil.jpg",
    },
  ],
  [
    EBank.safra,
    {
      code: EBank.safra,
      name: "Banco Safra S.A.",
      image: "assets/images/banks/safra.jpg",
    },
  ],
  [
    EBank.hsbcBrasil,
    {
      code: EBank.hsbcBrasil,
      name: "HSBC Brasil S.A.",
      image: "assets/images/banks/hsbc.png",
    },
  ],
  [
    EBank.abcBrasil,
    {
      code: EBank.abcBrasil,
      name: "Banco ABC Brasil S.A.",
      image: "assets/images/banks/abc.png",
    },
  ],
  [
    EBank.citibank,
    {
      code: EBank.citibank,
      name: "Banco Citibank S.A.",
      image: "assets/images/banks/citi.png",
    },
  ],
  [
    EBank.crefisa,
    {
      code: EBank.crefisa,
      name: "Banco Crefisa S.A",
      image: "assets/images/banks/crefisa.png",
    },
  ],
]);
