-- ============================================================================
-- Identity model:
--   * anon    -> a music_users row whose `username` is set to the phonenumber.
--                It is also logged into `phone_logged_in_accounts`.
--   * user    -> the same table, promoted by replacing the phone-as-username
--                with a chosen username (account created) and is logged
--                using a password.
--   * artist  -> a user account with is_artist = 1 and artist_id linking to the
--                music_artists table. Requires an existing user account.
--
-- The uuid (CHAR(36)) is the platform-wide identity key; a username that equals
-- the phonenumber marks a partial (anon) account. Logins are persisted across
-- reloads by the parent phone system's `phone_logged_in_accounts` table
-- (phone_number -> app -> username), which this resource reads for auto-login,
-- writes anon rows into, and removes rows from on logout. This allows for anon
-- accounts to be "upgraded" to user accounts.
-- ============================================================================

CREATE TABLE IF NOT EXISTS `music_artists` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `image` VARCHAR(512) NULL DEFAULT NULL,
  `genre` VARCHAR(64) NULL DEFAULT NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  `followers` INT UNSIGNED NOT NULL DEFAULT 0,
  `bio` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_artists_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ALTER TABLE `music_artists` ADD COLUMN `bio` TEXT NULL DEFAULT NULL AFTER `followers`;

CREATE TABLE IF NOT EXISTS `music_users` (
  `uuid` CHAR(36) NOT NULL,
  `phonenumber` VARCHAR(15) NULL DEFAULT NULL,
  `username` VARCHAR(32) NULL DEFAULT NULL,
  `password` VARCHAR(255) NULL DEFAULT NULL,
  `profile_pic` VARCHAR(512) NULL DEFAULT NULL,
  `is_artist` TINYINT(1) NOT NULL DEFAULT 0,
  `artist_id` INT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_seen_at` TIMESTAMP NULL DEFAULT NULL,

  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uq_users_username` (`username`),
  KEY `idx_users_phonenumber` (`phonenumber`),
  KEY `idx_users_artist` (`artist_id`),

  CONSTRAINT `fk_users_artist` FOREIGN KEY (`artist_id`)
    REFERENCES `music_artists` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Content

CREATE TABLE IF NOT EXISTS `music_songs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `artist_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `author` VARCHAR(64) NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  `image` VARCHAR(512) NULL DEFAULT NULL,
  `duration` INT UNSIGNED NOT NULL DEFAULT 0,
  `streams` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_songs_artist` (`artist_id`),

  CONSTRAINT `fk_songs_artist` FOREIGN KEY (`artist_id`)
    REFERENCES `music_artists` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `music_albums` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `artist_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `image` VARCHAR(512) NULL DEFAULT NULL,
  `year` VARCHAR(4) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_albums_artist` (`artist_id`),

  CONSTRAINT `fk_albums_artist` FOREIGN KEY (`artist_id`)
    REFERENCES `music_artists` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `music_album_tracks` (
  `album_id` INT UNSIGNED NOT NULL,
  `song_id` INT UNSIGNED NOT NULL,
  `position` INT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (`album_id`, `song_id`),
  KEY `idx_album_tracks_song` (`song_id`),

  CONSTRAINT `fk_album_tracks_album` FOREIGN KEY (`album_id`)
    REFERENCES `music_albums` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_album_tracks_song` FOREIGN KEY (`song_id`)
    REFERENCES `music_songs` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `music_playlists` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(128) NOT NULL,
  `image` VARCHAR(512) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `music_playlist_tracks` (
  `playlist_id` INT UNSIGNED NOT NULL,
  `song_id` INT UNSIGNED NOT NULL,
  `position` INT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (`playlist_id`, `song_id`),
  KEY `idx_playlist_tracks_song` (`song_id`),

  CONSTRAINT `fk_playlist_tracks_playlist` FOREIGN KEY (`playlist_id`)
    REFERENCES `music_playlists` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_playlist_tracks_song` FOREIGN KEY (`song_id`)
    REFERENCES `music_songs` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `music_song_likes` (
  `user_uuid` CHAR(36) NOT NULL,
  `song_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`user_uuid`, `song_id`),
  KEY `idx_song_likes_song` (`song_id`),

  CONSTRAINT `fk_song_likes_user` FOREIGN KEY (`user_uuid`)
    REFERENCES `music_users` (`uuid`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_song_likes_song` FOREIGN KEY (`song_id`)
    REFERENCES `music_songs` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
