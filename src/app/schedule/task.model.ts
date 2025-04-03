import { Employee } from "../employees/employee.model";
import { JobActivity } from "../job-activities/job-activity.model";
import { Job } from "../jobs/job.model";
import { TaskItem } from "./task-item.model";
import { ProjectFile } from "../projects/project-file.model";
import { Budget } from "../budgets/budget.model";
import { SpecificationFile } from "app/specification/specification-file.model";
import { BriefingFile } from 'app/briefing/briefing-file.model';
import { ContractNfFile } from 'app/contract-nf/contract-nf-file.model';
import { ProjectPhotosFile } from 'app/project-photos/project-photos-file.model';

export class Task {
  id: number
  responsible_id: number
  responsible?: Employee
  duration: number
  job_activity_id: number
  job_activity?: JobActivity
  job_id: number
  job?: Job
  reopened?: number
  items?: TaskItem[]
  briefing_files?: BriefingFile[];
  contract_nf_files?: ContractNfFile[];
  project_photos_files?: ProjectPhotosFile[];
  project_files?: ProjectFile[]
  specification_files?: SpecificationFile[]
  budget?: Budget
  done?: number
  task_id?: number
  task?: Task
  orders_value?: number
  attendance_value?: number
  creation_value?: number
  pre_production_value?: number
  production_value?: number
  details_value?: number
  budget_si_value?: number
  bv_value?: number
  over_rates_value?: number
  discounts_value?: number
  taxes_value?: number
  logistics_value?: number
  equipment_value?: number
  total_cost_value?: number
  gross_profit_value?: number
  profit_value?: number
  final_value?: number
  updated_by?: string
  updated_at?: Date


  marcenaria?: number
  revestimentos_epeciais?: number
  estrutura_metalicas?: number
  material_mezanino?: number
  fechamento_vidro?: number
  vitrines?: number
  acrilico?: number
  mobiliario?: number
  refrigeracao_climatizacao?: number
  paisagismo?: number
  comunicacao_visual?: number
  equipamento_audio_visual?: number
  itens_especiais?: number
  execucao?: number
  operacional_logistica?: number
  operacional_logistica_porcentagem?: number;
  servico_diversos_operacional?: number
  coeficiente_margem?: number

  mezanino?: number
  dt_inicio_event?: Date
  dt_montagem?: Date
  dt_fim_event?: Date
  dt_desmontagem?: Date
  dt_event?: Date

  custo_total_meta_porcentagem?: number
  imposto_meta_porcentagem?: number
  comissao_vendas_meta_porcentagem?: number
  bonificacao_venda_meta_porcentagem?: number;
  bonificacao_projeto_interno_meta_porcentagem?: number
  bonificacao_orcamento_meta_porcentagem?: number
  bonificacao_gerente_producao_meta_porcentagem?: number
  bonificacao_producao_meta_porcentagem?: number
  bonificacao_detalhamento_meta_porcentagem?: number
  total_estande_meta_porcentagem?: number
  m2_venda_stand_meta_porcentagem?:number
  m2_venda_stand_logistica_equipamentos_meta_porcentagem?: number
  diversos_operacional_meta_porcentagem?: number
  frete_logistica_meta_porcentagem?: number
  
  custo_total_coeficiente?: number
  imposto_coeficiente?: number
  comissao_vendas_coeficiente?: number
  bonificacao_venda_coeficiente?: number;
  bonificacao_projeto_interno_coeficiente?: number
  bonificacao_orcamento_coeficiente?: number
  bonificacao_gerente_producao_coeficiente?: number
  bonificacao_producao_coeficiente?: number
  bonificacao_detalhamento_coeficiente?: number
  total_estande_coeficiente?: number
  frete_logistica_coeficiente?: number
  diversos_operacional_coeficiente?: number
  m2_venda_stand_coeficiente?: number
  m2_venda_stand_logistica_equipamentos_coeficiente?: number

  marcenaria_reaproveitamento?: number
  revestimentos_epeciais_reaproveitamento?: number
  estrutura_metalicas_reaproveitamento?: number
  material_mezanino_reaproveitamento?: number
  fechamento_vidro_reaproveitamento?: number
  vitrines_reaproveitamento?: number
  acrilico_reaproveitamento?: number
  mobiliario_reaproveitamento?: number
  refrigeracao_climatizacao_reaproveitamento?: number
  paisagismo_reaproveitamento?: number
  comunicacao_visual_reaproveitamento?: number
  equipamento_audio_visual_reaproveitamento?: number
  itens_especiais_reaproveitamento?: number
  execucao_reaproveitamento?: number
  frete_logistica_reaproveitamento?: number
  diversos_operacional_reaproveitamento?: number
  operacional_logistica_reaproveitamento?: number
  servico_diversos_operacional_reaproveitamento?: number

  credenciais_taxas?: number;
  credenciais_taxas_reaproveitamento?: number;
  credenciais_taxas_porcentagem?: number;
  seguro?: number;
  seguro_reaproveitamento?: number;
  seguro_porcentagem?: number;
  desconto?: number;
  desconto_reaproveitamento?: number;
  desconto_porcentagem?: number;
}
