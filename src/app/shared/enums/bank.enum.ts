export enum EBank {
  default = "default",
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
  crefisa = "069"
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
      image: "assets/images/banks/banco-do-brasil.webp"
    }
  ],
  [
    EBank.bradesco,
    {
      code: EBank.bradesco,
      name: "Banco Bradesco S.A.",
      image: "assets/images/banks/bradesco.webp"
    }
  ],
  [
    EBank.itau,
    {
      code: EBank.itau,
      name: "Itaú Unibanco S.A.",
      image: "assets/images/banks/itau.webp"
    }
  ],
  [
    EBank.santander,
    {
      code: EBank.santander,
      name: "Banco Santander (Brasil) S.A.",
      image: "assets/images/banks/santander.webp"
    }
  ],
  [
    EBank.caixa,
    {
      code: EBank.caixa,
      name: "Caixa Econômica Federal",
      image: "assets/images/banks/caixa.webp"
    }
  ],
  [
    EBank.nubank,
    {
      code: EBank.nubank,
      name: "Nu Pagamentos S.A. (Nubank)",
      image: "assets/images/banks/nubank.webp"
    }
  ],
  [
    EBank.inter,
    {
      code: EBank.inter,
      name: "Banco Inter S.A.",
      image: "assets/images/banks/inter.webp"
    }
  ],
  [
    EBank.original,
    {
      code: EBank.original,
      name: "Banco Original S.A.",
      image: "assets/images/banks/banco-original.webp"
    }
  ],
  [
    EBank.c6Bank,
    {
      code: EBank.c6Bank,
      name: "Banco C6 S.A. (C6 Bank)",
      image: "assets/images/banks/c6-bank.webp"
    }
  ],
  [
    EBank.pagSeguro,
    {
      code: EBank.pagSeguro,
      name: "PagSeguro Internet S.A.",
      image: "assets/images/banks/pagseguro.webp"
    }
  ],
  [
    EBank.picPay,
    {
      code: EBank.picPay,
      name: "PicPay Serviços S.A.",
      image: "assets/images/banks/picpay.webp"
    }
  ],
  [
    EBank.stone,
    {
      code: EBank.stone,
      name: "Stone Pagamentos S.A.",
      image: "assets/images/banks/stone.webp"
    }
  ],
  [
    EBank.votorantim,
    {
      code: EBank.votorantim,
      name: "Banco Votorantim S.A.",
      image: "assets/images/banks/votorantim.webp"
    }
  ],
  [
    EBank.banrisul,
    {
      code: EBank.banrisul,
      name: "Banco do Estado do Rio Grande do Sul S.A. (Banrisul)",
      image: "assets/images/banks/banrisul.webp"
    }
  ],
  [
    EBank.sicredi,
    {
      code: EBank.sicredi,
      name: "Banco Cooperativo Sicredi S.A.",
      image: "assets/images/banks/sicredi.webp"
    }
  ],
  [
    EBank.sicoob,
    {
      code: EBank.sicoob,
      name: "Banco Cooperativo do Brasil S.A. (Sicoob)",
      image: "assets/images/banks/sicoob.webp"
    }
  ],
  [
    EBank.ailos,
    {
      code: EBank.ailos,
      name: "Cooperativa Central de Crédito Urbano (Ailos)",
      image: "assets/images/banks/ailos.webp"
    }
  ],
  [
    EBank.brb,
    {
      code: EBank.brb,
      name: "Banco de Brasília S.A. (BRB)",
      image: "assets/images/banks/brb.webp"
    }
  ],
  [
    EBank.mercantil,
    {
      code: EBank.mercantil,
      name: "Banco Mercantil do Brasil S.A.",
      image: "assets/images/banks/bancoMercantil.webp"
    }
  ],
  [
    EBank.safra,
    {
      code: EBank.safra,
      name: "Banco Safra S.A.",
      image: "assets/images/banks/safra.webp"
    }
  ],
  [
    EBank.hsbcBrasil,
    {
      code: EBank.hsbcBrasil,
      name: "HSBC Brasil S.A.",
      image: "assets/images/banks/hsbc.webp"
    }
  ],
  [
    EBank.abcBrasil,
    {
      code: EBank.abcBrasil,
      name: "Banco ABC Brasil S.A.",
      image: "assets/images/banks/abc.webp"
    }
  ],
  [
    EBank.citibank,
    {
      code: EBank.citibank,
      name: "Banco Citibank S.A.",
      image: "assets/images/banks/citi.webp"
    }
  ],
  [
    EBank.crefisa,
    {
      code: EBank.crefisa,
      name: "Banco Crefisa S.A",
      image: "assets/images/banks/crefisa.webp"
    }
  ]
]);
