import React, { forwardRef, useImperativeHandle, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ItemCard from './ItemCard';
import usePaginatedItems from '../hooks/usePaginatedItems';
import axios from 'axios';

const ListPanel = forwardRef(({ onMoved }, ref) => {
  const { filter, setFilter, items, hasMore, fetchMore, isLoading, reset } = usePaginatedItems({ selected: false });
  const [newId, setNewId] = useState('');

  useImperativeHandle(ref, () => ({
    refresh: () => reset()
  }));

  const handleSelect = async id => {
    try {
      await axios.post('http://localhost:4000/api/select', { ids: [id] });
      await onMoved();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async () => {
    if (!newId) return;
    try {
      await axios.post('http://localhost:4000/api/items', { id: Number(newId) });
      setNewId('');
      await onMoved();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="panel">
      <header className="panel__header">
        <h2 className="panel__title">Все элементы</h2>
        <div className="form-row">
          <input
            className="styled-input"
            type="number"
            placeholder="Новый ID"
            value={newId}
            onChange={e => setNewId(e.target.value)}
          />
          <button className="styled-button" onClick={handleAdd}>
            Добавить
          </button>
        </div>
        <input
          className="styled-input"
          type="text"
          placeholder="Фильтр по ID"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </header>
      <InfiniteScroll
        className="scroll-area"
        dataLength={items.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={<div className="scroll-loader">Загрузка...</div>}
        height={'55vh'}
        scrollThreshold={0.8}
      >
        <div className="cards-grid">
          {items.map(item => (
            <ItemCard key={`list-${item.id}`} item={item} onClick={handleSelect} selected={false} />
          ))}
        </div>
      </InfiniteScroll>
    </section>
  );
});

export default ListPanel;
