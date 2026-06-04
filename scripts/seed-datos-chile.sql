-- ============================================================
-- Seed de datos de prueba para RuteAI — Chile (Santiago)
-- Pega este script en Supabase → SQL Editor y ejecútalo.
-- Detecta automáticamente la primera empresa en la base de datos.
-- ============================================================

DO $$
DECLARE
  v_empresa_id TEXT;
BEGIN
  SELECT id INTO v_empresa_id FROM "Empresa" LIMIT 1;

  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'No hay empresas registradas. Crea una cuenta primero.';
  END IF;

  INSERT INTO "Pedido" (id, "nombreCliente", "clienteTelefono", direccion, lat, lng, producto, estado, "scoreRiesgo", "empresaId", "repartidorId", "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Valentina Morales González', '+56912345678', 'Av. Providencia 1234, Providencia, Santiago', -33.4289, -70.6093, 'Notebook HP Pavilion 15"', 'pendiente',   0.22, v_empresa_id, NULL, NOW() - INTERVAL '2 hours',  NOW()),
    (gen_random_uuid(), 'Carlos Fuentes Pizarro',    '+56923456789', 'Av. Apoquindo 4501, Las Condes, Santiago',   -33.4181, -70.5977, 'Smart TV Samsung 55"',        'en_ruta',     0.45, v_empresa_id, NULL, NOW() - INTERVAL '5 hours',  NOW()),
    (gen_random_uuid(), 'Sofía Rodríguez Vega',      '+56934567890', 'Av. Vitacura 2939, Vitacura, Santiago',      -33.3986, -70.5974, 'iPhone 15 Pro 256GB',         'pendiente',   0.15, v_empresa_id, NULL, NOW() - INTERVAL '1 hour',   NOW()),
    (gen_random_uuid(), 'Andrés Gutiérrez Soto',     '+56945678901', 'Av. Irarrázaval 1234, Ñuñoa, Santiago',     -33.4564, -70.6126, 'Zapatillas Nike Air Max 97',  'entregado',   0.08, v_empresa_id, NULL, NOW() - INTERVAL '1 day',    NOW()),
    (gen_random_uuid(), 'Camila López Reyes',        '+56956789012', 'Gran Avenida 6543, San Miguel, Santiago',   -33.5031, -70.6527, 'Aspiradora Dyson V8',         'pendiente',   0.38, v_empresa_id, NULL, NOW() - INTERVAL '3 hours',  NOW()),
    (gen_random_uuid(), 'Diego Martínez Cruz',       '+56967890123', 'Av. Pedro de Valdivia 1500, Providencia',   -33.4357, -70.6072, 'PlayStation 5 Digital',       'en_ruta',     0.62, v_empresa_id, NULL, NOW() - INTERVAL '4 hours',  NOW()),
    (gen_random_uuid(), 'Fernanda Soto Muñoz',       '+56978901234', 'Av. Las Condes 12250, Las Condes',          -33.4075, -70.5681, 'Monitor LG 27" 4K',           'pendiente',   0.18, v_empresa_id, NULL, NOW() - INTERVAL '30 mins',  NOW()),
    (gen_random_uuid(), 'Pablo Araya González',      '+56989012345', 'Calle Cumming 350, Santiago Centro',        -33.4524, -70.6706, 'Microondas Mabe 0.9 pies',    'fallido',     0.75, v_empresa_id, NULL, NOW() - INTERVAL '2 days',   NOW()),
    (gen_random_uuid(), 'Javiera Castro Flores',     '+56990123456', 'Av. Tobalaba 7500, Peñalolén, Santiago',    -33.4891, -70.5521, 'Cafetera Nespresso Essenza',  'pendiente',   0.25, v_empresa_id, NULL, NOW() - INTERVAL '6 hours',  NOW()),
    (gen_random_uuid(), 'Nicolás Muñoz Herrera',     '+56911234567', 'Av. Grecia 3100, Ñuñoa, Santiago',          -33.4617, -70.5943, 'Tablet Samsung Galaxy A8',    'entregado',   0.12, v_empresa_id, NULL, NOW() - INTERVAL '1 day',    NOW()),
    (gen_random_uuid(), 'Catalina Pérez Torres',     '+56922345678', 'Av. Departamental 2000, San Joaquín',       -33.5089, -70.6406, 'Audífonos Sony WH-1000XM5',   'pendiente',   0.31, v_empresa_id, NULL, NOW() - INTERVAL '2 hours',  NOW()),
    (gen_random_uuid(), 'Felipe Rojas Vidal',        '+56933456789', 'Av. Larraín 5500, La Reina, Santiago',      -33.4526, -70.5757, 'Silla Gamer RGB Pro',         'en_ruta',     0.48, v_empresa_id, NULL, NOW() - INTERVAL '7 hours',  NOW()),
    (gen_random_uuid(), 'Constanza Silva Ponce',     '+56944567890', 'Av. Quilín 4050, Macul, Santiago',          -33.5014, -70.5862, 'Kit Herramientas Stanley 150 pzas', 'pendiente', 0.19, v_empresa_id, NULL, NOW() - INTERVAL '1 hour', NOW()),
    (gen_random_uuid(), 'Matías Torres Díaz',        '+56955678901', 'Av. Condell 234, Providencia, Santiago',    -33.4419, -70.6242, 'iPad Air 5ta generación',     'entregado',   0.07, v_empresa_id, NULL, NOW() - INTERVAL '3 days',   NOW()),
    (gen_random_uuid(), 'Rocío Vega Contreras',      '+56966789012', 'Av. Manuel Montt 1050, Providencia',        -33.4435, -70.6200, 'Balón Adidas Champions League','fallido',     0.68, v_empresa_id, NULL, NOW() - INTERVAL '1 day',    NOW()),
    (gen_random_uuid(), 'Sebastián Herrera Bravo',   '+56977890123', 'Av. Colón 5530, Las Condes, Santiago',      -33.4259, -70.5951, 'Juego Ollas Imusa 5 piezas',  'pendiente',   0.27, v_empresa_id, NULL, NOW() - INTERVAL '4 hours',  NOW()),
    (gen_random_uuid(), 'Daniela Flores Meza',       '+56988901234', 'Av. El Bosque Norte 500, Las Condes',       -33.4146, -70.5974, 'Refrigerador Samsung No Frost','entregado',   0.11, v_empresa_id, NULL, NOW() - INTERVAL '2 days',   NOW()),
    (gen_random_uuid(), 'Ignacio Contreras Núñez',   '+56999012345', 'Calle Teatinos 950, Santiago Centro',       -33.4429, -70.6521, 'Bicicleta Trek FX3 Disc',     'en_ruta',     0.55, v_empresa_id, NULL, NOW() - INTERVAL '8 hours',  NOW()),
    (gen_random_uuid(), 'María José Bravo Silva',    '+56910123456', 'Av. Matta 680, Santiago Centro',            -33.4644, -70.6502, 'Batidora KitchenAid Artisan', 'pendiente',   0.33, v_empresa_id, NULL, NOW() - INTERVAL '1 hour',   NOW()),
    (gen_random_uuid(), 'Tomás González Arce',       '+56921234567', 'Av. Camino El Alba 11357, Las Condes',      -33.3983, -70.5528, 'Drone DJI Mini 3 Pro',        'pendiente',   0.41, v_empresa_id, NULL, NOW() - INTERVAL '30 mins',  NOW());

  RAISE NOTICE 'Se insertaron 20 pedidos de prueba para la empresa %', v_empresa_id;
END $$;
