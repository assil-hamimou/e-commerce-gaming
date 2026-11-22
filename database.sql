-- ============================================
-- GameStore - Base de données
-- ============================================

CREATE DATABASE IF NOT EXISTS gamestore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gamestore_db;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    address TEXT,
    phone VARCHAR(20),
    role ENUM('client', 'admin') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50)
);

-- Table des plateformes (PS5, Xbox, PC, etc.)
CREATE TABLE IF NOT EXISTS platforms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    logo VARCHAR(255)
);

-- Table des jeux (produits)
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    stock INT DEFAULT 0,
    category_id INT,
    platform_id INT,
    image VARCHAR(255),
    publisher VARCHAR(100),
    release_date DATE,
    rating ENUM('PEGI 3','PEGI 7','PEGI 12','PEGI 16','PEGI 18'),
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (platform_id) REFERENCES platforms(id)
);

-- Table du panier
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(100),
    game_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Détails des commandes
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    game_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Table des avis/reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- Données de démo
-- ============================================

INSERT INTO categories (name, slug, description, icon) VALUES
('Action', 'action', 'Jeux d\'action et aventure', NULL),
('RPG', 'rpg', 'Jeux de rôle', NULL),
('Sport', 'sport', 'Jeux de sport', NULL),
('FPS', 'fps', 'First Person Shooter', NULL),
('Stratégie', 'strategie', 'Jeux de stratégie', NULL),
('Course', 'course', 'Jeux de course', NULL);

INSERT INTO platforms (name, slug) VALUES
('PlayStation 5', 'ps5'),
('Xbox Series X', 'xbox'),
('PC', 'pc'),
('Nintendo Switch', 'switch'),
('PlayStation 4', 'ps4');

INSERT INTO games (title, slug, description, short_description, price, old_price, stock, category_id, platform_id, publisher, release_date, rating, is_featured, is_new) VALUES
('Spider-Man 2', 'spider-man-2', 'Incarnez Spider-Man dans cette suite épique sur PS5. Affrontez de nouveaux ennemis dans un New York plus grand que jamais.', 'L\'aventure Spider-Man continue sur PS5', 839.90, NULL, 50, 1, 1, 'Sony Interactive Entertainment', '2023-10-20', 'PEGI 16', TRUE, TRUE),
('Elden Ring', 'elden-ring', 'Explorez les Terres Intermédiaires dans ce RPG action de FromSoftware. Un chef-d\'oeuvre de difficulté et de lore.', 'RPG d\'action épique par FromSoftware', 629.90, 734.90, 30, 2, 3, 'Bandai Namco', '2022-02-25', 'PEGI 16', TRUE, FALSE),
('EA Sports FC 24', 'ea-fc-24', 'La simulation football la plus réaliste. Jouez avec vos équipes et joueurs préférés du monde entier.', 'Le meilleur jeu de football au monde', 734.90, 839.90, 100, 3, 1, 'EA Sports', '2023-09-29', 'PEGI 3', TRUE, FALSE),
('Call of Duty MW3', 'cod-mw3', 'La suite de Modern Warfare 2 avec un mode campagne inédit et un multijoueur explosif.', 'FPS tactique nouvelle génération', 787.40, NULL, 45, 4, 2, 'Activision', '2023-11-10', 'PEGI 18', FALSE, TRUE),
('Zelda: Tears of the Kingdom', 'zelda-totk', 'Link explore Hyrule et les cieux dans cette suite de Breath of the Wild. Construisez, explorez, combattez.', 'L\'aventure ultime sur Nintendo Switch', 629.90, NULL, 25, 1, 4, 'Nintendo', '2023-05-12', 'PEGI 12', TRUE, FALSE),
('Gran Turismo 7', 'gran-turismo-7', 'La simulation automobile ultime. Des centaines de voitures, des circuits légendaires, le tout en 4K 60fps.', 'Simulation auto ultime', 524.90, 734.90, 60, 6, 1, 'Sony Interactive Entertainment', '2022-03-04', 'PEGI 3', FALSE, FALSE),
('Cyberpunk 2077', 'cyberpunk-2077', 'Plongez dans Night City, une mégalopole du futur où vous incarnez V, mercenaire cherchant l\'immortalité.', 'RPG open-world futuriste', 419.90, 629.90, 80, 2, 3, 'CD Projekt RED', '2020-12-10', 'PEGI 18', FALSE, FALSE),
('Hogwarts Legacy', 'hogwarts-legacy', 'Vivez votre aventure à Poudlard dans les années 1800. Explorez la magie, les créatures et les secrets.', 'L\'école de magie comme jamais vue', 577.40, 734.90, 35, 2, 1, 'Warner Bros. Games', '2023-02-10', 'PEGI 12', FALSE, FALSE);

-- Nouveaux jeux et crédits, avec des visuels de couverture associés.
INSERT INTO categories (name, slug, description, icon)
VALUES ('Crédits de jeu', 'credits-de-jeu', 'Crédits et monnaies pour vos jeux préférés', NULL)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

INSERT INTO games (title, slug, description, short_description, price, old_price, stock, category_id, platform_id, image, publisher, release_date, rating, is_featured, is_new)
SELECT 'Grand Theft Auto VI', 'gta-6', 'Explorez Vice City et l’État de Leonida dans le nouvel épisode de la série Grand Theft Auto.', 'Le nouvel épisode Grand Theft Auto', 750.00, 850.00, 25, (SELECT id FROM categories WHERE slug = 'action'), (SELECT id FROM platforms WHERE slug = 'ps5'), 'https://cdn.alza.cz/Foto/ImgGalery/Image/gta-6-jason-and-lucia.jpg', 'Rockstar Games', '2026-11-19', 'PEGI 18', TRUE, TRUE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), short_description=VALUES(short_description), price=VALUES(price), old_price=VALUES(old_price), image=VALUES(image), is_featured=TRUE, is_new=TRUE;

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, release_date, rating, is_featured, is_new)
SELECT 'Grand Theft Auto V', 'gta-5', 'Parcourez Los Santos et suivez les histoires de Michael, Franklin et Trevor.', 'L’aventure criminelle à Los Santos', 350.00, 30, (SELECT id FROM categories WHERE slug = 'action'), (SELECT id FROM platforms WHERE slug = 'ps5'), 'https://upload.wikimedia.org/wikipedia/vi/f/f8/Grand_Theft_Auto_V_DVD_cover.jpg', 'Rockstar Games', '2013-09-17', 'PEGI 18', TRUE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image);

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, rating, is_featured, is_new)
SELECT 'EA SPORTS FC 27', 'fc-27', 'Vivez le football avec les clubs et les joueurs de la saison dans EA SPORTS FC 27.', 'La nouvelle saison de football', 650.00, 30, (SELECT id FROM categories WHERE slug = 'sport'), (SELECT id FROM platforms WHERE slug = 'ps5'), 'https://img.netzwelt.de/dw1600_dh900_sw1072_sh603_sx0_sy0_sr16x9_nu2/picture/original/2026/07/ea-sports-fc-27-standard-edition-cover-469064.jpeg', 'EA Sports', 'PEGI 16', TRUE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image), is_new=FALSE;

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, release_date, rating, is_featured, is_new)
SELECT 'Red Dead Redemption 2', 'red-dead-redemption-2', 'Suivez Arthur Morgan et la bande de Van der Linde dans une aventure au cœur de l’Ouest américain.', 'Une aventure dans l’Ouest américain', 450.00, 25, (SELECT id FROM categories WHERE slug = 'action'), (SELECT id FROM platforms WHERE slug = 'ps5'), 'https://www.gameshop.qa/wp-content/uploads/2022/04/Red-Dead-Redemption-2.jpg', 'Rockstar Games', '2018-10-26', 'PEGI 18', TRUE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image);

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, rating, is_featured, is_new)
SELECT 'Valorant Points', 'valorant-coins', 'Crédits numériques pour débloquer des contenus dans Valorant.', 'Crédits pour Valorant', 100.00, 100, (SELECT id FROM categories WHERE slug = 'credits-de-jeu'), (SELECT id FROM platforms WHERE slug = 'pc'), 'https://store974.com/cdn/shop/products/NewProject-2022-03-03T170110.840_0a05cd19-c922-454c-be10-17c6e1cc29e4-735940.jpg?crop=center&height=1000&v=1647175104&width=1000', 'Riot Games', 'PEGI 16', FALSE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image);

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, rating, is_featured, is_new)
SELECT 'V-Bucks Fortnite', 'fortnite-vbucks', 'Crédits numériques pour Fortnite. La livraison et la plateforme dépendent de votre compte.', 'Crédits pour Fortnite', 100.00, 100, (SELECT id FROM categories WHERE slug = 'credits-de-jeu'), (SELECT id FROM platforms WHERE slug = 'pc'), 'https://www.clipartkey.com/mpngs/m/112-1124684_fortnite-v-bucks.png', 'Epic Games', 'PEGI 12', FALSE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image);

INSERT INTO games (title, slug, description, short_description, price, stock, category_id, platform_id, image, publisher, rating, is_featured, is_new)
SELECT 'FC Coins', 'fc-coins', 'Crédits numériques pour EA SPORTS FC. La plateforme et le contenu dépendent de votre compte.', 'Crédits pour EA SPORTS FC', 100.00, 100, (SELECT id FROM categories WHERE slug = 'credits-de-jeu'), (SELECT id FROM platforms WHERE slug = 'ps5'), 'https://boostingmarket.com/images/games/fc-boost/packs/fc-coins-boost.webp', 'EA Sports', 'PEGI 3', FALSE, FALSE
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), image=VALUES(image);

-- Compte administrateur A2SIL. Mot de passe initial : assil123.
INSERT INTO users (username, email, password, first_name, last_name, role) VALUES
('assil', 'assil@admin.ma', '$2y$12$eyqlGgOxJ7gs/a.W8GpyJOhLSQ4PM2Lr4Y5qGK6iDqEaDF7f8isx6', 'Assil', 'Admin', 'admin')
ON DUPLICATE KEY UPDATE username=VALUES(username), password=VALUES(password), first_name=VALUES(first_name), last_name=VALUES(last_name), role='admin';

UPDATE users SET username='assil', email='assil@admin.ma', password='$2y$12$eyqlGgOxJ7gs/a.W8GpyJOhLSQ4PM2Lr4Y5qGK6iDqEaDF7f8isx6', first_name='Assil', last_name='Admin', role='admin' WHERE email='admin@gamestore.fr';
