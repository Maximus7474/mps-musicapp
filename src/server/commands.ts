import { oxmysql } from '@communityox/oxmysql';

interface MusicUserRow {
  uuid: string;
  phonenumber: string | null;
  username: string | null;
  is_artist: number;
  artist_id: number | null;
}

export function registerAdminCommands() {
  RegisterCommand(
    'createartist',
    async (src: string | number, args: any[]) => {
      const target = args[0]?.trim();
      if (!target) {
        console.log('^3[musicapp] Usage: createartist <username|uuid> [artistName]^0');
        return;
      }

      const artistName = args.slice(1).join(' ').trim();

      try {
        const user = await oxmysql.single<MusicUserRow>(
          `SELECT uuid, phonenumber, username, is_artist, artist_id
           FROM music_users
          WHERE uuid = ? OR username = ?
          LIMIT 1`,
          [target, target],
        );

        if (!user) {
          console.log(`^3[musicapp] No user found for '${target}'^0`);
          return;
        }

        // Artists require a real account (anon rows use the phonenumber as username).
        if (!user.username || user.username === user.phonenumber) {
          console.log(`^3[musicapp] '${target}' is an anon account - create a real account first^0`);
          return;
        }

        if (user.is_artist && user.artist_id !== null) {
          console.log(`^3[musicapp] '${user.username}' is already an artist (id ${user.artist_id})^0`);
          return;
        }

        const name = artistName || user.username;
        if (name.length > 64) {
          console.log('^3[musicapp] Artist name must be at most 64 characters^0');
          return;
        }

        const artistId = await oxmysql.insert<number>('INSERT INTO music_artists (name) VALUES (?)', [name]);

        await oxmysql.update('UPDATE music_users SET is_artist = 1, artist_id = ? WHERE uuid = ?', [
          artistId,
          user.uuid,
        ]);

        console.log(`^2[musicapp] Artist '${name}' (#${artistId}) linked to '${user.username}' (${user.uuid})^0`);
      } catch (err) {
        console.error('[musicapp] Failed to create artist:', err);
      }
    },
    true,
  );
}
