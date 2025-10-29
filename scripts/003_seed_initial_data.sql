-- Insert a default admin user (password: admin123)
-- Note: In production, use a proper password hashing mechanism
INSERT INTO users (id, name, email, role, email_verified)
VALUES (
  gen_random_uuid()::text,
  'Administrador',
  'admin@portalunk.com',
  'admin',
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample DJs
INSERT INTO djs (name, artist_name, email, phone, pix_key)
VALUES
  ('João Silva', 'DJ João', 'joao@example.com', '(11) 98765-4321', 'joao@example.com'),
  ('Maria Santos', 'DJ Maria', 'maria@example.com', '(11) 98765-4322', 'maria@example.com'),
  ('Pedro Costa', 'DJ Pedro', 'pedro@example.com', '(11) 98765-4323', 'pedro@example.com')
ON CONFLICT DO NOTHING;

-- Insert sample Producers
INSERT INTO producers (name, company_name, email, phone)
VALUES
  ('Eventos XYZ', 'XYZ Produções Ltda', 'contato@eventosxyz.com', '(11) 3456-7890'),
  ('Festas ABC', 'ABC Eventos', 'contato@festasabc.com', '(11) 3456-7891')
ON CONFLICT DO NOTHING;
