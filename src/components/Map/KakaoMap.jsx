// src/components/Map/KakaoMap.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import './KakaoMap.scss';

const KAKAO_APP_KEY = process.env.REACT_APP_KAKAO_APP_KEY;

// 상태별 색상 (인라인 스타일로 SCSS 의존성 제거 → 마커 확실히 렌더)
const STATUS = {
  soldout: { border: '#555555', count: '#888888', pin: '#555555' },
  low:     { border: '#FFD93D', count: '#FFD93D', pin: '#FFD93D' },
  normal:  { border: '#FF6B35', count: '#FF6B35', pin: '#FF6B35' },
};

const getStatus = (count) => {
  if (count === 0) return 'soldout';
  if (count <= 3) return 'low';
  return 'normal';
};

// CustomOverlay에 넘길 DOM 엘리먼트를 직접 생성
const createMarkerEl = (store, onClick) => {
  const status = getStatus(store.duzzonCount);
  const colors = STATUS[status];
  const countLabel = store.duzzonCount === 0 ? '품절' : `${store.duzzonCount}개`;

  // 바깥 wrapper
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    user-select: none;
    animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
  `;

  // 말풍선 버블
  const bubble = document.createElement('div');
  bubble.style.cssText = `
    background: #cddda3;
    border: 3px solid #5A2A13;
    border-radius: 16px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 2px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    white-space: nowrap;
    position: relative;
    width: max-content;
    transition: transform 0.2s;
  `;

  // 이모지
  const emoji = document.createElement('img');
  emoji.src = '/images/logo_icon.png';
  emoji.alt = '';
  emoji.width = 28;
  emoji.style.cssText = `
    position: absolute;
    top: -13px;
    left: -8px;
  `;
  bubble.appendChild(emoji);

  // 텍스트 영역
  const count = document.createElement('span');
  count.textContent = countLabel;
  count.style.cssText = `
    font-family: 'Pretendard', sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    color: #5A2A13;
  `;


  bubble.appendChild(count);
  wrapper.appendChild(bubble);

  // 호버 효과
  wrapper.addEventListener('mouseenter', () => {
    wrapper.style.transform = 'scale(1.15) translateY(-3px)';
  });
  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.transform = '';
  });

  // 클릭 이벤트 — DOM 엘리먼트에 직접 바인딩하므로 타이밍 문제 없음
  wrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return wrapper;
};

const KakaoMap = ({ stores, onMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const overlaysRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filter, setFilter] = useState('all');

  // 카카오 지도 스크립트 로드
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => setMapLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => setMapLoaded(true));
    script.onerror = () => console.error('카카오 지도 API 로드 실패');
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const { kakao } = window;
    mapInstance.current = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    });
  }, [mapLoaded]);

  // 마커(오버레이) 생성/갱신
  const renderMarkers = useCallback(() => {
    if (!mapInstance.current || !window.kakao) return;
    const { kakao } = window;

    // 기존 오버레이 전부 제거
    overlaysRef.current.forEach(ov => ov.setMap(null));
    overlaysRef.current = [];

    const filtered = stores.filter(store => {
      if (filter === 'available') return store.duzzonCount > 3;
      if (filter === 'low')       return store.duzzonCount > 0 && store.duzzonCount <= 3;
      if (filter === 'soldout')   return store.duzzonCount === 0;
      return true;
    });

    filtered.forEach(store => {
      if (store.lat == null || store.lng == null) return;

      const position = new kakao.maps.LatLng(store.lat, store.lng);

      // DOM 엘리먼트 직접 생성 후 CustomOverlay content로 전달
      const el = createMarkerEl(store, () => {
        onMarkerClick(store);
        mapInstance.current.panTo(position);
      });

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content: el,   // ← 문자열 대신 DOM 엘리먼트 전달
        yAnchor: 1.0,
        zIndex: 3,
      });

      overlay.setMap(mapInstance.current);
      overlaysRef.current.push(overlay);
    });
  }, [stores, filter, onMarkerClick]);

  useEffect(() => {
    if (mapLoaded && mapInstance.current) renderMarkers();
  }, [renderMarkers, mapLoaded]);

  const availableCount = stores.filter(s => s.duzzonCount > 0).length;

  return (
    <div className="map-container">
      {!mapLoaded && (
        <div className="map-loading">
          <div className="map-loading__donut">🍩</div>
          <div className="map-loading__text">DuZZonMap 로딩 중</div>
          <div className="map-loading__sub">두쫀쿠 위치를 불러오고 있어요</div>
        </div>
      )}

      <div id="kakao-map" ref={mapRef} />

      <div className="map-filter">
        {[
          { key: 'all',      label: '전체' },
          { key: 'available',label: '✅ 구매가능' },
          { key: 'low',      label: '⚡ 마감임박' },
          { key: 'soldout',  label: '❌ 품절' },
        ].map(f => (
          <button
            key={f.key}
            className={`map-filter__btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="map-stats">
        <span className="map-stats__count">{availableCount}</span>
        <span className="map-stats__label">구매가능 매장</span>
      </div>
    </div>
  );
};

export default KakaoMap;
