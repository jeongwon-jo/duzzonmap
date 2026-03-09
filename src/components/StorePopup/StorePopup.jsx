// src/components/StorePopup/StorePopup.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StorePopup.scss';

const getStockStatus = (count) => {
  if (count === 0) return { label: '품절', cls: 'soldout' };
  if (count <= 3) return { label: '마감임박', cls: 'low' };
  return { label: '구매가능', cls: 'available' };
};

const StorePopup = ({ store, onClose, user }) => {
  if (!store) return null;
  const status = getStockStatus(store.duzzonCount);
  const navigate = useNavigate();

  const isOwner = user && user.uid === store.ownerId;

  return (
    <>
      <div className="popup-overlay active" onClick={onClose} />
      <div className="store-popup">
        <div className="store-popup__card">
          <div className="store-popup__handle"><div /></div>

          <div className="store-popup__header">
            <div className="store-popup__title-group">
              <h2 className="store-popup__name">{store.name}</h2>
              <p className="store-popup__address">{store.address}</p>
            </div>
            <button className="store-popup__close" onClick={onClose}>✕</button>
          </div>

          <div className="store-popup__stock">
            <div>
              <div className="store-popup__stock-label">두쫀쿠 남은 수량</div>
            </div>
            <div className="store-popup__stock-value">
              <span className="count">{store.duzzonCount}</span>
              <span className="unit">개</span>
            </div>
            <span className={`store-popup__stock-badge ${status.cls}`}>
              {status.label}
            </span>
          </div>

          <div className="store-popup__info">
            <div className="store-popup__info-row">
              <span className="icon">📞</span>
              <span className="label">전화번호</span>
              <span className="value">{store.phone || '정보 없음'}</span>
            </div>
            <div className="store-popup__info-row">
              <span className="icon">🕐</span>
              <span className="label">영업시간</span>
              <span className="value">{store.hours || '정보 없음'}</span>
            </div>
          </div>

          <div className="store-popup__actions">
            {isOwner && (
              <button
                className="edit-btn"
                onClick={() => {
                  onClose();
                  navigate('/register', { state: { store } });
                }}
              >
                재고 수정
              </button>
            )}
            <button
              className="call-btn"
              onClick={() => window.open(`tel:${store.phone}`)}
            >
              전화하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StorePopup;
