CREATE TABLE normalized_names (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  ean VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(200),
  brand VARCHAR(200),
  supermarket VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  normalized_name_id INT REFERENCES normalized_names(id),
  image_url VARCHAR(500),
  source_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ean, supermarket)
);

CREATE TABLE product_suggestions (
  id SERIAL PRIMARY KEY,
  ean VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  supermarket VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Primero los nombres normalizados
INSERT INTO normalized_names (name) VALUES
('pechuga de pollo'),
('leche entera'),
('leche semidesnatada'),
('agua mineral'),
('detergente líquido'),
('yogur natural');

-- Luego los productos (de tres supermercados distintos)
INSERT INTO products (ean, name, category, brand, supermarket, price, normalized_name_id, source_id) VALUES
('8402001046964', 'Pechuga de pollo Hacendado 500g',     'Congelados',  'Hacendado',  'mercadona', 3.50, 1, '21537'),
('8410494002607', 'Pechuga de pollo Dia Corral 450g',    'Congelados',  'Dia Corral', 'dia',       3.20, 1, 'dia-00892'),
('8001234567890', 'Leche entera Hacendado 1L',           'Lácteos',     'Hacendado',  'mercadona', 0.89, 2, '10234'),
('8412345678901', 'Leche entera Dia 1L',                 'Lácteos',     'Dia',        'dia',       0.85, 2, 'dia-00341'),
('8430000123456', 'Leche entera Lidl 1L',                'Lácteos',     'Milbona',    'lidl',      0.79, 2, 'lidl-05512'),
('8001111111111', 'Leche semidesnatada Hacendado 1L',    'Lácteos',     'Hacendado',  'mercadona', 0.85, 3, '10235'),
('8402002222222', 'Agua mineral Hacendado 1.5L',         'Bebidas',     'Hacendado',  'mercadona', 0.35, 4, '30891'),
('8412222222222', 'Agua mineral Dia 1.5L',               'Bebidas',     'Dia',        'dia',       0.33, 4, 'dia-00120'),
('8403333333333', 'Detergente líquido Bosque Verde 33d', 'Limpieza',    'Bosque Verde','mercadona',3.99, 5, '50234'),
('8414444444444', 'Yogur natural Hacendado x4',          'Lácteos',     'Hacendado',  'mercadona', 0.89, 6, '11002'),
('8415555555555', 'Yogur natural Dia x4',                'Lácteos',     'Dia',        'dia',       0.85, 6, 'dia-00567');