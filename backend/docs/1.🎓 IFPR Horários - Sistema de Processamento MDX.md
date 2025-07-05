# 🎓 IFPR Horários - Sistema de Processamento MDX

## Guia Rápido de Instalação

### 📋 Pré-requisitos

- Node.js 18+ 
- Git
- MongoDB Atlas (conta gratuita)

### 🚀 Instalação Rápida

1. **Clone o repositório original:**
```bash
git clone https://github.com/sieassischateaubriand/ifpr-horarios.git
```

2. **Crie o projeto backend:**
```bash
mkdir ifpr-horarios-backend-nodejs
cd ifpr-horarios-backend-nodejs
npm init -y
npm install express cors mongodb dotenv fs-extra path
```

3. **Crie a estrutura de pastas:**
```bash
mkdir -p models routes services public
```

4. **Configure as variáveis de ambiente (.env):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ifpr_horarios?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

5. **Copie os arquivos do sistema:**
- Copie todos os arquivos desenvolvidos para as respectivas pastas
- `server.js` na raiz
- Arquivos de modelo em `models/`
- Rotas em `routes/`
- Serviços em `services/`
- Interface em `public/`

6. **Execute o sistema:**
```bash
node server.js
```

7. **Acesse a interface:**
```
http://localhost:5000
```

### 🔧 Configuração MongoDB Atlas

1. Acesse https://www.mongodb.com/atlas
2. Crie uma conta gratuita
3. Crie um cluster M0 (gratuito)
4. Configure usuário e senha
5. Adicione IP 0.0.0.0/0 ao whitelist
6. Copie a string de conexão para o .env

### ✅ Teste da Instalação

1. Acesse http://localhost:5000
2. Selecione uma versão de horários
3. Clique em "Iniciar Processamento"
4. Acompanhe o progresso na interface

### 📁 Estrutura Final

```
ifpr-horarios-backend-nodejs/
├── server.js
├── package.json
├── .env
├── models/
│   └── Professor.js
├── routes/
│   └── professor.js
├── services/
│   └── MDXProcessor.js
└── public/
    └── index.html
```

### 🆘 Problemas Comuns

**Erro de conexão MongoDB:**
- Verifique as credenciais no .env
- Confirme se o IP está no whitelist

**Erro "Cannot find module":**
- Execute `npm install` novamente
- Verifique se todas as dependências estão instaladas

**Erro de parsing MDX:**
- Verifique se o repositório ifpr-horarios está clonado
- Confirme o caminho para os arquivos MDX

### 📞 Suporte

Para dúvidas ou problemas, consulte a documentação completa em `documentacao_completa.md`.

---
**Desenvolvido por:** Manus AI  
**Data:** 4 de julho de 2025

