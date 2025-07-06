const Joi = require('joi');

// Middleware para validar dados de entrada
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors
      });
    }
    
    next();
  };
};

// Esquemas de validação para usuários
const userSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('coordinator', 'teacher', 'administrator').default('teacher'),
    profile: Joi.object({
      phone: Joi.string().trim().allow(''),
      department: Joi.string().trim().allow(''),
      specializations: Joi.array().items(Joi.string().trim()),
      preferences: Joi.object({
        language: Joi.string().default('pt-BR'),
        timezone: Joi.string().default('America/Sao_Paulo'),
        notifications: Joi.object({
          email: Joi.boolean().default(true),
          system: Joi.boolean().default(true)
        })
      })
    })
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    email: Joi.string().email(),
    role: Joi.string().valid('coordinator', 'teacher', 'administrator'),
    isActive: Joi.boolean(),
    profile: Joi.object({
      phone: Joi.string().trim().allow(''),
      department: Joi.string().trim().allow(''),
      specializations: Joi.array().items(Joi.string().trim()),
      preferences: Joi.object({
        language: Joi.string(),
        timezone: Joi.string(),
        notifications: Joi.object({
          email: Joi.boolean(),
          system: Joi.boolean()
        })
      })
    })
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })
};

// Esquemas de validação para cursos
const courseSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(200).required(),
    divulgationName: Joi.string().trim().max(200).allow(''),
    sigla: Joi.string().trim().min(2).max(10).required(),
    codigoSuap: Joi.string().trim().max(20).allow(''),
    eixo: Joi.string().valid(
      'Gestão e Negócios',
      'Informação e Comunicação',
      'Controle e Processos Industriais',
      'Infraestrutura',
      'Produção Alimentícia',
      'Recursos Naturais',
      'Produção Cultural e Design',
      'Ambiente e Saúde',
      'Segurança',
      'Hospitalidade e Lazer',
      'Produção Industrial'
    ).required(),
    modalidadeOferta: Joi.string().valid('Presencial', 'EAD', 'Híbrido').required(),
    formaOferta: Joi.string().valid('Superior', 'Técnico', 'Pós-graduação', 'Extensão').required(),
    valorHoraAula: Joi.number().min(0).required(),
    tags: Joi.array().items(Joi.string().trim()),
    coordinator: Joi.string().hex().length(24).required(),
    description: Joi.string().trim().max(1000).allow(''),
    duration: Joi.object({
      semesters: Joi.number().min(1).required(),
      totalHours: Joi.number().min(1).required()
    }).required()
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(2).max(200),
    divulgationName: Joi.string().trim().max(200).allow(''),
    sigla: Joi.string().trim().min(2).max(10),
    codigoSuap: Joi.string().trim().max(20).allow(''),
    eixo: Joi.string().valid(
      'Gestão e Negócios',
      'Informação e Comunicação',
      'Controle e Processos Industriais',
      'Infraestrutura',
      'Produção Alimentícia',
      'Recursos Naturais',
      'Produção Cultural e Design',
      'Ambiente e Saúde',
      'Segurança',
      'Hospitalidade e Lazer',
      'Produção Industrial'
    ),
    modalidadeOferta: Joi.string().valid('Presencial', 'EAD', 'Híbrido'),
    formaOferta: Joi.string().valid('Superior', 'Técnico', 'Pós-graduação', 'Extensão'),
    valorHoraAula: Joi.number().min(0),
    tags: Joi.array().items(Joi.string().trim()),
    coordinator: Joi.string().hex().length(24),
    description: Joi.string().trim().max(1000).allow(''),
    duration: Joi.object({
      semesters: Joi.number().min(1),
      totalHours: Joi.number().min(1)
    }),
    status: Joi.string().valid('active', 'inactive', 'planning')
  })
};

// Esquemas de validação para turmas
const studentGroupSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(1).max(50).required(),
    codigoSuap: Joi.string().trim().max(20).allow(''),
    course: Joi.string().hex().length(24).required(),
    numberOfStudents: Joi.number().min(1).required(),
    conclusionDate: Joi.date().required(),
    periodosOcorrencia: Joi.array().items(
      Joi.string().valid('Matutino', 'Vespertino', 'Noturno', 'Integral')
    ),
    salasPreferenciais: Joi.array().items(Joi.string().hex().length(24)),
    semester: Joi.number().min(1).required(),
    year: Joi.number().min(2000).required(),
    characteristics: Joi.object({
      hasSpecialNeeds: Joi.boolean().default(false),
      requiresLab: Joi.boolean().default(false),
      maxConsecutiveClasses: Joi.number().min(1).default(4)
    })
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(1).max(50),
    codigoSuap: Joi.string().trim().max(20).allow(''),
    numberOfStudents: Joi.number().min(1),
    conclusionDate: Joi.date(),
    periodosOcorrencia: Joi.array().items(
      Joi.string().valid('Matutino', 'Vespertino', 'Noturno', 'Integral')
    ),
    salasPreferenciais: Joi.array().items(Joi.string().hex().length(24)),
    semester: Joi.number().min(1),
    year: Joi.number().min(2000),
    characteristics: Joi.object({
      hasSpecialNeeds: Joi.boolean(),
      requiresLab: Joi.boolean(),
      maxConsecutiveClasses: Joi.number().min(1)
    }),
    status: Joi.string().valid('active', 'concluded', 'suspended')
  })
};

// Esquemas de validação para disciplinas
const subjectSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(200).required(),
    course: Joi.string().hex().length(24).required(),
    modulo: Joi.string().trim().required(),
    tags: Joi.array().items(Joi.string().trim()),
    areasConhecimento: Joi.array().items(Joi.string().trim()),
    salasPreferenciais: Joi.array().items(Joi.string().hex().length(24)),
    ementa: Joi.object({
      versaoPPC: Joi.string().trim().required(),
      dataVigencia: Joi.date().required(),
      cargaHorariaTotal: Joi.number().min(1).required(),
      cargaHorariaEAD: Joi.number().min(0).default(0),
      cargaHorariaPratica: Joi.number().min(0).default(0),
      cargaHorariaTeorica: Joi.number().min(0).default(0)
    }).required(),
    prerequisites: Joi.array().items(Joi.string().hex().length(24)),
    competencies: Joi.array().items(Joi.string().trim()),
    bibliography: Joi.object({
      basic: Joi.array().items(Joi.string().trim()),
      complementary: Joi.array().items(Joi.string().trim())
    })
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(2).max(200),
    modulo: Joi.string().trim(),
    tags: Joi.array().items(Joi.string().trim()),
    areasConhecimento: Joi.array().items(Joi.string().trim()),
    salasPreferenciais: Joi.array().items(Joi.string().hex().length(24)),
    ementa: Joi.object({
      versaoPPC: Joi.string().trim(),
      dataVigencia: Joi.date(),
      cargaHorariaTotal: Joi.number().min(1),
      cargaHorariaEAD: Joi.number().min(0),
      cargaHorariaPratica: Joi.number().min(0),
      cargaHorariaTeorica: Joi.number().min(0)
    }),
    prerequisites: Joi.array().items(Joi.string().hex().length(24)),
    competencies: Joi.array().items(Joi.string().trim()),
    bibliography: Joi.object({
      basic: Joi.array().items(Joi.string().trim()),
      complementary: Joi.array().items(Joi.string().trim())
    }),
    status: Joi.string().valid('active', 'inactive', 'revision')
  })
};

// Esquemas de validação para atividades
const activitySchemas = {
  create: Joi.object({
    subject: Joi.string().hex().length(24).required(),
    studentGroup: Joi.string().hex().length(24).required(),
    teachers: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    room: Joi.string().hex().length(24).allow(null),
    aulasPorSemana: Joi.number().min(1).required(),
    divideTurma: Joi.boolean().default(false),
    semestre: Joi.number().min(1).required(),
    distribution: Joi.string().hex().length(24).required(),
    activityType: Joi.string().valid('theoretical', 'practical', 'laboratory', 'seminar', 'project').default('theoretical'),
    requirements: Joi.object({
      needsProjector: Joi.boolean().default(false),
      needsComputers: Joi.boolean().default(false),
      needsAirConditioning: Joi.boolean().default(false),
      needsSpecialEquipment: Joi.array().items(Joi.string().trim()),
      minCapacity: Joi.number().min(1)
    }),
    scheduling: Joi.object({
      preferredDays: Joi.array().items(
        Joi.string().valid('Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado')
      ),
      preferredTimes: Joi.array().items(Joi.string().trim()),
      consecutiveClasses: Joi.boolean().default(false),
      avoidDays: Joi.array().items(
        Joi.string().valid('Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado')
      )
    }),
    notes: Joi.string().trim().max(500).allow('')
  }),
  
  update: Joi.object({
    teachers: Joi.array().items(Joi.string().hex().length(24)).min(1),
    room: Joi.string().hex().length(24).allow(null),
    aulasPorSemana: Joi.number().min(1),
    divideTurma: Joi.boolean(),
    activityType: Joi.string().valid('theoretical', 'practical', 'laboratory', 'seminar', 'project'),
    requirements: Joi.object({
      needsProjector: Joi.boolean(),
      needsComputers: Joi.boolean(),
      needsAirConditioning: Joi.boolean(),
      needsSpecialEquipment: Joi.array().items(Joi.string().trim()),
      minCapacity: Joi.number().min(1)
    }),
    scheduling: Joi.object({
      preferredDays: Joi.array().items(
        Joi.string().valid('Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado')
      ),
      preferredTimes: Joi.array().items(Joi.string().trim()),
      consecutiveClasses: Joi.boolean(),
      avoidDays: Joi.array().items(
        Joi.string().valid('Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado')
      )
    }),
    notes: Joi.string().trim().max(500).allow(''),
    status: Joi.string().valid('planned', 'approved', 'scheduled', 'cancelled')
  })
};

// Esquemas de validação para Salas (Rooms) - [CÓDIGO PARA ADICIONAR]
const roomSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    capacity: Joi.number().min(1).required(),
    building: Joi.string().trim().max(100).allow(''),
    type: Joi.string().valid('Sala de Aula', 'Laboratório', 'Auditório', 'Gabinete').required(),
    features: Joi.array().items(Joi.string().trim()),
    notes: Joi.string().trim().max(500).allow('')
  }),

  update: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    capacity: Joi.number().min(1),
    building: Joi.string().trim().max(100).allow(''),
    type: Joi.string().valid('Sala de Aula', 'Laboratório', 'Auditório', 'Gabinete'),
    features: Joi.array().items(Joi.string().trim()),
    notes: Joi.string().trim().max(500).allow(''),
    status: Joi.string().valid('available', 'in_use', 'maintenance')
  })
};


module.exports = {
  validate,
  userSchemas,
  courseSchemas,
  studentGroupSchemas,
  subjectSchemas,
  activitySchemas,
  roomSchemas // << ADICIONE ESTA LINHA

};

