-- Adicionar colunas para armazenar URLs de imagens do Vercel Blob

-- Adicionar avatar_url para DJs
ALTER TABLE djs ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Adicionar avatar_url para Producers
ALTER TABLE producers ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Adicionar payment_proof_url para Payments (comprovantes de pagamento)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Adicionar colunas extras que podem ser úteis para DJs
ALTER TABLE djs ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2);
ALTER TABLE djs ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS soundcloud_url TEXT;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'ocupado'));
ALTER TABLE djs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS real_name TEXT;

-- Adicionar status para Producers
ALTER TABLE producers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Adicionar paid_at para Payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS djs_status_idx ON djs(status);
CREATE INDEX IF NOT EXISTS producers_status_idx ON producers(status);
