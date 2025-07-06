# Arquitetura e Design do Sistema de Gestão de Horários Acadêmicos

**Autor**: Manus AI  
**Data**: 6 de julho de 2025  
**Versão**: 1.0

## Resumo Executivo

Este documento apresenta a arquitetura completa e o design detalhado do sistema de gestão de horários acadêmicos, desenvolvido para substituir e aprimorar as funcionalidades do SGE (Sistema de Gestão Educacional) existente. O sistema proposto utiliza tecnologias modernas (React, Node.js, MongoDB) e oferece uma interface intuitiva especialmente projetada para usuários familiarizados com o Microsoft Excel, mantendo a compatibilidade total com o software FET (Free Timetabling Software) para geração de horários otimizados.

O objetivo principal é criar uma solução que capture a essência funcional do SGE atual, mas apresente-a através de uma interface superior, com validações inteligentes, fluxos de trabalho otimizados e uma experiência do usuário significativamente aprimorada. O sistema não busca replicar pixel por pixel o SGE existente, mas sim extrair sua lógica de negócio fundamental e apresentá-la de forma mais eficiente e user-friendly.

## 1. Visão Geral da Arquitetura

### 1.1 Arquitetura de Alto Nível

O sistema adota uma arquitetura de três camadas (3-tier architecture) moderna, separando claramente as responsabilidades entre apresentação, lógica de negócio e persistência de dados. Esta abordagem garante escalabilidade, manutenibilidade e flexibilidade para futuras expansões.

**Camada de Apresentação (Frontend)**:
- Framework: React 18+ com TypeScript
- Gerenciamento de Estado: Redux Toolkit
- Interface: Material-UI (MUI) com customizações
- Comunicação: Axios para requisições HTTP
- Validação: Formik + Yup para formulários

**Camada de Lógica de Negócio (Backend)**:
- Runtime: Node.js 18+ com TypeScript
- Framework: Express.js com middleware customizado
- Autenticação: JWT (JSON Web Tokens)
- Validação: Joi para validação de dados
- Documentação: Swagger/OpenAPI 3.0

**Camada de Persistência (Banco de Dados)**:
- Banco Principal: MongoDB Atlas (nuvem)
- ODM: Mongoose para modelagem de dados
- Cache: Redis para sessões e cache de consultas
- Backup: Estratégia automatizada no MongoDB Atlas

### 1.2 Padrões Arquiteturais Adotados

**Model-View-Controller (MVC)**: Implementado no backend para separar a lógica de apresentação da lógica de negócio.

**Repository Pattern**: Utilizado para abstrair o acesso aos dados, facilitando testes e manutenção.

**Service Layer Pattern**: Camada intermediária que encapsula a lógica de negócio complexa.

**Observer Pattern**: Implementado para notificações em tempo real sobre mudanças de status.

## 2. Modelagem do Banco de Dados MongoDB

### 2.1 Estratégia de Modelagem

A modelagem do banco de dados MongoDB foi projetada considerando as características NoSQL do sistema, priorizando a desnormalização estratégica para otimizar consultas frequentes, mantendo a integridade referencial através de validações na camada de aplicação.

### 2.2 Coleções Principais

#### 2.2.1 Coleção `users`

Esta coleção centraliza todos os usuários do sistema, implementando um sistema de papéis flexível que suporta os três tipos principais identificados na análise: Coordenador, Professor e Administrador.

```javascript
{
  _id: ObjectId,
  name: String, // Nome completo do usuário
  email: String, // Email único para login
  password: String, // Hash da senha (bcrypt)
  role: String, // "coordinator", "teacher", "administrator"
  isActive: Boolean, // Status ativo/inativo
  profile: {
    phone: String,
    department: String,
    specializations: [String], // Áreas de especialização
    preferences: {
      language: String, // "pt-BR", "en-US"
      timezone: String,
      notifications: {
        email: Boolean,
        system: Boolean
      }
    }
  },
  permissions: [String], // Permissões específicas
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.2.2 Coleção `courses`

Representa os cursos oferecidos pela instituição, com informações detalhadas extraídas diretamente dos formulários do SGE analisado.

```javascript
{
  _id: ObjectId,
  name: String, // "Curso Superior de Tecnologia em Gestão Comercial"
  divulgationName: String, // Nome para divulgação (opcional)
  sigla: String, // "TGC" - Campo chave para nomenclatura
  codigoSuap: String, // Código no sistema SUAP (opcional)
  eixo: String, // "Gestão e Negócios"
  modalidadeOferta: String, // "Presencial", "EAD", "Híbrido"
  formaOferta: String, // "Superior", "Técnico", "Pós-graduação"
  valorHoraAula: Number, // Valor da hora/aula para cálculos
  tags: [String], // ["Semestral", "Graduação"]
  coordinator: ObjectId, // Referência para users
  description: String, // Descrição detalhada do curso
  duration: {
    semesters: Number, // Duração em semestres
    totalHours: Number // Carga horária total
  },
  status: String, // "active", "inactive", "planning"
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.2.3 Coleção `studentGroups`

Representa as turmas de alunos, com vinculação direta aos cursos e informações específicas para otimização de horários.

```javascript
{
  _id: ObjectId,
  name: String, // "AGO2023" - Padrão SIGLA + ANO
  codigoSuap: String, // Código no sistema SUAP
  course: ObjectId, // Referência para courses
  numberOfStudents: Number, // Quantidade de alunos
  conclusionDate: Date, // Data prevista de conclusão
  periodosOcorrencia: [String], // ["Noturno", "Matutino"]
  salasPreferenciais: [ObjectId], // Referências para rooms
  semester: Number, // Semestre atual da turma
  year: Number, // Ano de ingresso
  status: String, // "active", "concluded", "suspended"
  characteristics: {
    hasSpecialNeeds: Boolean,
    requiresLab: Boolean,
    maxConsecutiveClasses: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.2.4 Coleção `subjects`

Armazena as disciplinas oferecidas, com informações detalhadas sobre carga horária e requisitos específicos.

```javascript
{
  _id: ObjectId,
  name: String, // "A Arte na Ciência"
  course: ObjectId, // Referência para courses
  modulo: String, // "1", "2", "3"...
  tags: [String], // ["Semestral", "Optativa"]
  areasConhecimento: [String], // Áreas de conhecimento
  salasPreferenciais: [ObjectId], // Referências para rooms
  ementa: {
    versaoPPC: String, // "2023"
    dataVigencia: Date,
    cargaHorariaTotal: Number, // Total_Duration do FET
    cargaHorariaEAD: Number, // Carga horária EAD
    cargaHorariaPratica: Number, // Carga horária prática
    cargaHorariaTeorica: Number // Carga horária teórica
  },
  prerequisites: [ObjectId], // Pré-requisitos (referências para subjects)
  competencies: [String], // Competências desenvolvidas
  bibliography: {
    basic: [String],
    complementary: [String]
  },
  status: String, // "active", "inactive", "revision"
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.2.5 Coleção `activities`

Representa a distribuição de aulas, elemento central do sistema que conecta professores, disciplinas e turmas.

```javascript
{
  _id: ObjectId,
  subject: ObjectId, // Referência para subjects
  studentGroup: ObjectId, // Referência para studentGroups
  teachers: [ObjectId], // Referências para users (role: teacher)
  room: ObjectId, // Referência para rooms (opcional)
  aulasPorSemana: Number, // Duration do FET
  divideTurma: Boolean, // Divide turma em 2 grupos
  semestre: Number, // Semestre de ocorrência
  distribution: ObjectId, // Referência para distributions
  activityType: String, // "theoretical", "practical", "laboratory"
  requirements: {
    needsProjector: Boolean,
    needsComputers: Boolean,
    needsSpecialEquipment: [String]
  },
  scheduling: {
    preferredDays: [String], // Dias preferenciais
    preferredTimes: [String], // Horários preferenciais
    consecutiveClasses: Boolean // Aulas consecutivas
  },
  status: String, // "planned", "approved", "scheduled"
  notes: String, // Observações
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.2.6 Coleção `distributions`

Agrupa todas as atividades de um período letivo específico, funcionando como um container organizacional.

```javascript
{
  _id: ObjectId,
  name: String, // "2025.2 - Segundo Semestre"
  course: ObjectId, // Referência para courses
  semester: String, // "2025.2"
  startDate: Date, // Data de início do período
  endDate: Date, // Data de fim do período
  status: String, // "planning", "active", "completed"
  coordinator: ObjectId, // Referência para users
  statistics: {
    totalActivities: Number,
    totalHours: Number,
    teachersInvolved: Number,
    roomsUsed: Number
  },
  approvals: [{
    user: ObjectId,
    date: Date,
    status: String, // "approved", "rejected"
    comments: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.2.7 Coleção `teacherRestrictions`

Gerencia as restrições de horário dos professores com fluxo de aprovação.

```javascript
{
  _id: ObjectId,
  teacher: ObjectId, // Referência para users
  distribution: ObjectId, // Referência para distributions
  status: String, // "draft", "submitted", "approved", "rejected"
  requestedAt: Date,
  approvedAt: Date,
  approvedBy: ObjectId, // Referência para users
  slots: [{
    day: String, // "Segunda-feira"
    hour: String, // "08:20-09:10"
    restrictionType: String, // "available", "limited", "blocked"
    reason: String // Justificativa para restrição
  }],
  observations: String, // Observações gerais
  history: [{
    action: String, // "created", "submitted", "approved", "rejected"
    user: ObjectId,
    date: Date,
    comments: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.2.8 Coleção `rooms`

Cadastro de salas com informações detalhadas sobre capacidade e recursos disponíveis.

```javascript
{
  _id: ObjectId,
  name: String, // "Sala 101"
  building: String, // "Bloco A"
  capacity: Number, // Capacidade máxima
  type: String, // "classroom", "laboratory", "auditorium"
  resources: {
    hasProjector: Boolean,
    hasComputers: Boolean,
    hasAirConditioning: Boolean,
    hasWhiteboard: Boolean,
    specialEquipment: [String]
  },
  location: {
    floor: Number,
    wing: String,
    accessibility: Boolean
  },
  availability: {
    periods: [String], // Períodos disponíveis
    restrictions: [String] // Restrições específicas
  },
  status: String, // "available", "maintenance", "reserved"
  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 Índices e Performance

Para garantir performance otimizada, serão criados índices estratégicos:

**Índices Compostos**:
- `{course: 1, semester: 1}` na coleção `distributions`
- `{teacher: 1, distribution: 1}` na coleção `teacherRestrictions`
- `{subject: 1, studentGroup: 1}` na coleção `activities`

**Índices de Texto**:
- Campos `name` nas coleções principais para busca textual
- Campo `email` na coleção `users` (único)

**Índices TTL**:
- Sessões temporárias com expiração automática

## 3. Design da Interface do Usuário (UX/UI)

### 3.1 Princípios de Design

O design da interface foi concebido com foco específico em usuários familiarizados com o Microsoft Excel, incorporando elementos visuais e padrões de interação que reduzem a curva de aprendizado e aumentam a produtividade.

**Familiaridade com Excel**: A interface utiliza elementos visuais similares ao Excel, incluindo grids editáveis, filtros avançados, formatação condicional e atalhos de teclado familiares.

**Hierarquia Visual Clara**: Implementação de uma hierarquia visual consistente que guia o usuário através dos fluxos de trabalho complexos de forma intuitiva.

**Feedback Imediato**: Validações em tempo real e feedback visual imediato para ações do usuário, reduzindo erros e aumentando a confiança.

**Responsividade**: Design totalmente responsivo que funciona perfeitamente em desktops, tablets e dispositivos móveis.

### 3.2 Paleta de Cores e Tipografia

**Paleta de Cores Principal**:
- Primária: #1976D2 (Azul profissional)
- Secundária: #388E3C (Verde para ações positivas)
- Alerta: #F57C00 (Laranja para avisos)
- Erro: #D32F2F (Vermelho para erros)
- Neutro: #424242 (Cinza para textos)
- Background: #FAFAFA (Cinza claro para fundos)

**Tipografia**:
- Fonte Principal: Inter (Google Fonts)
- Tamanhos: 12px (pequeno), 14px (corpo), 16px (subtítulos), 20px+ (títulos)
- Peso: 400 (regular), 500 (médio), 600 (semi-bold), 700 (bold)

### 3.3 Componentes de Interface

#### 3.3.1 Grid Editável Estilo Excel

Componente central que replica a experiência familiar do Excel:

```typescript
interface ExcelGridProps {
  data: any[];
  columns: GridColumn[];
  onCellEdit: (rowId: string, field: string, value: any) => void;
  onRowAdd: () => void;
  onRowDelete: (rowId: string) => void;
  validation?: ValidationRules;
  readOnly?: boolean;
}
```

**Funcionalidades**:
- Edição inline de células
- Seleção múltipla com Ctrl/Shift
- Copiar/colar entre células
- Filtros avançados por coluna
- Ordenação por múltiplas colunas
- Formatação condicional
- Exportação para Excel/CSV

#### 3.3.2 Formulários Inteligentes

Formulários com validação em tempo real e sugestões automáticas:

```typescript
interface SmartFormProps {
  schema: FormSchema;
  initialValues?: any;
  onSubmit: (values: any) => Promise<void>;
  onValidate?: (values: any) => ValidationResult;
  autoSave?: boolean;
}
```

**Características**:
- Validação em tempo real
- Auto-complete inteligente
- Sugestões baseadas em dados históricos
- Salvamento automático de rascunhos
- Indicadores visuais de progresso

#### 3.3.3 Dashboard Interativo

Painéis personalizáveis com métricas em tempo real:

```typescript
interface DashboardProps {
  widgets: Widget[];
  layout: LayoutConfig;
  onLayoutChange: (layout: LayoutConfig) => void;
  refreshInterval?: number;
}
```

**Widgets Disponíveis**:
- Gráficos de distribuição de carga horária
- Indicadores de ocupação de salas
- Status de aprovações pendentes
- Alertas de conflitos de horário
- Métricas de utilização do sistema

### 3.4 Fluxos de Trabalho por Perfil de Usuário

#### 3.4.1 Fluxo do Coordenador

**Dashboard Principal**:
O coordenador acessa um dashboard centralizado que apresenta uma visão geral dos cursos sob sua responsabilidade, com indicadores visuais de status e alertas para ações pendentes.

**Navegação Guiada**:
Menu lateral com fluxo claro e sequencial:
1. **Gestão de Cursos**: Cadastro e edição de informações dos cursos
2. **Gestão de Turmas**: Criação e configuração de turmas
3. **Gestão de Disciplinas**: Cadastro de disciplinas e ementas
4. **Distribuição de Aulas**: Tela principal para alocação de professores
5. **Aprovação de Restrições**: Gerenciamento de solicitações de professores
6. **Relatórios**: Visualização de métricas e exportações

**Tela de Distribuição de Aulas** (Funcionalidade Central):
Interface otimizada que substitui os campos de texto soltos do SGE por:
- Dropdowns inteligentes com filtros automáticos
- Cálculo automático de carga horária
- Validações em tempo real
- Visualização de conflitos
- Sugestões de otimização

#### 3.4.2 Fluxo do Professor

**Dashboard Pessoal**:
Interface simplificada focada nas necessidades específicas do professor:
- Visão geral das disciplinas atribuídas
- Status das restrições de horário
- Calendário pessoal de aulas
- Notificações importantes

**Gestão de Restrições de Horário**:
Interface intuitiva para definição de disponibilidade:
- Grade visual da semana
- Clique para alternar entre estados (Livre/Limitado/Bloqueado)
- Campo de observações contextuais
- Fluxo de aprovação transparente
- Histórico de alterações

#### 3.4.3 Fluxo do Administrador

**Visão Global do Sistema**:
Dashboard executivo com métricas consolidadas:
- Indicadores de performance do sistema
- Estatísticas de uso por perfil
- Alertas de sistema e segurança
- Relatórios gerenciais

**Funcionalidades Administrativas**:
- Gestão de usuários e permissões
- Configurações globais do sistema
- Backup e recuperação de dados
- Exportação para FET
- Auditoria e logs de sistema

## 4. Arquitetura de APIs RESTful

### 4.1 Estrutura das APIs

O backend implementa uma arquitetura RESTful bem estruturada, seguindo as melhores práticas de design de APIs e padrões de nomenclatura consistentes.

**Base URL**: `https://api.sistema-horarios.com/v1`

**Padrões de Nomenclatura**:
- Recursos no plural: `/courses`, `/users`, `/activities`
- Verbos HTTP apropriados: GET, POST, PUT, PATCH, DELETE
- Códigos de status HTTP padronizados
- Versionamento na URL para compatibilidade

### 4.2 Endpoints Principais

#### 4.2.1 Autenticação e Autorização

```
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/profile
PUT  /auth/profile
POST /auth/forgot-password
POST /auth/reset-password
```

#### 4.2.2 Gestão de Usuários

```
GET    /users              # Listar usuários (com filtros)
POST   /users              # Criar usuário
GET    /users/:id          # Obter usuário específico
PUT    /users/:id          # Atualizar usuário
DELETE /users/:id          # Remover usuário
PATCH  /users/:id/status   # Ativar/desativar usuário
```

#### 4.2.3 Gestão de Cursos

```
GET    /courses            # Listar cursos
POST   /courses            # Criar curso
GET    /courses/:id        # Obter curso específico
PUT    /courses/:id        # Atualizar curso
DELETE /courses/:id        # Remover curso
GET    /courses/:id/statistics # Estatísticas do curso
```

#### 4.2.4 Gestão de Atividades

```
GET    /activities                    # Listar atividades
POST   /activities                    # Criar atividade
GET    /activities/:id                # Obter atividade específica
PUT    /activities/:id                # Atualizar atividade
DELETE /activities/:id                # Remover atividade
POST   /activities/bulk               # Criação em lote
GET    /activities/conflicts          # Detectar conflitos
```

#### 4.2.5 Exportação FET

```
POST   /export/fet/validate          # Validar dados para exportação
POST   /export/fet/xml               # Gerar arquivo XML FET
POST   /export/fet/csv               # Gerar arquivos CSV FET
GET    /export/fet/status/:jobId     # Status da exportação
```

### 4.3 Middleware e Validações

**Middleware de Autenticação**:
Verificação de JWT em todas as rotas protegidas com renovação automática de tokens próximos ao vencimento.

**Middleware de Autorização**:
Sistema baseado em papéis (RBAC) que verifica permissões específicas para cada endpoint.

**Middleware de Validação**:
Validação automática de dados de entrada usando esquemas Joi, com mensagens de erro padronizadas e internacionalizadas.

**Middleware de Rate Limiting**:
Proteção contra abuso com limites diferenciados por tipo de usuário e endpoint.

### 4.4 Tratamento de Erros

Sistema padronizado de tratamento de erros com códigos específicos e mensagens descritivas:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
}
```

**Códigos de Erro Customizados**:
- `VALIDATION_ERROR`: Erro de validação de dados
- `BUSINESS_RULE_VIOLATION`: Violação de regra de negócio
- `RESOURCE_NOT_FOUND`: Recurso não encontrado
- `PERMISSION_DENIED`: Acesso negado
- `CONFLICT_DETECTED`: Conflito de dados detectado

## 5. Lógica de Negócio e Validações

### 5.1 Validações Inteligentes

O sistema implementa um conjunto abrangente de validações que vão além da simples verificação de tipos de dados, incorporando regras de negócio complexas específicas do domínio acadêmico.

#### 5.1.1 Validações de Carga Horária

**Validação de Consistência**:
O sistema verifica automaticamente se a distribuição de aulas por semana é compatível com a carga horária total da disciplina, considerando o número de semanas do período letivo.

```typescript
function validateWorkload(activity: Activity, subject: Subject): ValidationResult {
  const totalWeeks = calculateSemesterWeeks(activity.distribution);
  const totalClassesPerSemester = activity.aulasPorSemana * totalWeeks;
  const requiredClasses = subject.ementa.cargaHorariaTotal;
  
  if (totalClassesPerSemester > requiredClasses) {
    return {
      valid: false,
      message: `Carga horária excede o limite. Máximo permitido: ${requiredClasses} aulas.`
    };
  }
  
  return { valid: true };
}
```

#### 5.1.2 Validações de Conflitos

**Detecção de Conflitos de Professor**:
Verificação automática de sobreposição de horários para professores, considerando deslocamento entre salas e tempo de preparação.

**Detecção de Conflitos de Sala**:
Validação de disponibilidade de salas, considerando capacidade, recursos necessários e tempo de limpeza entre aulas.

**Detecção de Conflitos de Turma**:
Verificação de sobreposição de horários para turmas, incluindo validação de carga horária máxima diária.

### 5.2 Lógica de Divisão de Turma

Implementação da funcionalidade complexa de divisão de turmas identificada na análise do SGE:

```typescript
function processDividedClass(activity: Activity): Activity[] {
  if (!activity.divideTurma) {
    return [activity];
  }
  
  const baseActivity = { ...activity };
  const subgroupA = {
    ...baseActivity,
    _id: new ObjectId(),
    studentGroup: createSubgroup(activity.studentGroup, 'A'),
    notes: `${baseActivity.notes} - Subgrupo A`
  };
  
  const subgroupB = {
    ...baseActivity,
    _id: new ObjectId(),
    studentGroup: createSubgroup(activity.studentGroup, 'B'),
    notes: `${baseActivity.notes} - Subgrupo B`
  };
  
  return [subgroupA, subgroupB];
}
```

### 5.3 Sistema de Aprovações

Fluxo de aprovação estruturado para restrições de professores:

**Estados do Fluxo**:
1. **Rascunho**: Professor está editando as restrições
2. **Enviado**: Restrições enviadas para aprovação
3. **Em Análise**: Coordenador está analisando
4. **Aprovado**: Restrições aprovadas e ativas
5. **Rejeitado**: Restrições rejeitadas com comentários

**Notificações Automáticas**:
Sistema de notificações em tempo real para mudanças de status, com integração de email e notificações push.

## 6. Integração com FET (Free Timetabling Software)

### 6.1 Estratégia de Exportação

A integração com o FET é um dos componentes mais críticos do sistema, exigindo conformidade rigorosa com as especificações analisadas nos documentos fornecidos.

#### 6.1.1 Exportação XML (.fet)

Geração de arquivos XML completos seguindo a estrutura hierárquica do FET:

```typescript
class FETXMLExporter {
  async exportDistribution(distributionId: string): Promise<string> {
    const distribution = await this.getDistributionData(distributionId);
    
    const xmlBuilder = new XMLBuilder({
      institution: distribution.course.name,
      days: this.buildDaysList(),
      hours: this.buildHoursList(),
      teachers: this.buildTeachersList(distribution),
      subjects: this.buildSubjectsList(distribution),
      students: this.buildStudentsList(distribution),
      rooms: this.buildRoomsList(),
      activities: this.buildActivitiesList(distribution),
      constraints: this.buildConstraintsList(distribution)
    });
    
    return xmlBuilder.generate();
  }
}
```

#### 6.1.2 Exportação CSV

Geração de múltiplos arquivos CSV seguindo as especificações detalhadas:

```typescript
class FETCSVExporter {
  async exportDistribution(distributionId: string): Promise<CSVExportResult> {
    const files = {
      students: await this.generateStudentsCSV(distributionId),
      teachers: await this.generateTeachersCSV(distributionId),
      subjects: await this.generateSubjectsCSV(distributionId),
      activityTags: await this.generateActivityTagsCSV(distributionId),
      rooms: await this.generateRoomsCSV(distributionId),
      activities: await this.generateActivitiesCSV(distributionId)
    };
    
    return {
      files,
      validation: await this.validateExport(files)
    };
  }
}
```

### 6.2 Validações Específicas do FET

Implementação de validações rigorosas baseadas nas regras identificadas:

**Validação de Caracteres Especiais**:
Verificação e sanitização de nomes para evitar caracteres problemáticos como `+` e `,`.

**Validação de Referências Cruzadas**:
Garantia de que todas as referências entre entidades são válidas e existentes.

**Validação de Estrutura Hierárquica**:
Verificação da estrutura correta de anos, grupos e subgrupos de alunos.

### 6.3 Mapeamento de Restrições

Conversão das restrições do sistema para o formato FET:

```typescript
function mapTeacherRestrictions(restrictions: TeacherRestriction[]): FETConstraint[] {
  return restrictions
    .filter(r => r.status === 'approved')
    .flatMap(restriction => 
      restriction.slots
        .filter(slot => slot.restrictionType === 'blocked')
        .map(slot => ({
          type: 'ConstraintTeacherNotAvailable',
          teacher: restriction.teacher.name,
          day: slot.day,
          hour: slot.hour,
          weight: 100
        }))
    );
}
```

## 7. Segurança e Performance

### 7.1 Segurança

**Autenticação Multi-Fator**:
Implementação opcional de 2FA para usuários administrativos.

**Criptografia de Dados**:
- Senhas: bcrypt com salt rounds configurável
- Dados sensíveis: AES-256 para campos específicos
- Comunicação: HTTPS obrigatório com certificados SSL/TLS

**Auditoria e Logs**:
Sistema completo de auditoria que registra todas as ações críticas:
- Login/logout de usuários
- Modificações de dados importantes
- Exportações para FET
- Mudanças de permissões

**Proteção contra Ataques**:
- Rate limiting por IP e usuário
- Validação rigorosa de entrada (SQL injection, XSS)
- CORS configurado adequadamente
- Headers de segurança (HSTS, CSP, etc.)

### 7.2 Performance e Escalabilidade

**Otimizações de Banco de Dados**:
- Índices estratégicos para consultas frequentes
- Agregações otimizadas para relatórios
- Connection pooling configurado
- Query optimization com explain plans

**Cache Estratégico**:
- Redis para sessões de usuário
- Cache de consultas frequentes
- Cache de resultados de validação
- CDN para assets estáticos

**Monitoramento**:
- Métricas de performance em tempo real
- Alertas automáticos para problemas
- Logs estruturados para análise
- Health checks automatizados

## 8. Estratégia de Deploy e DevOps

### 8.1 Ambiente de Desenvolvimento

**Containerização**:
Docker containers para desenvolvimento local consistente:
- Frontend: Node.js 18 + React
- Backend: Node.js 18 + Express
- Banco: MongoDB local ou Atlas
- Cache: Redis local

**CI/CD Pipeline**:
GitHub Actions para automação:
- Testes automatizados (unit, integration, e2e)
- Build e deploy automático
- Verificação de qualidade de código
- Análise de segurança

### 8.2 Ambiente de Produção

**Infraestrutura na Nuvem**:
- Frontend: Vercel ou Netlify
- Backend: Railway, Heroku ou AWS
- Banco: MongoDB Atlas
- Cache: Redis Cloud
- CDN: Cloudflare

**Monitoramento e Observabilidade**:
- Logs centralizados (Winston + ELK Stack)
- Métricas de aplicação (Prometheus + Grafana)
- Alertas automáticos (PagerDuty)
- Uptime monitoring (Pingdom)

## 9. Cronograma de Desenvolvimento

### Fase 1: Fundação (Semanas 1-2)
- Setup do ambiente de desenvolvimento
- Configuração do banco de dados
- Implementação da autenticação básica
- Estrutura base do frontend e backend

### Fase 2: Core Features (Semanas 3-5)
- Implementação das entidades principais
- APIs RESTful básicas
- Interface de usuário fundamental
- Sistema de validações

### Fase 3: Funcionalidades Avançadas (Semanas 6-8)
- Lógica de distribuição de aulas
- Sistema de restrições de professores
- Validações inteligentes
- Interface estilo Excel

### Fase 4: Integração FET (Semanas 9-10)
- Exportação XML e CSV
- Validações específicas do FET
- Testes de integração
- Otimizações de performance

### Fase 5: Finalização (Semanas 11-12)
- Testes completos do sistema
- Documentação final
- Deploy em produção
- Treinamento de usuários

## 10. Conclusão

O sistema proposto representa uma evolução significativa em relação ao SGE atual, mantendo toda a funcionalidade essencial enquanto oferece uma experiência de usuário drasticamente aprimorada. A arquitetura moderna e escalável garante que o sistema possa crescer com as necessidades da instituição, enquanto a integração perfeita com o FET assegura continuidade operacional.

A ênfase em validações inteligentes, interface familiar aos usuários do Excel e fluxos de trabalho otimizados resultará em maior produtividade, menos erros e maior satisfação dos usuários. O sistema não apenas substitui o SGE existente, mas estabelece uma nova base tecnológica para futuras expansões e melhorias.

A implementação seguirá as melhores práticas de desenvolvimento de software, garantindo código maintível, testável e documentado. O cronograma proposto é realista e permite entregas incrementais, reduzindo riscos e permitindo feedback contínuo dos usuários.

## Referências

[1] Documentação do MongoDB - Modelagem de Dados: https://docs.mongodb.com/manual/core/data-modeling-introduction/
[2] React Documentation - Best Practices: https://reactjs.org/docs/thinking-in-react.html
[3] Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
[4] Material-UI Design System: https://mui.com/design-kits/
[5] FET Official Documentation: https://www.timetabling.de/manual/FET-manual.en.html
[6] Express.js Security Best Practices: https://expressjs.com/en/advanced/best-practice-security.html
[7] MongoDB Atlas Security: https://docs.atlas.mongodb.com/security/
[8] JWT Best Practices: https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/

