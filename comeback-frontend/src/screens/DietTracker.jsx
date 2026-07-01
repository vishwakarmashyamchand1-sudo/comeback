import React, { useState } from 'react';

export default function DietTracker({ navigateTo }) {
  const [showMealModal, setShowMealModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const openMealModal = () => setShowMealModal(true);
  const closeMealModal = () => setShowMealModal(false);

  const openPhotoAnalysis = () => {
    closeMealModal();
    setTimeout(() => setShowPhotoModal(true), 200);
  };
  const closePhotoModal = () => setShowPhotoModal(false);

  return (
    <div className="screen active" style={{ display: 'flex' }}>
      <div className="page-head" style={{ padding: '22px 22px 0 22px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div 
          className="back-btn" 
          onClick={() => navigateTo('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </div>
        <h2>Today's Nutrition</h2>
      </div>
      
      <div className="pad" style={{ paddingBottom: '120px' }}>
        <div className="card">
          <div className="nutri-score-row">
            <div className="nutri-score">
              <div className="ring">
                <div className="inner">78</div>
              </div>
              <div>
                <div className="lab" style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '13px' }}>Daily Nutrition Score</div>
                <div className="lab">Good — keep it up</div>
              </div>
            </div>
          </div>
          
          <div className="stat-row">
            <div className="stat-box">
              <div className="s-label"><span>Calories</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '64%' }}></div></div>
              <div className="s-value">1,540/2,400</div>
            </div>
            <div className="stat-box">
              <div className="s-label"><span>Protein</span></div>
              <div className="bar-track"><div className="bar-fill navy" style={{ width: '55%' }}></div></div>
              <div className="s-value">98/180g</div>
            </div>
          </div>
          
          <div className="stat-row" style={{ marginTop: '12px' }}>
            <div className="stat-box">
              <div className="s-label"><span>Carbs</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '48%' }}></div></div>
              <div className="s-value">120/250g</div>
            </div>
            <div className="stat-box">
              <div className="s-label"><span>Fat</span></div>
              <div className="bar-track"><div className="bar-fill navy" style={{ width: '70%' }}></div></div>
              <div className="s-value">56/80g</div>
            </div>
          </div>
          
          <div className="stat-row" style={{ marginTop: '12px' }}>
            <div className="stat-box">
              <div className="s-label"><span>Water</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '40%' }}></div></div>
              <div className="s-value">1.2/3 L</div>
            </div>
            <div className="stat-box" style={{ background: 'transparent' }}></div>
          </div>
        </div>

        <div className="meal-section">
          <div className="meal-head">
            <h4>🌅 Breakfast</h4>
            <div className="meal-add" style={{ cursor: 'pointer' }} onClick={openMealModal}>+ Add</div>
          </div>
          <div className="food-item">
            <div>
              <div className="f-name">Oats + Whey Protein</div>
              <div className="f-meta">420 kcal · 32g protein</div>
            </div>
            <span style={{ color: 'var(--lime)', fontWeight: 'bold' }}>✓</span>
          </div>
        </div>
        
        <div className="meal-section">
          <div className="meal-head">
            <h4>☀️ Lunch</h4>
            <div className="meal-add" style={{ cursor: 'pointer' }} onClick={openMealModal}>+ Add</div>
          </div>
          <div className="food-item">
            <div>
              <div className="f-name">Grilled Chicken Bowl</div>
              <div className="f-meta">560 kcal · 48g protein</div>
            </div>
            <span style={{ color: 'var(--lime)', fontWeight: 'bold' }}>✓</span>
          </div>
        </div>
        
        <div className="meal-section">
          <div className="meal-head">
            <h4>🌙 Dinner</h4>
            <div className="meal-add" style={{ cursor: 'pointer' }} onClick={openMealModal}>+ Add</div>
          </div>
          <div className="food-empty" style={{ cursor: 'pointer' }} onClick={openMealModal}>
            No meal logged yet
          </div>
        </div>
        
        <div className="meal-section">
          <div className="meal-head">
            <h4>🍎 Snacks</h4>
            <div className="meal-add" style={{ cursor: 'pointer' }} onClick={openMealModal}>+ Add</div>
          </div>
          <div className="food-item">
            <div>
              <div className="f-name">Greek Yogurt</div>
              <div className="f-meta">150 kcal · 14g protein</div>
            </div>
            <span style={{ color: 'var(--lime)', fontWeight: 'bold' }}>✓</span>
          </div>
        </div>

        <div className="section-title">Meal History</div>
        <div className="card">
          <div className="history-row">
            <div>
              <div className="d">Yesterday</div>
              <div className="m">4 meals logged · 2,310 kcal</div>
            </div>
            <div className="k">172g P</div>
          </div>
          <div className="history-row">
            <div>
              <div className="d">2 days ago</div>
              <div className="m">3 meals logged · 2,180 kcal</div>
            </div>
            <div className="k">160g P</div>
          </div>
          <div className="history-row">
            <div>
              <div className="d">3 days ago</div>
              <div className="m">4 meals logged · 2,420 kcal</div>
            </div>
            <div className="k">185g P</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <div className={`modal-overlay ${showMealModal ? 'active' : ''}`} id="meal-modal" onClick={closeMealModal} style={{ cursor: 'pointer' }}>
        <div className="modal-wrap">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ cursor: 'default' }}>
            <div className="modal-handle"></div>
            <h3 style={{ marginBottom: '16px' }}>Add Meal</h3>
            
            <div className="modal-option" style={{ cursor: 'pointer' }} onClick={() => { closeMealModal(); alert('Opening manual entry'); }}>
              <div className="ic">✏️</div>
              <div>
                <div className="t">Manual Entry</div>
                <div className="s">Type in food and macros</div>
              </div>
            </div>
            
            <div className="modal-option" style={{ cursor: 'pointer' }} onClick={openPhotoAnalysis}>
              <div className="ic">📸</div>
              <div>
                <div className="t">Photo Upload</div>
                <div className="s">AI Food Recognition from a photo</div>
              </div>
            </div>
            
            <div className="modal-option" style={{ cursor: 'pointer' }} onClick={() => { closeMealModal(); alert('Opening barcode scanner'); }}>
              <div className="ic">📊</div>
              <div>
                <div className="t">Barcode Scan</div>
                <div className="s">Scan packaged food</div>
              </div>
            </div>
            
            <button className="btn btn-ghost btn-block" style={{ marginTop: '8px' }} onClick={closeMealModal}>Cancel</button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay ${showPhotoModal ? 'active' : ''}`} id="photo-modal" onClick={closePhotoModal} style={{ cursor: 'pointer' }}>
        <div className="modal-wrap">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ cursor: 'default' }}>
            <div className="modal-handle"></div>
            <div style={{ height: '160px', borderRadius: '16px', background: 'linear-gradient(135deg,#EDEFE3,#dfe3c9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', marginBottom: '16px' }}>
              🍛
            </div>
            <h3>Chicken Rice Bowl</h3>
            <p className="muted" style={{ fontSize: '12.5px', margin: '4px 0 14px 0' }}>AI Confidence: 91% · Macro Breakdown</p>
            
            <div className="stat-row">
              <div className="stat-box" style={{ textAlign: 'center' }}>
                <div className="s-label" style={{ justifyContent: 'center' }}>CALORIES</div>
                <div style={{ fontWeight: 800, color: 'var(--navy)' }}>540</div>
              </div>
              <div className="stat-box" style={{ textAlign: 'center' }}>
                <div className="s-label" style={{ justifyContent: 'center' }}>PROTEIN</div>
                <div style={{ fontWeight: 800, color: 'var(--navy)' }}>38g</div>
              </div>
              <div className="stat-box" style={{ textAlign: 'center' }}>
                <div className="s-label" style={{ justifyContent: 'center' }}>CARBS</div>
                <div style={{ fontWeight: 800, color: 'var(--navy)' }}>62g</div>
              </div>
              <div className="stat-box" style={{ textAlign: 'center' }}>
                <div className="s-label" style={{ justifyContent: 'center' }}>FAT</div>
                <div style={{ fontWeight: 800, color: 'var(--navy)' }}>14g</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={closePhotoModal}>Edit</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { closePhotoModal(); alert('Meal saved'); }}>Accept & Save</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
