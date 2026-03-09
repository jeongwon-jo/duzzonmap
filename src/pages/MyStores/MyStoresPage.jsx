// src/pages/MyStores/MyStoresPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToStores, updateStock, deleteStore } from '../../firebase/stores';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import './MyStoresPage.scss';

const MyStoreCard = ({ store, onEdit, onDeleted }) => {
  const [count, setCount] = useState(store.duzzonCount);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isDirty = count !== store.duzzonCount;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStock(store.id, count);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStore(store.id);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="my-store-card">
      <div className="my-store-card__header">
        <div>
          <h3 className="my-store-card__name">{store.name}</h3>
          <p className="my-store-card__address">{store.address}</p>
        </div>
        <div className="my-store-card__header-actions">
          <button className="btn-edit" onClick={() => onEdit(store)}>정보 수정</button>
          <button className="btn-delete" onClick={() => setConfirmDelete(true)}>삭제</button>
        </div>
      </div>

      <div className="my-store-card__stock">
        <span className="my-store-card__stock-label">두쫀쿠 재고</span>
        <div className="my-store-card__stock-control">
          <button
            onClick={() => setCount(c => Math.max(0, c - 1))}
            disabled={count <= 0}
          >−</button>
          <input
            type="number"
            min="0"
            value={count}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setCount(isNaN(v) ? 0 : Math.max(0, v));
            }}
          />
          <span className="unit">개</span>
          <button onClick={() => setCount(c => c + 1)}>+</button>
        </div>
        {isDirty && (
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '저장 중...' : '재고 저장'}
          </button>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="매장을 삭제할까요?"
          message={`"${store.name}" 매장이 지도에서 삭제됩니다.\n삭제 후 복구할 수 없습니다.`}
          confirmLabel="삭제"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
};

const MyStoresPage = ({ user }) => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToStores((all) => {
      setStores(all.filter(s => s.ownerId === user.uid));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  if (!user) {
    return (
      <div className="my-stores-page">
        <div className="my-stores-page__empty">
          <p>사장님 로그인 후 이용할 수 있어요.</p>
          <button onClick={() => navigate('/register')}>로그인하러 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-stores-page">
      <div className="my-stores-page__inner">
        <div className="my-stores-page__title-row">
          <h1>내 매장 관리</h1>
          <button
            className="btn-add"
            onClick={() => navigate('/register')}
          >매장 등록</button>
        </div>

        {loading && (
          <div className="my-stores-page__empty">
            <p>불러오는 중...</p>
          </div>
        )}

        {!loading && stores.length === 0 && (
          <div className="my-stores-page__empty">
            <p>등록된 매장이 없어요.</p>
            <button onClick={() => navigate('/register')}>첫 매장 등록하기</button>
          </div>
        )}

        <div className="my-stores-page__list">
          {stores.map(store => (
            <MyStoreCard
              key={store.id}
              store={store}
              onEdit={(s) => navigate('/register', { state: { store: s } })}
              onDeleted={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyStoresPage;
