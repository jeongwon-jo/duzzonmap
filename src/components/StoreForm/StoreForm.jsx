// src/components/StoreForm/StoreForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addStore, updateStore } from '../../firebase/stores';
import { loginOwner, registerOwner } from '../../firebase/auth';
import './StoreForm.scss';

const KAKAO_APP_KEY = process.env.REACT_APP_KAKAO_APP_KEY;

const StoreForm = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const editStore = location.state?.store || null;
  const isEdit = !!editStore;

  const [authTab, setAuthTab] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [form, setForm] = useState({
    name: editStore?.name || '',
    address: editStore?.address || '',
    phone: editStore?.phone || '',
    hours: editStore?.hours || '',
    duzzonCount: editStore?.duzzonCount ?? 10,
    lat: editStore?.lat || null,
    lng: editStore?.lng || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const loadMap = () => {
      if (!window.kakao || !mapRef.current) return;
      const { kakao } = window;

      const center = form.lat
        ? new kakao.maps.LatLng(form.lat, form.lng)
        : new kakao.maps.LatLng(37.5665, 126.9780);

      mapInstance.current = new kakao.maps.Map(mapRef.current, {
        center,
        level: 4,
      });

      if (form.lat) {
        markerRef.current = new kakao.maps.Marker({
          position: center,
          map: mapInstance.current,
        });
      }

      kakao.maps.event.addListener(mapInstance.current, 'click', (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        setForm(prev => ({ ...prev, lat: latlng.getLat(), lng: latlng.getLng() }));

        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new kakao.maps.Marker({
          position: latlng,
          map: mapInstance.current,
        });
      });
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(loadMap);
    } else {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
      script.async = true;
      script.onload = () => window.kakao.maps.load(loadMap);
      document.head.appendChild(script);
    }
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (authTab === 'login') {
        await loginOwner(authForm.email, authForm.password);
      } else {
        await registerOwner(authForm.email, authForm.password);
      }
    } catch (err) {
      const msgs = {
        'auth/user-not-found': '등록되지 않은 이메일입니다.',
        'auth/wrong-password': '비밀번호가 틀렸습니다.',
        'auth/email-already-in-use': '이미 등록된 이메일입니다.',
        'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
        'auth/invalid-email': '이메일 형식이 올바르지 않습니다.',
      };
      console.log(err);
      
      setError(msgs[err.code] || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address) {
      setError('카페 이름과 주소는 필수입니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await updateStore(editStore.id, form);
      } else {
        await addStore({ ...form, ownerId: user.uid, ownerEmail: user.email });
      }
      setSuccess(true);
    } catch (err) {
      console.log(err);
      
      setError('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="store-form-page">
        <div className="store-form">
          <div className="store-form__success">
            <span className="emoji">🎉</span>
            <h3>{isEdit ? '재고가 업데이트되었어요!' : '매장이 등록되었어요!'}</h3>
            <p>이제 지도에서 두쫀쿠 위치를 확인할 수 있어요</p>
            <button onClick={() => navigate('/')}>지도로 돌아가기 🗺</button>
          </div>
        </div>
      </div>
    );
  }

  return (
		<div className="store-form-page">
			<div className="store-form">
				<div className="store-form__hero">
					<span className="store-form__hero-emoji">
						<img src="/images/logo_icon.png" alt="" width={120} />
					</span>
					<h1>{isEdit ? "재고 수정하기" : "매장 등록하기"}</h1>
					<p>두쫀쿠를 판매하는 카페를 지도에 등록해보세요</p>
				</div>

				{/* 비로그인 상태: 인증 폼 */}
				{!user && (
					<div className="store-form__auth">
						<h3>사장님 로그인</h3>
						<p>매장 등록/수정은 사장님 계정으로만 가능합니다</p>

						<div className="store-form__auth-tabs">
							<button
								className={authTab === "login" ? "active" : ""}
								onClick={() => setAuthTab("login")}
							>
								로그인
							</button>
							<button
								className={authTab === "register" ? "active" : ""}
								onClick={() => setAuthTab("register")}
							>
								회원가입
							</button>
						</div>

						{error && <div className="store-form__error">⚠️ {error}</div>}

						<div className="store-form__group">
							<label>이메일</label>
							<input
								className="store-form__input"
								type="email"
								placeholder="owner@example.com"
								value={authForm.email}
								onChange={(e) =>
									setAuthForm((p) => ({ ...p, email: e.target.value }))
								}
							/>
						</div>
						<div className="store-form__group">
							<label>비밀번호</label>
							<input
								className="store-form__input"
								type="password"
								placeholder="6자 이상 입력"
								value={authForm.password}
								onChange={(e) =>
									setAuthForm((p) => ({ ...p, password: e.target.value }))
								}
							/>
						</div>

						<button
							className="store-form__submit"
							onClick={handleAuth}
							disabled={loading}
						>
							{loading
								? "처리 중..."
								: authTab === "login"
									? "로그인"
									: "회원가입"}
						</button>
					</div>
				)}

				{/* 로그인된 사장님 전용: 매장 정보 폼 */}
				{user && (
					<>
						<div className="store-form__card">
							<h3 className="store-form__card-title">카페 정보</h3>

							{error && <div className="store-form__error">⚠️ {error}</div>}

							<div className="store-form__group">
								<label>카페 이름 *</label>
								<input
									className="store-form__input"
									type="text"
									placeholder="예) 두쫀쿠베이커리 홍대점"
									value={form.name}
									onChange={(e) =>
										setForm((p) => ({ ...p, name: e.target.value }))
									}
								/>
							</div>

							<div className="store-form__group">
								<label>주소 *</label>
								<input
									className="store-form__input"
									type="text"
									placeholder="예) 서울 마포구 홍익로 00"
									value={form.address}
									onChange={(e) =>
										setForm((p) => ({ ...p, address: e.target.value }))
									}
								/>
							</div>

							<div className="store-form__group">
								<label>전화번호</label>
								<input
									className="store-form__input"
									type="tel"
									placeholder="02-1234-5678"
									value={form.phone}
									onChange={(e) =>
										setForm((p) => ({ ...p, phone: e.target.value }))
									}
								/>
							</div>

							<div className="store-form__group">
								<label>영업시간</label>
								<input
									className="store-form__input"
									type="text"
									placeholder="예) 09:00 - 20:00 (연중무휴)"
									value={form.hours}
									onChange={(e) =>
										setForm((p) => ({ ...p, hours: e.target.value }))
									}
								/>
							</div>
						</div>

						<div className="store-form__divider" />

						<div className="store-form__card">
							<h3 className="store-form__card-title">두쫀쿠 재고</h3>

							<div className="store-form__stock-control">
								<button
									onClick={() =>
										setForm((p) => ({
											...p,
											duzzonCount: Math.max(0, p.duzzonCount - 1),
										}))
									}
									disabled={form.duzzonCount <= 0}
								>
									−
								</button>
								<div className="store-form__stock-control-display">
									<span className="number">{form.duzzonCount}</span>
									<span className="unit">개</span>
								</div>
								<button
									onClick={() =>
										setForm((p) => ({ ...p, duzzonCount: p.duzzonCount + 1 }))
									}
								>
									+
								</button>
							</div>
						</div>

						<div className="store-form__divider" />

						<div className="store-form__card">
							<h3 className="store-form__card-title">📍 지도에서 위치 선택</h3>
							<div className="store-form__map-preview">
								<div id="form-map" ref={mapRef} />
								<div className="store-form__map-preview-label">
									{form.lat
										? "✅ 위치 선택됨"
										: "지도를 클릭해 위치를 선택하세요"}
								</div>
							</div>
						</div>

						<button
							className="store-form__submit"
							onClick={handleSubmit}
							disabled={loading}
						>
							{loading
								? "저장 중..."
								: isEdit
									? "재고 업데이트"
									: "매장 등록하기"}
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default StoreForm;
