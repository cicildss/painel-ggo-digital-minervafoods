export interface Gestor {
  name: string;
  email: string;
  role: string;
  macro: string;
  negocio: string;
  cost_centers: string[];
}

export interface Metadata {
  admins: string[];
  gestores: Gestor[];
  years: number[];
  months: { id: number; name: string }[];
  total_records: number;
}

export interface MonthlyRecord {
  year: number;
  month: number;
  month_name: string;
  orcado: number;
  realizado: number;
  desvio: number;
  desvio_pct: number;
}

export interface CostCenterRecord {
  code: string;
  description: string;
  orcado: number;
  realizado: number;
  desvio: number;
  desvio_pct: number;
  gestor: string;
  email_gestor: string;
  macroarea: string;
  negocio: string;
}

export interface PackageRecord {
  package: string;
  type: 'Folha' | 'Não Folha';
  orcado: number;
  realizado: number;
  desvio: number;
  desvio_pct: number;
}

export interface AnalyticsRecord {
  data: string;
  documento: string;
  conta: string;
  desc_conta: string;
  pacote: string;
  centro_custo: string;
  desc_centro: string;
  gestor: string;
  email_gestor: string;
  macroarea: string;
  tipo: 'Orçado' | 'Realizado';
  valor: number;
}
