import { useCallback } from 'react';
import { fetchNui } from '~/utils/fetchNui';
import { useNuiEvent } from '~/hooks/useNuiEvent';
import type { BasicResponse, SongBasic, SongLikedPayload } from '@common/types';
import { debugData } from '~/utils/debugData';

export function useSongLike(onSongLiked?: (songId: SongBasic['id'], isLiked: boolean) => void) {
  useNuiEvent<SongLikedPayload>('musicapp:songliked', ({ id, liked }) => {
    if (onSongLiked) {
      onSongLiked(id, liked);
    }
  });

  const toggleLike = useCallback(
    async (songId: SongBasic['id'], currentState: boolean) => {
      const nextState = !currentState;

      if (onSongLiked) {
        onSongLiked(songId, nextState);
      }

      try {
        const result = await fetchNui<BasicResponse>(
          'musicapp:likesong',
          { id: songId, state: nextState },
          { success: true },
        );

        if (!result.success) {
          if (onSongLiked) {
            onSongLiked(songId, currentState);
          }
          sendNotification({
            title: 'Unable to like song',
            content: result.message,
          });
        }

        debugData(
          [
            {
              action: 'musicapp:songliked',
              data: { id: songId, liked: nextState } satisfies SongLikedPayload,
            },
          ],
          100,
        );
      } catch (err) {
        if (onSongLiked) {
          onSongLiked(songId, currentState);
        }
        console.error('Failed to toggle song like', err);
      }
    },
    [onSongLiked],
  );

  return { toggleLike };
}
