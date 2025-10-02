import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import InfiniteScroll from 'react-infinite-scroll-component';
import ItemCard from './ItemCard';
import usePaginatedItems from '../hooks/usePaginatedItems';
import { apiClient } from '../utils/apiClient';

function SortableItem({ id, item, onUnselect }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-row" {...attributes}>
      <div ref={setActivatorNodeRef} {...listeners} className="drag-handle" aria-label="Переместить">
        ::
      </div>
      <ItemCard item={item} onClick={onUnselect} selected={true} />
    </div>
  );
}

const SelectedPanel = forwardRef(({ onMoved }, ref) => {
  const { filter, setFilter, items, hasMore, fetchMore, isLoading, reset } = usePaginatedItems({ selected: true });
  const [localItems, setLocalItems] = useState([]);

  useEffect(() => setLocalItems(items), [items]);

  useImperativeHandle(ref, () => ({
    refresh: () => reset()
  }));

  const handleUnselect = async id => {
    try {
      await apiClient.post('/api/select', { ids: [id] });
      setLocalItems(prev => prev.filter(item => item.id !== id));
      await onMoved();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragEnd = async event => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex(i => `sel-${i.id}` === active.id);
      const newIndex = localItems.findIndex(i => `sel-${i.id}` === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(newOrder);

      try {
        await apiClient.post('/api/sort', {
          order: newOrder.map(i => i.id)
        });
        await onMoved();
      } catch (e) {
        console.error(e);
        setLocalItems(items);
      }
    }
  };

  return (
    <section className="panel">
      <header className="panel__header">
        <h2 className="panel__title">Выбранные элементы</h2>
        <input
          className="styled-input"
          type="text"
          placeholder="Фильтр по ID"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </header>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localItems.map(i => `sel-${i.id}`)}>
          <InfiniteScroll
            className="scroll-area"
            dataLength={localItems.length}
            next={fetchMore}
            hasMore={hasMore}
            loader={<div className="scroll-loader">Загрузка...</div>}
            height={'55vh'}
            scrollThreshold={0.8}
          >
            <div className="cards-grid">
              {localItems.map(item => (
                <SortableItem key={`sel-${item.id}`} id={`sel-${item.id}`} item={item} onUnselect={handleUnselect} />
              ))}
            </div>
          </InfiniteScroll>
        </SortableContext>
      </DndContext>
    </section>
  );
});

export default SelectedPanel;
