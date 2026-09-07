import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../login/auth.service';

type InfoCedenteTab = 'informacoes' | 'documentacao' | 'historico' | 'avaliacao';

@Component({
  selector: 'cb-infocedente',
  templateUrl: './infocedente.component.html',
  styleUrls: ['./infocedente.component.css']
})
export class InfocedenteComponent {

  @Input() cedente: any;

  @Output() onVoltar = new EventEmitter<void>();
  @Output() onEditar = new EventEmitter<void>();
  @Output() onAvaliacaoConcluida = new EventEmitter<string>();

  selectedTab: InfoCedenteTab = 'informacoes';

  constructor(private auth: AuthService) {}

  get podeEditarCedente(): boolean {
    const roleId = this.obterCedenteRoleIdUsuarioLogado();
    return roleId === null || roleId === 2 || roleId === 3;
  }

  voltar() {
    this.onVoltar.emit();
  }

  editar() {
    this.onEditar.emit();
  }

  finalizarAvaliacao(mensagem: string) {
    this.onAvaliacaoConcluida.emit(mensagem);
  }

  private obterCedenteRoleIdUsuarioLogado(): number | null {
    const usuario: any = this.auth.currentUser();

    const roleTopLevel = this.normalizarRoleId(
      usuario && usuario.cedente_role
    );
    const roleEmployee = this.normalizarRoleId(
      usuario && usuario.employee && usuario.employee.cedente_role
    );
    const roleRaw = roleTopLevel != null ? roleTopLevel : roleEmployee;

    if (roleRaw === null || roleRaw === undefined) {
      return null;
    }

    const roleId = Number(roleRaw);
    return Number.isNaN(roleId) ? null : roleId;
  }

  private normalizarRoleId(role: any): number | null {
    if (role === null || role === undefined || role === '') {
      return null;
    }

    const valorBruto = role && typeof role === 'object' && role.id !== undefined
      ? role.id
      : role;

    const roleId = Number(valorBruto);
    return Number.isNaN(roleId) ? null : roleId;
  }

  selectTab(tab: InfoCedenteTab) {
    this.selectedTab = tab;
  }

  isTabActive(tab: InfoCedenteTab): boolean {
    return this.selectedTab === tab;
  }

  get razaoSocial(): string {
    return this.pick(
      this.cedente && this.cedente.razao_social,
      this.cedente && this.cedente.nome,
      this.cedente && this.cedente.name,
      'Cedente não informado'
    );
  }

  get codigoCedente(): string {
    const codigo = this.pick(
      this.cedente && this.cedente.codigo,
      this.cedente && this.cedente.code
    );

    if (codigo) {
      return codigo;
    }

    const id = this.cedente && this.cedente.id;
    return id != null ? `CED-2026-${this.zeroPad(String(id), 3)}` : '-';
  }

  get documentoFormatado(): string {
    return this.pick(
      this.cedente && this.cedente.cnpj,
      this.cedente && this.cedente.documento,
      '-'
    );
  }

  get dataSubmissao(): string {
    const data = this.pick(
      this.cedente && this.cedente.data_submissao,
      this.cedente && this.cedente.created_at,
      this.cedente && this.cedente.updated_at
    );

    return this.formatarData(data);
  }

  get email(): string {
    return this.pick(this.cedente && this.cedente.email, this.cedente && this.cedente.contato_email, '-');
  }

  get telefone(): string {
    return this.pick(this.cedente && this.cedente.telefone, this.cedente && this.cedente.phone, '-');
  }

  get faturamentoAnual(): string {
    const valor = this.pick(
      this.cedente && this.cedente.faturamento_anual,
      this.cedente && this.cedente.faturamento,
      this.cedente && this.cedente.revenue
    );

    if (valor == null || valor === '') {
      return '-';
    }

    const numero = Number(String(valor).replace(/[^\d.,-]/g, '').replace('.', '').replace(',', '.'));
    if (Number.isNaN(numero)) {
      return String(valor);
    }

    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get minimoAssinantes(): string {
    return String(this.pick(
      this.cedente && this.cedente.minimo_assinantes,
      this.cedente && this.cedente.min_assinantes,
      this.cedente && this.cedente.minimo_de_assinantes,
      '-'
    ));
  }

  get endereco(): any {
    return (this.cedente && this.cedente.endereco) || {};
  }

  get consultoria(): string {
    return this.pick(
      this.cedente && this.cedente.consultoria,
      this.cedente && this.cedente.consultoria_nome,
      '-'
    );
  }

  get responsavel(): string {
    return this.pick(
      this.cedente && this.cedente.responsavel_nome,
      this.cedente && this.cedente.responsavel,
      this.cedente && this.cedente.pessoas_vinculadas && this.cedente.pessoas_vinculadas[0] && this.cedente.pessoas_vinculadas[0].nome,
      '-'
    );
  }

  get partesRelacionadas(): any[] {
    return this.obterLista(
      (this.cedente && this.cedente.partes_relacionadas) || (this.cedente && this.cedente.pessoas_vinculadas)
    );
  }

  get avalistas(): any[] {
    return this.obterLista(
      (this.cedente && this.cedente.avalistas) || (this.cedente && this.cedente.guarantores) || (this.cedente && this.cedente.guarantistas)
    );
  }

  get contasDesembolso(): any[] {
    return this.obterLista((this.cedente && this.cedente.contas_desembolso) || (this.cedente && this.cedente.contas));
  }

  get validacaoVaduChanges(): any {
    const historico = this.obterLista(this.cedente && this.cedente.historico);
    const item = historico.find((registro: any) => registro && registro.event === 'validacao_vadu');
    return (item && item.changes) || null;
  }

  get temRestricaoValidacaoVadu(): boolean {
    const changes = this.validacaoVaduChanges;
    return !!changes && changes.resultado === 'restricao';
  }

  get descricaoRestricaoVadu(): string {
    const changes = this.validacaoVaduChanges;
    return (changes && changes.descricao) || '';
  }

  private get sociosRestricaoVadu(): string[] {
    const changes = this.validacaoVaduChanges;
    const socios = changes && changes.socios;
    return Array.isArray(socios) ? socios.map((nome: any) => String(nome || '').trim().toLowerCase()) : [];
  }

  isAvalistaComRestricao(pessoa: any): boolean {
    return this.isPessoaComRestricao(pessoa, this.avalistas);
  }

  isParteRelacionadaComRestricao(pessoa: any): boolean {
    return this.isPessoaComRestricao(pessoa, this.partesRelacionadas);
  }

  private isPessoaComRestricao(pessoa: any, lista: any[]): boolean {
    if (!this.temRestricaoValidacaoVadu) {
      return false;
    }

    const nome = String((pessoa && pessoa.nome) || '').trim().toLowerCase();
    const socios = this.sociosRestricaoVadu;

    if (!nome || !socios.length) {
      return true;
    }

    const algumCorresponde = (lista || []).some((item: any) =>
      socios.includes(String((item && item.nome) || '').trim().toLowerCase())
    );

    return algumCorresponde ? socios.includes(nome) : true;
  }

  get inconsistencias(): any[] {
    return this.obterLista(this.cedente && this.cedente.inconsistencias);
  }

  get inconsistenciasComSerpro(): any[] {
    return this.inconsistencias.filter((item: any) => {
      const valor = item && item.valor_serpro;
      return valor !== null && valor !== undefined && String(valor).trim() !== '';
    });
  }

  getRotuloInconsistencia(campo: string): string {
    const valor = String(campo || '').trim().toLowerCase();

    const rotulos: { [key: string]: string } = {
      'nome': 'Razão Social na Receita Federal',
      'email': 'Email na Base Oficial',
      'telefone': 'Telefone na Base Oficial',
      'endereco.logradouro': 'Logradouro na Base Oficial',
      'endereco.numero': 'Número na Base Oficial',
      'endereco.complemento': 'Complemento na Base Oficial',
      'endereco.bairro': 'Bairro na Base Oficial',
      'endereco.cidade': 'Cidade na Base Oficial',
      'endereco.estado': 'Estado na Base Oficial',
      'partes_relacionadas[0].nome': 'Parte Relacionada (Nome) na Base Oficial',
      'socios[0].nome': 'Sócio (Nome) na Base Oficial'
    };

    if (rotulos[valor]) {
      return rotulos[valor];
    }

    return `Valor oficial para ${campo}`;
  }

  getValorSerproInconsistencia(item: any): string {
    return this.formatarValor(item && item.valor_serpro);
  }

  isCampoInconsistente(campo: string): boolean {
    const campoNormalizado = String(campo || '').toLowerCase();
    if (!campoNormalizado) {
      return false;
    }

    return this.inconsistencias.some((item: any) => {
      const campoInconsistente = String((item && item.campo_inconsistente) || '').toLowerCase();

      if (!campoInconsistente) {
        return false;
      }

      if (campoInconsistente === campoNormalizado) {
        return true;
      }

      // Compatibilidade: backend pode enviar socios[x].nome para o nome de parte relacionada.
      if (campoNormalizado.includes('partes_relacionadas[') && campoNormalizado.endsWith('].nome') && campoInconsistente.includes('socios[') && campoInconsistente.endsWith('].nome')) {
        return true;
      }

      return false;
    });
  }

  getValorSerproCampo(campo: string): string {
    const campoNormalizado = String(campo || '').toLowerCase();
    if (!campoNormalizado) {
      return '';
    }

    const inconsistencia = this.inconsistencias.find((item: any) => {
      const campoInconsistente = String((item && item.campo_inconsistente) || '').toLowerCase();

      if (campoInconsistente === campoNormalizado) {
        return true;
      }

      if (campoNormalizado.includes('partes_relacionadas[') && campoNormalizado.endsWith('].nome') && campoInconsistente.includes('socios[') && campoInconsistente.endsWith('].nome')) {
        return true;
      }

      return false;
    });

    return this.formatarValor(inconsistencia && inconsistencia.valor_serpro);
  }

  getMensagemDivergencia(rotuloCampo: string, usarEmpresarial: boolean = false): string {
    const rotulo = String(rotuloCampo || '').trim().toLowerCase();
    if (!rotulo) {
      return 'Informação divergente do cadastro oficial';
    }

    if (usarEmpresarial) {
      return `${rotulo} empresarial divergente do cadastro oficial`;
    }

    return `${rotulo} divergente do cadastro oficial`;
  }

  get dadosGeraisPartesRelacionadas(): Array<{ label: string; valor: string }> {
    return this.getDadosGeraisPessoa(this.partesRelacionadas[0]);
  }

  getDadosGeraisPessoa(pessoa: any): Array<{ label: string; valor: string }> {
    const dados = [
      { label: 'Nome', valor: this.formatarValor(pessoa && pessoa.nome) },
      { label: 'CPF/CNPJ', valor: this.formatarValor((pessoa && pessoa.cpf) || (pessoa && pessoa.documento)) },
      { label: 'Email', valor: this.formatarValor(pessoa && pessoa.email) },
      { label: 'Telefone', valor: this.formatarValor(pessoa && pessoa.telefone) },
      { label: 'Tipo', valor: this.formatarValor((pessoa && pessoa.tipo_parte_relacionada) || (pessoa && pessoa.tipo_avalista) || (pessoa && pessoa.tipo)) },
      { label: 'Beneficiário Final', valor: this.formatarValor(pessoa && pessoa.beneficiario_final) },
      { label: 'Assinante da Operação', valor: this.formatarValor(pessoa && pessoa.assinante_operacao) },
      { label: 'Assinante Obrigatório', valor: this.formatarValor(pessoa && pessoa.assinante_obrigatorio) }
    ];

    return dados.filter(item => item.valor !== '-');
  }

  getDadosComplementaresPessoa(pessoa: any): Array<{ label: string; valor: string }> {
    const dados = [
      { label: 'Nacionalidade', valor: this.formatarValor(pessoa && pessoa.nacionalidade) },
      { label: 'Estado Civil', valor: this.formatarValor(pessoa && pessoa.estado_civil) },
      { label: 'Regime de Casamento', valor: this.formatarValor(pessoa && pessoa.regime_casamento) },
      { label: 'Profissão', valor: this.formatarValor(pessoa && pessoa.profissao) }
    ];

    return dados.filter(item => item.valor !== '-');
  }

  getEnderecoPessoa(pessoa: any): Array<{ label: string; valor: string }> {
    const endereco = (pessoa && pessoa.endereco) || {};
    const dados = [
      { label: 'CEP', valor: this.formatarValor(endereco.cep) },
      { label: 'Rua', valor: this.formatarValor(endereco.rua || endereco.logradouro) },
      { label: 'Número', valor: this.formatarValor(endereco.numero) },
      { label: 'Complemento', valor: this.formatarValor(endereco.complemento) },
      { label: 'Bairro', valor: this.formatarValor(endereco.bairro) },
      { label: 'Cidade', valor: this.formatarValor(endereco.cidade) },
      { label: 'Estado', valor: this.formatarValor(endereco.estado || endereco.uf) },
      { label: 'País', valor: this.formatarValor(endereco.pais || 'Brasil') }
    ];

    return dados.filter(item => item.valor !== '-');
  }

  private obterLista(valor: any): any[] {
    if (Array.isArray(valor)) {
      return valor;
    }

    if (valor && typeof valor === 'object') {
      return [valor];
    }

    return [];
  }

  private pick(...values: any[]): any {
    for (const value of values) {
      if (value !== null && typeof value !== 'undefined' && String(value).trim() !== '') {
        return value;
      }
    }

    return null;
  }

  private formatarData(valor: any): string {
    if (!valor) {
      return '-';
    }

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) {
      return String(valor);
    }

    return data.toLocaleDateString('pt-BR');
  }

  private zeroPad(value: string, length: number): string {
    if (value.length >= length) {
      return value;
    }

    return new Array(length - value.length + 1).join('0') + value;
  }

  private formatarValor(valor: any): string {
    if (valor === null || valor === undefined || valor === '') {
      return '-';
    }

    if (typeof valor === 'boolean') {
      return valor ? 'Sim' : 'Não';
    }

    return String(valor);
  }

}