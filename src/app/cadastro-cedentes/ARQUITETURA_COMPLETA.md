# Arquitetura Completa - Cadastro de Cedentes

## 1. Estrutura de Estado Global

O `CedenteDataService` centraliza todo o estado da aplicação:

```typescript
// cedente-data.service.ts
interface CedenteData {
  nome: string;
  documento: string;
  email: string;
  faturamento_anual: number | null;
  minimo_assinantes: number | null;
  sistema_financeiro_nacional: boolean;
  telefone: string;
  endereco: {...};
  partes_relacionadas: any[];  // Array dinâmico
  avalistas: any[];            // Array dinâmico
  contas_desembolso: any[];    // Array dinâmico
  arquivos: any[];             // Base64 conversão
}
```

### Características:
- **BehaviorSubject**: Mantém estado reativo
- **localStorage**: Persiste dados entre sessions
- **Métodos tipados**: Para add/update/remove com validação
- **Notificação automática**: Ao modificar dados, todos subscribers são atualizados

---

## 2. Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                   NOVO CEDENTE (Principal)                  │
├─────────────────────────────────────────────────────────────┤
│ • FormDadosCadastrais (11 campos)                            │
│ • FormInfoGerais (4 campos)                                  │
│ • Renderiza componentes dinâmicos                            │
└────────────────┬──────────────────────────────────────────┬─┘
                 │                                          │
       ┌─────────▼──────────┐                   ┌──────────▼────────┐
       │ PARTES RELACIONADAS │                   │ CONTAS DESEMBOLSO │
       ├────────────────────┤                   ├───────────────────┤
       │ 4 Formulários      │                   │ 1 Formulário      │
       │ Cria array item    │                   │ Cria array item   │
       │ via serviço        │                   │ via serviço       │
       └────────────────────┘                   └───────────────────┘
                 │
       ┌─────────▼──────────┐
       │     AVALISTAS      │
       ├────────────────────┤
       │ 4 Formulários      │
       │ Cria array item    │
       │ via serviço        │
       └────────────────────┘

       ┌──────────────────────────────┐
       │     DOCUMENTAÇÃO             │
       ├──────────────────────────────┤
       │ Upload de arquivos           │
       │ Converte Base64              │
       │ Adiciona ao array do serviço │
       └──────────────────────────────┘

       ┌──────────────────────────────┐
       │     REVISÃO FINAL            │
       ├──────────────────────────────┤
       │ Renderiza arrays dinamicamente│
       │ Consolidat payload           │
       │ Submete POST                 │
       └──────────────────────────────┘

              ↓ CedenteDataService ↓
       
    localStorage (persistência)
```

---

## 3. Como Implementar Componentes Dinâmicos

### Exemplo: Componente `partes-relacionadas`

```typescript
// partes-relacionadas.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';

@Component({
  selector: 'cb-partes-relacionadas',
  templateUrl: './partes-relacionadas.component.html',
  styleUrls: ['./partes-relacionadas.component.css']
})
export class PartesRelacionadasComponent implements OnInit {

  // Recebe o índice do item no array
  @Input() itemIndex: number = 0;
  
  // Emite quando o usuário salva os dados
  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  // Todos os formulários do componente
  formPartesRelacionadas: FormGroup;
  formCheck: FormGroup;
  formDadosComplementares: FormGroup;
  formEndereco: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cedenteDataService: CedenteDataService
  ) {
    this.formPartesRelacionadas = this.fb.group({...});
    this.formCheck = this.fb.group({...});
    this.formDadosComplementares = this.fb.group({...});
    this.formEndereco = this.fb.group({...});
  }

  ngOnInit() {
    // Se estiver editando um item existente, carrega os dados
    const partes = this.cedenteDataService.obterPartesRelacionadas();
    if (partes.length > this.itemIndex) {
      this.preencherFormularios(partes[this.itemIndex]);
    }
  }

  /**
   * Consolida todos os 4 formulários em um único objeto
   */
  private consolidarFormularios(): any {
    return {
      // Dados de FormPartesRelacionadas
      campo1: this.formPartesRelacionadas.value.campo1,
      campo2: this.formPartesRelacionadas.value.campo2,
      // ... resto dos 6 campos
      
      // Dados de FormCheck (3 campos)
      check1: this.formCheck.value.check1,
      // ... resto dos 3 campos
      
      // Dados de FormDadosComplementares (3 campos)
      complemento1: this.formDadosComplementares.value.complemento1,
      // ... resto dos 3 campos
      
      // Dados de FormEndereco (8 campos)
      cep: this.formEndereco.value.cep,
      logradouro: this.formEndereco.value.logradouro,
      // ... resto dos 8 campos
    };
  }

  /**
   * Salva os dados via serviço
   */
  salvar() {
    if (!this.validarFormularios()) {
      console.error('Formulários inválidos');
      return;
    }

    const dadosConsolidados = this.consolidarFormularios();

    // Se é um novo item
    if (this.itemIndex === -1 || this.itemIndex === undefined) {
      const index = this.cedenteDataService.adicionarParteRelacionada(dadosConsolidados);
      this.onSave.emit({ index, data: dadosConsolidados });
    } 
    // Se está atualizando um item existente
    else {
      const sucesso = this.cedenteDataService.atualizarParteRelacionada(this.itemIndex, dadosConsolidados);
      if (sucesso) {
        this.onSave.emit({ index: this.itemIndex, data: dadosConsolidados });
      }
    }
  }

  private validarFormularios(): boolean {
    return (
      this.formPartesRelacionadas.valid &&
      this.formCheck.valid &&
      this.formDadosComplementares.valid &&
      this.formEndereco.valid
    );
  }

  private preencherFormularios(data: any) {
    if (data) {
      this.formPartesRelacionadas.patchValue(data);
      this.formCheck.patchValue(data);
      this.formDadosComplementares.patchValue(data);
      this.formEndereco.patchValue(data);
    }
  }

  cancelar() {
    this.onCancel.emit();
  }
}
```

---

## 4. Componente Principal (novo-cedente)

```typescript
// novo-cedente.component.ts
export class NovoCedenteComponent implements OnInit {

  // Arrays para rastrear formulários abertos
  partesRelacionadasForms: any[] = [];
  avalistaForms: any[] = [];
  contasDesembolsoForms: any[] = [];

  private nextParteRelacionadaIndex = 0;
  private nextAvalistaIndex = 0;
  private nextContaDesembolsoIndex = 0;

  constructor(
    private cedenteDataService: CedenteDataService
  ) {}

  /**
   * Abrir novo formulário de Parte Relacionada
   */
  abrirPartesRelacionadas() {
    this.partesRelacionadasForms.push({
      id: this.nextParteRelacionadaIndex++,
      editing: false
    });
  }

  /**
   * Callback quando componente dinâmico salva
   */
  onParteRelacionadaSalva(event: any) {
    console.log('Parte relacionada salva no índice:', event.index);
    // O componente já salvou via serviço, basta remover o formulário
    this.removerParteRelacionadaForm(event.index);
  }

  /**
   * Remover formulário dinâmico
   */
  removerParteRelacionadaForm(index: number) {
    this.partesRelacionadasForms = this.partesRelacionadasForms.filter(
      f => f.id !== index
    );
  }

  /**
   * Remover item do array global
   */
  removerParteRelacionada(index: number) {
    this.cedenteDataService.removerParteRelacionada(index);
  }

  // ... Métodos similares para avalistas e contas de desembolso
}
```

---

## 5. Componente de Revisão Dinâmica

```typescript
// revicao-final.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'cb-revicao-final',
  templateUrl: './revicao-final.component.html',
  styleUrls: ['./revicao-final.component.css']
})
export class RevicaoFinalComponent implements OnInit {

  dados: any = {};
  submitting = false;

  constructor(
    private http: HttpClient,
    private cedenteDataService: CedenteDataService
  ) {}

  ngOnInit() {
    // Subscribe aos dados do serviço
    // Assim, sempre que dados mudam, a revisão atualiza automaticamente
    this.cedenteDataService.obterDados$().subscribe(
      (dados) => {
        this.dados = dados;
      }
    );
  }

  /**
   * Submeter cadastro completo
   */
  async submeterCadastro() {
    if (this.submitting) return;
    
    this.submitting = true;

    try {
      // Consolidar payload final com todos os dados
      const payload = this.cedenteDataService.consolidarPayloadFinal();

      // Garantir arrays vazios
      payload.partes_relacionadas = payload.partes_relacionadas || [];
      payload.avalistas = payload.avalistas || [];
      payload.contas_desembolso = payload.contas_desembolso || [];
      payload.arquivos = payload.arquivos || [];

      console.log('Payload final:', payload);

      // Fazer requisição POST
      const url = `${environment.api}/cedente/save`;
      const response = await this.http.post(url, payload).toPromise();

      console.log('Cadastro enviado com sucesso:', response);
      
      // Resetar dados após sucesso
      this.cedenteDataService.resetarDados();
      
      // Notificar sucesso (mostrar modal/toast)
      this.showSucesso('Cadastro enviado com sucesso!');
    } catch (err) {
      console.error('Erro ao submeter cadastro:', err);
      this.showErro('Erro ao enviar cadastro. Tente novamente.');
    } finally {
      this.submitting = false;
    }
  }

  private showSucesso(mensagem: string) {
    // TODO: Implementar toast/modal de sucesso
  }

  private showErro(mensagem: string) {
    // TODO: Implementar toast/modal de erro
  }
}
```

### Template da Revisão (revicao-final.component.html):

```html
<div class="revisao-container">
  
  <!-- DADOS CADASTRAIS -->
  <section class="secao">
    <h2>Dados Cadastrais</h2>
    <div class="painel">
      <p><strong>Nome:</strong> {{ dados.nome }}</p>
      <p><strong>Documento:</strong> {{ dados.documento }}</p>
      <p><strong>Email:</strong> {{ dados.email }}</p>
      <p><strong>Telefone:</strong> {{ dados.telefone }}</p>
      <p><strong>Faturamento Anual:</strong> {{ dados.faturamento_anual | currency }}</p>
      <p><strong>Mínimo Assinantes:</strong> {{ dados.minimo_assinantes }}</p>
      <p><strong>SFN:</strong> {{ dados.sistema_financeiro_nacional ? 'Sim' : 'Não' }}</p>
    </div>
  </section>

  <!-- ENDEREÇO -->
  <section class="secao" *ngIf="dados.endereco">
    <h2>Endereço</h2>
    <div class="painel">
      <p><strong>CEP:</strong> {{ dados.endereco.cep }}</p>
      <p><strong>Logradouro:</strong> {{ dados.endereco.logradouro }}</p>
      <p><strong>Número:</strong> {{ dados.endereco.numero }}</p>
      <p><strong>Complemento:</strong> {{ dados.endereco.complemento }}</p>
      <p><strong>Bairro:</strong> {{ dados.endereco.bairro }}</p>
      <p><strong>Estado:</strong> {{ dados.endereco.estado }}</p>
      <p><strong>Cidade:</strong> {{ dados.endereco.cidade }}</p>
      <p><strong>País:</strong> {{ dados.endereco.pais }}</p>
    </div>
  </section>

  <!-- PARTES RELACIONADAS (Dinâmico) -->
  <section class="secao" *ngIf="dados.partes_relacionadas && dados.partes_relacionadas.length > 0">
    <h2>Partes Relacionadas ({{ dados.partes_relacionadas.length }})</h2>
    <div class="painel" *ngFor="let parte of dados.partes_relacionadas; let i = index">
      <h3>Parte {{i + 1}}</h3>
      <p><strong>Campo 1:</strong> {{ parte.campo1 }}</p>
      <p><strong>Campo 2:</strong> {{ parte.campo2 }}</p>
      <!-- ... resto dos campos -->
    </div>
  </section>

  <!-- AVALISTAS (Dinâmico) -->
  <section class="secao" *ngIf="dados.avalistas && dados.avalistas.length > 0">
    <h2>Avalistas ({{ dados.avalistas.length }})</h2>
    <div class="painel" *ngFor="let avalista of dados.avalistas; let i = index">
      <h3>Avalista {{i + 1}}</h3>
      <p><strong>Nome:</strong> {{ avalista.nome }}</p>
      <!-- ... resto dos campos -->
    </div>
  </section>

  <!-- CONTAS DE DESEMBOLSO (Dinâmico) -->
  <section class="secao" *ngIf="dados.contas_desembolso && dados.contas_desembolso.length > 0">
    <h2>Contas de Desembolso ({{ dados.contas_desembolso.length }})</h2>
    <div class="painel" *ngFor="let conta of dados.contas_desembolso; let i = index">
      <h3>Conta {{i + 1}}</h3>
      <p><strong>Banco:</strong> {{ conta.banco }}</p>
      <!-- ... resto dos campos -->
    </div>
  </section>

  <!-- ARQUIVOS (Dinâmico) -->
  <section class="secao" *ngIf="dados.arquivos && dados.arquivos.length > 0">
    <h2>Arquivos ({{ dados.arquivos.length }})</h2>
    <div class="painel" *ngFor="let arquivo of dados.arquivos; let i = index">
      <p><strong>Documento {{i + 1}}:</strong> {{ arquivo.original_name }}</p>
    </div>
  </section>

  <!-- BOTÃO SUBMETER -->
  <button 
    (click)="submeterCadastro()" 
    [disabled]="submitting"
    class="btn-submit"
  >
    {{ submitting ? 'Enviando...' : 'Submeter cadastro para aprovação' }}
  </button>
</div>
```

---

## 6. Documentação de Campos

### FormDadosCadastrais (11 campos)
```
- nome
- documento
- email
- faturamento_anual
- minimo_assinantes
- cep
- logradouro
- numero
- complemento
- bairro
- sistema_financeiro_nacional
```

### FormInfoGerais (4 campos)
```
- estado
- telefone
- cidade
- pais
```

### FormPartesRelacionadas (6 campos)
```
- campo1
- campo2
- campo3
- campo4
- campo5
- campo6
```

### FormCheck (3 campos)
```
- check1
- check2
- check3
```

### FormDadosComplementares (3 campos)
```
- complemento1
- complemento2
- complemento3
```

### FormEndereco (8 campos)
```
- cep
- logradouro
- numero
- complemento
- bairro
- estado
- cidade
- pais
```

### FormularioDesembolso (6 campos)
```
- campo1
- campo2
- campo3
- campo4
- campo5
- campo6
```

### FormDadosCadastraisAvalistas (4 campos)
```
- nome
- documento
- email
- telefone
```

### FormDadosComplementaresAvalistas (4 campos)
```
- complemento1
- complemento2
- complemento3
- complemento4
```

### FormEnderecosAvalistas (8 campos)
```
- cep
- logradouro
- numero
- complemento
- bairro
- estado
- cidade
- pais
```

---

## 7. Fluxo de Submissão

```
1. Usuário clica "Submeter cadastro para aprovação"
2. revicao-final.submeterCadastro() é acionado
3. CedenteDataService.consolidarPayloadFinal() monta o objeto final
4. Payload é validado
5. HttpClient.post() é feito para /cedente/save
6. Resposta é tratada
7. Dados são resetados no serviço
8. localStorage é limpo
9. Usuário é redirecionado ou vê mensagem de sucesso
```

---

## 8. Boas Práticas Implementadas

- ✅ **Separação de responsabilidades**: Serviço cuida de estado, componentes de UI
- ✅ **Reatividade**: BehaviorSubject permite que múltiplos componentes subscrever
- ✅ **Persistência**: localStorage previne perda de dados em refresh
- ✅ **Validação**: Métodos verificam dados antes de adicionar
- ✅ **Tipagem**: TypeScript com interfaces garante segurança de tipos
- ✅ **Escalabilidade**: Fácil adicionar novos arrays/campos
- ✅ **Desacoplamento**: Componentes não dependem uns dos outros
- ✅ **Cópia profunda**: Previne mutações acidentais

---

## 9. Como Testar

```bash
# 1. Preencher dados cadastrais em novo-cedente
# 2. Adicionar 2-3 partes relacionadas
# 3. Adicionar 1-2 avalistas
# 4. Adicionar conta desembolso
# 5. Adicionar documentos com upload
# 6. Navegar para revisão
# 7. Verificar que todos os dados aparecem
# 8. Clicar Submeter
# 9. Checar console e Network para POST
```

---

## 10. Melhorias Futuras

- [ ] Upload de arquivos multipart/form-data (não Base64)
- [ ] Validação em tempo real
- [ ] Edição de itens já adicionados
- [ ] Duplicação de itens
- [ ] Importação/Exportação de dados
- [ ] Modo draft (auto-save)
- [ ] Histórico de alterações
