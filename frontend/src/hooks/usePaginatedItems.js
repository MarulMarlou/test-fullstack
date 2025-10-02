import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const LIMIT = 20;

function mergeUnique(existing, incoming) {
  const seen = new Set(existing.map(item => item.id));
  const merged = [...existing];
  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}

export default function usePaginatedItems({ selected }) {
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const versionRef = useRef(0);
  const offsetRef = useRef(0);
  const inFlightForVersionRef = useRef(0);

  const loadPage = useCallback(
    async ({ offset, append }) => {
      const version = versionRef.current;
      inFlightForVersionRef.current += 1;
      setIsLoading(true);

      try {
        const { data } = await axios.get('https://readably-bienvenu-alena.ngrok-free.dev/api/items', {
          params: {
            selected,
            filter,
            offset,
            limit: LIMIT
          }
        });

        if (version !== versionRef.current) {
          return;
        }

        offsetRef.current = offset + data.length;
        setItems(prev => (append ? mergeUnique(prev, data) : data));
        setHasMore(data.length === LIMIT);
      } catch (err) {
        if (version === versionRef.current) {
          console.error(err);
        }
      } finally {
        if (version === versionRef.current) {
          inFlightForVersionRef.current -= 1;
          if (inFlightForVersionRef.current <= 0) {
            inFlightForVersionRef.current = 0;
            setIsLoading(false);
          }
        }
      }
    },
    [selected, filter]
  );

  const reset = useCallback(() => {
    versionRef.current += 1;
    inFlightForVersionRef.current = 0;
    offsetRef.current = 0;
    setItems([]);
    setHasMore(true);
    setIsLoading(false);
    return loadPage({ offset: 0, append: false });
  }, [loadPage]);

  const fetchMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    return loadPage({ offset: offsetRef.current, append: true });
  }, [isLoading, hasMore, loadPage]);

  useEffect(() => {
    reset();
  }, [selected, filter, reset]);

  return { filter, setFilter, items, hasMore, fetchMore, isLoading, reset };
}
