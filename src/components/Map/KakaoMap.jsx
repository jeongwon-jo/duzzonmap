// src/components/Map/KakaoMap.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import './KakaoMap.scss';

const KAKAO_APP_KEY = process.env.REACT_APP_KAKAO_APP_KEY;
const TRANSPARENT_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// "09:00 - 20:00" 형식 파싱 → 현재 영업 중 여부
const isCurrentlyOpen = (hours) => {
  if (!hours) return false;
  const match = hours.match(/(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})/);
  if (!match) return false;
  const [, sh, sm, eh, em] = match.map(Number);
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const open = sh * 60 + sm;
  const close = eh * 60 + em;
  if (open <= close) return cur >= open && cur < close;
  return cur >= open || cur < close; // 자정 넘기는 경우
};

const createMarkerEl = (store, isOpen, onClick) => {
  const countLabel = store.duzzonCount === 0 ? '품절' : `${store.duzzonCount}개`;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    user-select: none;
    animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
  `;

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

  const emoji = document.createElement('img');
  emoji.src = '/images/logo_icon.png';
  emoji.alt = '';
  emoji.width = 28;
  emoji.style.cssText = `position: absolute; top: -13px; left: -8px;`;
  bubble.appendChild(emoji);

  // 영업중 초록 dot
  if (isOpen) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      width: 11px;
      height: 11px;
      background: #22c55e;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 6px rgba(34,197,94,0.7);
    `;
    bubble.appendChild(dot);
  }

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

  wrapper.addEventListener('mouseenter', () => {
    wrapper.style.transform = 'scale(1.15) translateY(-3px)';
  });
  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.transform = '';
  });
  wrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return wrapper;
};

const KakaoMap = ({ stores, onMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const clustererRef = useRef(null);
  const pairsRef = useRef([]); // [{ marker, overlay }]
  const myLocationRef = useRef(null); // 현재 위치 캐시
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filter, setFilter] = useState('all');

  // SDK 로드
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => setMapLoaded(true));
      return;
    }
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services,clusterer`;
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

    // 현재 위치로 이동 + ref에 저장
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const pos = new kakao.maps.LatLng(coords.latitude, coords.longitude);
          myLocationRef.current = pos;
          mapInstance.current.setCenter(pos);
        },
        () => {} // 거부/실패 시 서울 기본값 유지
      );
    }

    // 클러스터러 초기화
    const clusterStyle = (size, lineH) => ({
      width: `${size}px`,
      height: `${size}px`,
      background: 'rgba(255,107,53,0.92)',
      border: '3px solid #5A2A13',
      borderRadius: '50%',
      color: 'white',
      textAlign: 'center',
      lineHeight: `${lineH}px`,
      fontSize: `${Math.round(size * 0.3)}px`,
      fontWeight: '700',
      fontFamily: 'Pretendard, sans-serif',
    });

    clustererRef.current = new kakao.maps.MarkerClusterer({
      map: mapInstance.current,
      averageCenter: true,
      minLevel: 5,
      gridSize: 60,
      styles: [
        clusterStyle(48, 42),
        clusterStyle(56, 50),
        clusterStyle(64, 58),
      ],
    });

    // 클러스터 이벤트 → 겹친 마커의 커스텀 오버레이 숨김
    kakao.maps.event.addListener(clustererRef.current, 'clustered', (clusters) => {
      const clusteredSet = new Set();
      clusters.forEach(c => c.getMarkers().forEach(m => clusteredSet.add(m)));
      pairsRef.current.forEach(({ marker, overlay }) => {
        if (clusteredSet.has(marker)) {
          overlay.setMap(null);
        } else {
          overlay.setMap(mapInstance.current);
        }
      });
    });
  }, [mapLoaded]);

  // 마커(오버레이) 생성/갱신
  const renderMarkers = useCallback(() => {
    if (!mapInstance.current || !window.kakao) return;
    const { kakao } = window;

    // 기존 오버레이 제거
    pairsRef.current.forEach(({ overlay }) => overlay.setMap(null));
    pairsRef.current = [];
    if (clustererRef.current) clustererRef.current.clear();

    const filtered = stores.filter(store => {
      if (filter === 'available') return store.duzzonCount > 3;
      if (filter === 'low')       return store.duzzonCount > 0 && store.duzzonCount <= 3;
      if (filter === 'soldout')   return store.duzzonCount === 0;
      if (filter === 'open')      return isCurrentlyOpen(store.hours);
      return true;
    });

    const pairs = [];
    const markers = [];

    filtered.forEach(store => {
      if (store.lat == null || store.lng == null) return;
      const position = new kakao.maps.LatLng(store.lat, store.lng);
      const isOpen = isCurrentlyOpen(store.hours);

      // 클러스터링용 투명 마커 (1x1)
      const marker = new kakao.maps.Marker({
        position,
        image: new kakao.maps.MarkerImage(TRANSPARENT_IMG, new kakao.maps.Size(1, 1)),
      });

      // 커스텀 오버레이 (표시는 clustered 이벤트에서 결정)
      const el = createMarkerEl(store, isOpen, () => {
        onMarkerClick(store);
        mapInstance.current.panTo(position);
      });
      const overlay = new kakao.maps.CustomOverlay({
        position,
        content: el,
        yAnchor: 1.0,
        zIndex: 3,
      });

      pairs.push({ marker, overlay });
      markers.push(marker);
    });

    pairsRef.current = pairs;

    if (clustererRef.current) {
      // addMarkers → clustered 이벤트 자동 발생 → 오버레이 show/hide
      clustererRef.current.addMarkers(markers);
    } else {
      // 클러스터러 없으면 바로 표시
      pairs.forEach(({ overlay }) => overlay.setMap(mapInstance.current));
    }
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
          { key: 'all',       label: '전체' },
          { key: 'available', label: '✅ 구매가능' },
          { key: 'low',       label: '⚡ 마감임박' },
          { key: 'soldout',   label: '❌ 품절' },
          { key: 'open',      label: '🟢 영업중' },
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

      <button
        className="map-my-location"
        onClick={() => {
          if (!mapInstance.current) return;
          if (myLocationRef.current) {
            mapInstance.current.setCenter(myLocationRef.current);
            mapInstance.current.setLevel(4);
          } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
              const pos = new window.kakao.maps.LatLng(coords.latitude, coords.longitude);
              myLocationRef.current = pos;
              mapInstance.current.setCenter(pos);
              mapInstance.current.setLevel(4);
            });
          }
        }}
        title="현재 위치로"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" strokeOpacity="0"/>
        </svg>
      </button>

      <div className="map-stats">
        <span className="map-stats__count">{availableCount}</span>
        <span className="map-stats__label">구매가능 매장</span>
      </div>
    </div>
  );
};

export default KakaoMap;
