import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentacaoCedenteComponent } from './documentacao-cedente.component';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';

class CedenteDataServiceMock {
  private dados = { arquivos: [], partes_relacionadas: [], avalistas: [] };

  obterDados() {
    return JSON.parse(JSON.stringify(this.dados));
  }

  adicionarOuAtualizarArquivo(arquivo: any): number {
    const indexExistente = this.dados.arquivos.findIndex(
      (item: any) => String(item.document_type) === String(arquivo.document_type)
    );

    if (indexExistente >= 0) {
      this.dados.arquivos[indexExistente] = arquivo;
      return indexExistente;
    }

    this.dados.arquivos.push(arquivo);
    return this.dados.arquivos.length - 1;
  }

  removerArquivoPorTipoDocumento(documentType: number | string): boolean {
    const index = this.dados.arquivos.findIndex(
      (item: any) => String(item.document_type) === String(documentType)
    );

    if (index < 0) {
      return false;
    }

    this.dados.arquivos.splice(index, 1);
    return true;
  }
}

describe('DocumentacaoCedenteComponent', () => {
  let component: DocumentacaoCedenteComponent;
  let fixture: ComponentFixture<DocumentacaoCedenteComponent>;
  let cedenteDataService: CedenteDataServiceMock;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentacaoCedenteComponent ],
      providers: [
        { provide: CedenteDataService, useClass: CedenteDataServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentacaoCedenteComponent);
    component = fixture.componentInstance;
    cedenteDataService = TestBed.get(CedenteDataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve substituir o arquivo existente ao editar o mesmo documento', async () => {
    const documento = component.documentos[0];
    const arquivoAnterior = new File(['arquivo-antigo'], 'antigo.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const arquivoNovo = new File(['arquivo-novo'], 'novo.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    spyOn<any>(component, 'fileToBase64').and.returnValues(
      Promise.resolve('base64-antigo'),
      Promise.resolve('base64-novo')
    );

    await component.onArquivoSelecionado({ target: { files: [arquivoAnterior], value: 'antigo.docx' } }, documento);
    await component.onArquivoSelecionado({ target: { files: [arquivoNovo], value: 'novo.docx' } }, documento);

    const dados = cedenteDataService.obterDados();

    expect(dados.arquivos.length).toBe(1);
    expect(dados.arquivos[0].original_name).toBe('novo.docx');
    expect(dados.arquivos[0].type).toBe('docx');
    expect(dados.arquivos[0].content_base64).toBe('base64-novo');
    expect(documento.nomeArquivo).toBe('novo.docx');
    expect(documento.tipoArquivo).toBe('docx');
  });

  it('deve remover o arquivo pelo tipo do documento', async () => {
    const documento = component.documentos[0];
    const arquivo = new File(['arquivo'], 'arquivo.pdf', { type: 'application/pdf' });

    spyOn<any>(component, 'fileToBase64').and.returnValue(Promise.resolve('base64-arquivo'));

    await component.onArquivoSelecionado({ target: { files: [arquivo], value: 'arquivo.pdf' } }, documento);
    component.removerArquivo(documento);

    const dados = cedenteDataService.obterDados();

    expect(dados.arquivos.length).toBe(0);
    expect(documento.arquivo).toBeUndefined();
    expect(documento.nomeArquivo).toBeUndefined();
  });

  it('deve disponibilizar a opção de anexar CNH', () => {
    const documento = component.documentos.find(doc => doc.titulo === 'CNH');

    expect(documento).toBeDefined();
    expect(documento?.obrigatorio).toBe(true);
  });

  it('deve preservar o mime type para imagem', async () => {
    const documento = component.documentos[0];
    const arquivo = new File(['imagem'], 'foto.png', { type: 'image/png' });

    spyOn<any>(component, 'fileToBase64').and.returnValue(Promise.resolve('base64-imagem'));

    await component.onArquivoSelecionado({ target: { files: [arquivo], value: 'foto.png' } }, documento);

    const dados = cedenteDataService.obterDados();

    expect(dados.arquivos[0].type).toBe('image/png');
    expect(documento.tipoArquivo).toBe('image/png');
  });

  it('deve hidratar documentos persistidos com document_type string numerica', () => {
    (cedenteDataService as any).dados = {
      partes_relacionadas: [],
      avalistas: [],
      arquivos: [
        {
          document_type: '1',
          original_name: 'contrato.pdf',
          type: 'application/pdf',
          tamanho: 2048
        }
      ]
    };

    component.ngOnInit();

    expect(component.documentos[0].nomeArquivo).toBe('contrato.pdf');
    expect(component.documentos[0].arquivo).toBeDefined();
  });

  it('deve criar documentos obrigatorios para partes relacionadas e avalistas cadastrados', () => {
    (cedenteDataService as any).dados = {
      partes_relacionadas: [
        { nome: 'Maria Silva', cpf: '12345678901', __documentacaoKey: 'parte_1' }
      ],
      avalistas: [
        { nome: 'Joao Souza', cpf: '10987654321', __documentacaoKey: 'avalista_1' }
      ],
      arquivos: []
    };

    component.ngOnInit();

    expect(component.documentosPartesRelacionadas.length).toBe(1);
    expect(component.documentosPartesRelacionadas[0].documentos.length).toBe(3);
    expect(component.documentosAvalistas.length).toBe(1);
    expect(component.documentosAvalistas[0].documentos.length).toBe(4);
    expect(component.validarDocumentosObrigatorios()).toBe(false);
  });

  it('deve salvar e remover arquivo dinamico por pessoa', async () => {
    (cedenteDataService as any).dados = {
      partes_relacionadas: [
        { nome: 'Maria Silva', cpf: '12345678901', __documentacaoKey: 'parte_1' }
      ],
      avalistas: [],
      arquivos: []
    };

    component.ngOnInit();

    const documento = component.documentosPartesRelacionadas[0].documentos[0];
    const arquivo = new File(['arquivo'], 'rg.pdf', { type: 'application/pdf' });

    spyOn<any>(component, 'fileToBase64').and.returnValue(Promise.resolve('base64-rg'));

    await component.onArquivoSelecionado({ target: { files: [arquivo], value: 'rg.pdf' } }, documento);

    let dados = cedenteDataService.obterDados();
    expect(dados.arquivos.length).toBe(1);
    expect(dados.arquivos[0].document_type).toContain('parte_relacionada::parte_1::');

    component.removerArquivo(documento);

    dados = cedenteDataService.obterDados();
    expect(dados.arquivos.length).toBe(0);
  });
});
