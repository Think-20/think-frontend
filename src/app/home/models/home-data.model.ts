
export interface HomeData {
    alertas: number;
    memorias: number;
    tempo_medio_aprovacao_dias: RefValue;
    intervalo_medio_aprovacao_dias: RefValue;
    ticket_medio_aprovacao: RefValue;
    maior_venda: RefValue;
    tendencia_aprovacao_anual: RefValue;
    media_aprovacao_mes: RefValue;
    ticket_medio_jobs: RefValue;
    ultimo_aprovado: string;
    ultimo_job_aprovado: string;
    eventos_rolando: string;
    aniversariante: string;
    comunicados: string;
    metas: string;
    recordes: string;
    ranking: {
        total: number;
    },
    jobs: {
        labels: string[];
        colors: string[];
        series: number[];
        meta_jobs: number;
        meta_aprovacao: number;
        total: number;
        aprovados: TotalPercentageAmount;
        avancados: TotalPercentageAmount;
        ajustes: TotalPercentageAmount; 
        stand_by: TotalPercentageAmount;
        reprovados: TotalPercentageAmount;
        metas: {
            ultimos_doze_meses: Goals;
            mes: Goals;
            quarter: Goals;
            anual: Goals;
        },
        em_producao: {
            total: number;
            total_em_producao: number;
            jobs: InProduction[]
        },
        prazo_final: TotalAmount;
    },
    jobs2: {
        labels: string[];
        colors: string[];
        series: string[];
        total: number;
        meta_jobs: number;
        meta_aprovacao: number;
    },
    tendencia: {
        meta_mensal: number;
        meses_ano: string[];
        colors: string[];
        series: Series[];
    }
    sold_out: TotalAmount;
}

export interface RefValue {
    total: number,
    ref: number,
}

export interface TotalPercentageAmount {
    total: number;
    porcentagem: number;
    valor: number;
}

export interface TotalAmount {
    total: number;
    valor: number;
}

export interface Goals {
    atual: number;
    meta: number;
    porcentagem: number;
}

export interface InProduction {
   total: number;
   valor: number;
   nome: string;
}

export interface Series {
    name: string;
    data: number[]
}