USE gamestore_db;

-- Convert the bundled demo catalogue from euros to dirhams once.
UPDATE games
SET price = ROUND(price * 10.5, 2),
    old_price = CASE WHEN old_price IS NULL THEN NULL ELSE ROUND(old_price * 10.5, 2) END
WHERE slug IN ('spider-man-2','elden-ring','ea-fc-24','cod-mw3','zelda-totk','gran-turismo-7','cyberpunk-2077','hogwarts-legacy')
  AND price < 100;


INSERT INTO categories (name, slug, description, icon)
VALUES ('Crédits de jeu', 'credits-de-jeu', 'Crédits et monnaies pour vos jeux préférés', NULL)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), icon=NULL;

INSERT INTO games (title, slug, description, short_description, price, old_price, stock, category_id, platform_id, image, publisher, release_date, rating, is_featured, is_new)
SELECT 'Grand Theft Auto VI', 'gta-6', 'Explorez Vice City et l’État de Leonida dans le nouvel épisode de la série Grand Theft Auto.', 'Le nouvel épisode Grand Theft Auto', 750.00, 850.00, 25, (SELECT id FROM categories WHERE slug='action'), (SELECT id FROM platforms WHERE slug='ps5'), 'https://cdn.alza.cz/Foto/ImgGalery/Image/gta-6-jason-and-lucia.jpg', 'Rockstar Games', '2026-11-19', 'PEGI 18', TRUE, TRUE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), short_description=VALUES(short_description), price=VALUES(price), old_price=VALUES(old_price), image=VALUES(image), is_featured=TRUE, is_new=TRUE;

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, release_date, rating, is_featured, is_new)
SELECT 'Grand Theft Auto V', 'gta-5', 'Parcourez Los Santos et suivez les histoires de Michael, Franklin et Trevor.', 'L’aventure criminelle à Los Santos', 350.00, 30, (SELECT id FROM categories WHERE slug='action'), (SELECT id FROM platforms WHERE slug='ps5'), 'https://upload.wikimedia.org/wikipedia/vi/f/f8/Grand_Theft_Auto_V_DVD_cover.jpg', 'Rockstar Games', '2013-09-17', 'PEGI 18', TRUE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image);

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, rating, is_featured, is_new)
SELECT 'EA SPORTS FC 27', 'fc-27', 'Vivez le football avec les clubs et les joueurs de la saison dans EA SPORTS FC 27.', 'La nouvelle saison de football', 650.00, 30, (SELECT id FROM categories WHERE slug='sport'), (SELECT id FROM platforms WHERE slug='ps5'), 'https://img.netzwelt.de/dw1600_dh900_sw1072_sh603_sx0_sy0_sr16x9_nu2/picture/original/2026/07/ea-sports-fc-27-standard-edition-cover-469064.jpeg', 'EA Sports', 'PEGI 16', TRUE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image), is_new=FALSE;

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, release_date, rating, is_featured, is_new)
SELECT 'Red Dead Redemption 2', 'red-dead-redemption-2', 'Suivez Arthur Morgan et la bande de Van der Linde dans une aventure au cœur de l’Ouest américain.', 'Une aventure dans l’Ouest américain', 450.00, 25, (SELECT id FROM categories WHERE slug='action'), (SELECT id FROM platforms WHERE slug='ps5'), 'https://www.gameshop.qa/wp-content/uploads/2022/04/Red-Dead-Redemption-2.jpg', 'Rockstar Games', '2018-10-26', 'PEGI 18', TRUE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image);

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, rating, is_featured, is_new)
SELECT 'Valorant Points', 'valorant-coins', 'Crédits numériques pour débloquer des contenus dans Valorant.', 'Crédits pour Valorant', 100.00, 100, (SELECT id FROM categories WHERE slug='credits-de-jeu'), (SELECT id FROM platforms WHERE slug='pc'), 'https://store974.com/cdn/shop/products/NewProject-2022-03-03T170110.840_0a05cd19-c922-454c-be10-17c6e1cc29e4-735940.jpg?crop=center&height=1000&v=1647175104&width=1000', 'Riot Games', 'PEGI 16', FALSE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image);

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, rating, is_featured, is_new)
SELECT 'V-Bucks Fortnite', 'fortnite-vbucks', 'Crédits numériques pour Fortnite. La plateforme et la livraison dépendent de votre compte.', 'Crédits pour Fortnite', 100.00, 100, (SELECT id FROM categories WHERE slug='credits-de-jeu'), (SELECT id FROM platforms WHERE slug='pc'), 'https://www.clipartkey.com/mpngs/m/112-1124684_fortnite-v-bucks.png', 'Epic Games', 'PEGI 12', FALSE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image);

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, rating, is_featured, is_new)
SELECT 'FC Coins', 'fc-coins', 'Crédits numériques pour EA SPORTS FC. La plateforme et le contenu dépendent de votre compte.', 'Crédits pour EA SPORTS FC', 100.00, 100, (SELECT id FROM categories WHERE slug='credits-de-jeu'), (SELECT id FROM platforms WHERE slug='ps5'), 'https://boostingmarket.com/images/games/fc-boost/packs/fc-coins-boost.webp', 'EA Sports', 'PEGI 3', FALSE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image);

-- Set up the requested administrator account, retaining the existing admin user's orders.
UPDATE users
SET username='assil', email='assil@admin.ma', password='$2y$12$eyqlGgOxJ7gs/a.W8GpyJOhLSQ4PM2Lr4Y5qGK6iDqEaDF7f8isx6', first_name='Assil', last_name='Admin', role='admin'
WHERE email='admin@gamestore.fr';

INSERT INTO users (username, email, password, first_name, last_name, role)
SELECT 'assil', 'assil@admin.ma', '$2y$12$eyqlGgOxJ7gs/a.W8GpyJOhLSQ4PM2Lr4Y5qGK6iDqEaDF7f8isx6', 'Assil', 'Admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='assil@admin.ma')
ON DUPLICATE KEY UPDATE username='assil', password=VALUES(password), first_name='Assil', last_name='Admin', role='admin';
