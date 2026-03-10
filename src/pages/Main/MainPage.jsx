// src/pages/Main/MainPage.jsx
import { useEffect, useState } from 'react';
import KakaoMap from "../../components/Map/KakaoMap";
import StorePopup from '../../components/StorePopup/StorePopup';
import { subscribeToStores } from '../../firebase/stores';

const MainPage = ({ user }) => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    const unsub = subscribeToStores(setStores);
    return () => unsub();
  }, []);

  return (
    <>
      <KakaoMap
        stores={stores}
        onMarkerClick={(store) => setSelectedStore(store)}
      />
      {selectedStore && (
        <StorePopup
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          user={user}
        />
      )}
    </>
  );
};

export default MainPage;
