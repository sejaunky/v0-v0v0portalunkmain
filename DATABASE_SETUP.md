# Configuração do Banco de Dados Neon

## Passos para Configurar

### 1. Variáveis de Ambiente

O arquivo `.env.local` já foi criado com a string de conexão do Neon:

\`\`\`
DATABASE_URL=postgresql://neondb_owner:npg_FxB0uP7fbkTi@ep-misty-water-ac8sjzgd-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
\`\`\`

### 2. Executar Scripts SQL

Execute os scripts SQL na seguinte ordem no painel do Neon ou usando a interface do v0:

1. **001_create_auth_tables.sql** - Cria tabelas de autenticação
2. **002_create_core_tables.sql** - Cria tabelas principais (DJs, Produtores, Eventos, etc)
3. **003_seed_initial_data.sql** - Insere dados iniciais de exemplo

### 3. Testar Conexão

Após executar os scripts, você pode testar a conexão acessando:

\`\`\`
http://localhost:3000/api/db-test
\`\`\`

Isso retornará informações sobre a conexão e as tabelas criadas.

## Estrutura do Banco de Dados

### Tabelas de Autenticação
- `users` - Usuários do sistema
- `accounts` - Contas de autenticação
- `sessions` - Sessões ativas
- `verification_tokens` - Tokens de verificação
- `user_profiles` - Perfis de usuário

### Tabelas Principais
- `djs` - Cadastro de DJs
- `producers` - Cadastro de Produtores
- `events` - Eventos/Shows
- `payments` - Pagamentos
- `contracts` - Contratos
- `notes` - Anotações

## Credenciais Padrão

**Admin:**
- Email: admin@portalunk.com
- Senha: admin123

**Importante:** Altere a senha padrão em produção!

## Próximos Passos

1. Execute os scripts SQL no Neon
2. Teste a conexão via `/api/db-test`
3. Faça login com as credenciais padrão
4. Comece a usar o sistema!
