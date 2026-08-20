-- ----------------------------------------------------------------------------
-- Artists
-- ----------------------------------------------------------------------------
INSERT IGNORE INTO `music_artists` (`id`, `name`, `image`, `genre`, `verified`, `followers`, `bio`) VALUES
  (201, 'Love Fist',                 '', 'Hair Metal / Hard Rock',     0, 1250000, NULL),
  (202, 'DJ Cara',                   '', 'Dance-Pop / Electronic',     1,  840000, 'DJ Cara is the one and only DJ and host of Non-Stop Pop FM.'),
  (203, 'Dr. Ray De Angelo Harris',  '', 'Talk / Spiritual Self-Help', 0,  310000, NULL),
  (204, 'Pooh Bear',                 '', 'West Coast Hip-Hop',         0,  620000, NULL),
  (205, 'OG Loc',                    '', 'Underground Gangsta Rap',    0,   14200, NULL),
  -- derived from MOCK_SONGS authors with no matching MOCK_ARTISTS entry
  (206, 'Hechiceros Band',           '', NULL,                         0,       0, NULL),
  (207, 'Kendrick Lamar',            '', NULL,                         0,       0, NULL),
  (208, 'Tyler, The Creator',        '', NULL,                         0,       0, NULL),
  -- MOCK_STUDIO_SONGS / MOCK_STUDIO_ALBUMS artist
  (300, 'Nova Eclipse',              'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Sounds_of_Earth_-_GPN-2000-001976.jpg/330px-The_Sounds_of_Earth_-_GPN-2000-001976.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', NULL, 0, 0, NULL);

-- ----------------------------------------------------------------------------
-- Songs
-- ----------------------------------------------------------------------------
INSERT IGNORE INTO `music_songs` (`id`, `artist_id`, `name`, `author`, `url`, `image`, `duration`, `streams`) VALUES
  -- MOCK_SONGS
  (101, 202, 'Midnight City (LS Remix)', 'M83 ft. DJ Cara',      'https://r2.fivemanage.com/fwEa0a4lpWblPD4RLxiV9/audiocopper-dark-571483.mp3', '', 243, 0),
  (102, 206, 'El Sonidito',              'Hechiceros Band',      'https://example.com/audio/el-sonidito.mp3', '', 195, 0),
  (103, 207, 'ADHD',                     'Kendrick Lamar',       'https://example.com/audio/adhd.mp3', '', 215, 0),
  (104, 208, 'Garbage',                  'Tyler, The Creator',   'https://example.com/audio/garbage.mp3', '', 208, 0),
  (105, 201, 'Lock & Load',              'Love Fist',            'https://example.com/audio/lock-and-load.mp3', '', 180, 0),
  -- MOCK_STUDIO_SONGS
  (201, 300, 'Golden Hour',     'Nova Eclipse', 'https://example.com/audio/golden-hour.mp3',     'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Sounds_of_Earth_-_GPN-2000-001976.jpg/330px-The_Sounds_of_Earth_-_GPN-2000-001976.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', 214, 0),
  (202, 300, 'Starlight Drive', 'Nova Eclipse', 'https://example.com/audio/starlight-drive.mp3', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Sounds_of_Earth_-_GPN-2000-001976.jpg/330px-The_Sounds_of_Earth_-_GPN-2000-001976.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', 198, 0),
  (203, 300, 'Neon Rain',       'Nova Eclipse', 'https://example.com/audio/neon-rain.mp3',       'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Sounds_of_Earth_-_GPN-2000-001976.jpg/330px-The_Sounds_of_Earth_-_GPN-2000-001976.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', 226, 0),
  (204, 300, 'Paper Moons',     'Nova Eclipse', 'https://example.com/audio/paper-moons.mp3',     'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Sounds_of_Earth_-_GPN-2000-001976.jpg/330px-The_Sounds_of_Earth_-_GPN-2000-001976.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', 187, 0),
  (205, 300, 'Afterglow',       'Nova Eclipse', 'https://example.com/audio/afterglow.mp3',       'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Sounds_of_Earth_-_GPN-2000-001976.jpg/330px-The_Sounds_of_Earth_-_GPN-2000-001976.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', 240, 0);

-- ----------------------------------------------------------------------------
-- Albums (mock string ids -> int ids 1-5)
-- ----------------------------------------------------------------------------
INSERT IGNORE INTO `music_albums` (`id`, `artist_id`, `name`, `image`, `year`) VALUES
  (1, 202, 'Non Stop FM Vol. 1',    '',                                                                                                                   '2013'),
  (2, 202, 'Non Stop FM Vol. 2',    '',                                                                                                                   '2013'),
  (3, 300, 'The Sounds of Earth',   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Sounds_of_Earth_-_GPN-2000-001976.jpg/330px-The_Sounds_of_Earth_-_GPN-2000-001976.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', '2024'),
  (4, 300, 'Echoes of Dawn',        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Sounds_of_Earth_-_GPN-2000-001976.jpg/330px-The_Sounds_of_Earth_-_GPN-2000-001976.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', '2022'),
  (5, 300, 'Neon Horizons',         'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Sounds_of_Earth_-_GPN-2000-001976.jpg/330px-The_Sounds_of_Earth_-_GPN-2000-001976.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', '2020');

-- Album tracks (position preserves the mock track order)
INSERT IGNORE INTO `music_album_tracks` (`album_id`, `song_id`, `position`) VALUES
  -- Non Stop FM Vol. 1/2 -> MOCK_SONGS filtered by author containing 'dj cara'
  (1, 101, 0),
  (2, 101, 0),
  -- The Sounds of Earth -> MOCK_STUDIO_SONGS.slice(0, 3)
  (3, 201, 0), (3, 202, 1), (3, 203, 2),
  -- Echoes of Dawn -> MOCK_STUDIO_SONGS.slice(3)
  (4, 204, 0), (4, 205, 1);
  -- Neon Horizons has no tracks

-- ----------------------------------------------------------------------------
-- Playlists
-- ----------------------------------------------------------------------------
INSERT IGNORE INTO `music_playlists` (`id`, `title`, `image`) VALUES
  (301, 'Non-Stop-Pop FM Hits',            'https://static.wikia.nocookie.net/gta/images/6/67/Non-stop-pop-FM-GTAV.png'),
  (302, 'Vinewood Night Drive',            ''),
  (303, 'Radio Los Santos Bangers',        ''),
  (304, 'Blaine County Highway Classics',  ''),
  (305, 'West Coast Talk Highlights',      ''),
  (306, 'Chumash Mashup',                  '');

INSERT IGNORE INTO `music_playlist_tracks` (`playlist_id`, `song_id`, `position`) VALUES
  -- 301/302 -> [...MOCK_SONGS]
  (301, 101, 0), (301, 102, 1), (301, 103, 2), (301, 104, 3), (301, 105, 4),
  (302, 101, 0), (302, 102, 1), (302, 103, 2), (302, 104, 3), (302, 105, 4),
  -- 303 -> MOCK_SONGS[2], MOCK_SONGS[3]
  (303, 103, 0), (303, 104, 1),
  -- 304 -> MOCK_SONGS[0], MOCK_SONGS[4]
  (304, 101, 0), (304, 105, 1),
  -- 305 -> MOCK_SONGS[1]
  (305, 102, 0),
  -- 306 -> MOCK_SONGS[0], MOCK_SONGS[1]
  (306, 101, 0), (306, 102, 1);

-- ----------------------------------------------------------------------------
-- Verification
-- ----------------------------------------------------------------------------
SELECT 'artists' AS `table`, COUNT(*) AS `rows` FROM `music_artists`
UNION ALL SELECT 'songs', COUNT(*) FROM `music_songs`
UNION ALL SELECT 'albums', COUNT(*) FROM `music_albums`
UNION ALL SELECT 'album_tracks', COUNT(*) FROM `music_album_tracks`
UNION ALL SELECT 'playlists', COUNT(*) FROM `music_playlists`
UNION ALL SELECT 'playlist_tracks', COUNT(*) FROM `music_playlist_tracks`;
