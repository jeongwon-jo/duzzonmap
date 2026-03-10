// src/components/StorePopup/StorePopup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateStock, deleteStore, setClosedDate } from '../../firebase/stores';
import ConfirmModal from '../Modal/ConfirmModal';
import './StorePopup.scss';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']; // index = JS Date.getDay()
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // 월~일 순 표시

const getStockStatus = (count) => {
  if (count === 0) return { label: '품절', cls: 'soldout' };
  if (count <= 3) return { label: '마감임박', cls: 'low' };
  return { label: '구매가능', cls: 'available' };
};

const StorePopup = ({ store, onClose, user }) => {
  const navigate = useNavigate();
  const [localCount, setLocalCount] = useState(store?.duzzonCount ?? 0);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!store) return null;

  const isOwner = user && user.uid === store.ownerId;
  const isDirty = localCount !== store.duzzonCount;
  const status = getStockStatus(localCount);

  const today = new Date().toISOString().slice(0, 10);
  const isClosedToday = store.closedDate === today;

  const handleToggleClosed = async () => {
    await setClosedDate(store.id, isClosedToday ? null : today);
  };

  const handleSaveStock = async () => {
    setSaving(true);
    try {
      await updateStock(store.id, localCount);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStore(store.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
		<>
			<div className="popup-overlay active" onClick={onClose} />
			<div className="store-popup">
				<div className="store-popup__card">
					<div className="store-popup__handle">
						<div />
					</div>

					<div className="store-popup__header">
						<div className="store-popup__title-group">
							<h2 className="store-popup__name">{store.name}</h2>
							<p className="store-popup__address">{store.address}</p>
						</div>
						<button className="store-popup__close" onClick={onClose}>
							✕
						</button>
					</div>

					<div className="store-popup__stock">
						<div>
							<div className="store-popup__stock-label">두쫀쿠 남은 수량</div>
						</div>

						{isOwner ? (
							<div className="store-popup__stock-editor">
								<button
									className="stock-btn"
									onClick={() => setLocalCount((c) => Math.max(0, c - 1))}
									disabled={localCount <= 0}
								>
									−
								</button>
								<div className="store-popup__stock-value">
									<input
										className="count"
										type="number"
										min="0"
										value={localCount}
										onChange={(e) => {
											const val = parseInt(e.target.value, 10);
											setLocalCount(isNaN(val) ? 0 : Math.max(0, val));
										}}
									/>
									<span className="unit">개</span>
								</div>
								<button
									className="stock-btn"
									onClick={() => setLocalCount((c) => c + 1)}
								>
									+
								</button>
							</div>
						) : (
							<div className="store-popup__stock-value">
								<span className="count">{localCount}</span>
								<span className="unit">개</span>
							</div>
						)}

						{/* <span className={`store-popup__stock-badge ${status.cls}`}>
							{status.label}
						</span> */}
					</div>

					{isOwner && isDirty && (
						<div className="store-popup__save-bar">
							<button
								className="save-btn"
								onClick={handleSaveStock}
								disabled={saving}
							>
								{saving ? "저장 중..." : "재고 저장"}
							</button>
						</div>
					)}

					<div className="store-popup__info">
						<div className="store-popup__info-row">
							<span className="icon">📞</span>
							<span className="value">{store.phone || "정보 없음"}</span>
						</div>
						<div className="store-popup__info-row">
							<span className="icon">🕐</span>
							<div className="store-popup__info-schedule">
								<div className="store-popup__days">
									{store.operatingDays && store.operatingDays.length > 0 ? (
										DAY_ORDER.map((d) => (
											<span
												key={d}
												className={`store-popup__day ${store.operatingDays.includes(d) ? "active" : ""}`}
											>
												{DAY_LABELS[d]}
											</span>
										))
									) : (
										<span className="store-popup__day-all">매일</span>
									)}
								</div>
								{store.hours && (
									<span className="store-popup__info-hours">{store.hours}</span>
								)}
							</div>
						</div>
						{isClosedToday && (
							<div className="store-popup__info-row store-popup__info-row--closed">
								<span className="icon">🔴</span>
								<span className="value">오늘 마감</span>
							</div>
						)}
					</div>

					{isOwner && (
						<div className="store-popup__closed-bar">
							<button
								className={`closed-btn ${isClosedToday ? "active" : ""}`}
								onClick={handleToggleClosed}
							>
								{isClosedToday ? "🔴 오늘 마감 해제" : "🔒 오늘 가게 닫기"}
							</button>
						</div>
					)}

					<div className="store-popup__actions">
						{isOwner && (
							<>
								<button
									className="edit-btn"
									onClick={() => {
										onClose();
										navigate("/register", { state: { store } });
									}}
								>
									정보 수정
								</button>
								<button
									className="delete-btn"
									onClick={() => setConfirmDelete(true)}
								>
									매장 삭제
								</button>
							</>
						)}
						{!isOwner && (
							<button
								className="call-btn"
								onClick={() => window.open(`tel:${store.phone}`)}
							>
								전화하기
							</button>
						)}
					</div>
				</div>
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
		</>
	);
};

export default StorePopup;
