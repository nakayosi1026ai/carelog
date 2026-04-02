import { useState, useEffect, useRef } from "react";

const STORAGE_KEYS = {
  MEALS: "dp-meals",
  HEALTH: "dp-health",
  PROFILE: "dp-profile",
};

// ─── Color Palette & Theme ───
const theme = {
  bg: "#F7F5F0",
  card: "#FFFFFF",
  cardAlt: "#FAFAF7",
  primary: "#2D6A4F",
  primaryLight: "#40916C",
  primaryPale: "#E8F5EE",
  accent: "#D4A373",
  accentLight: "#FAEDCD",
  danger: "#E63946",
  dangerLight: "#FFE0E3",
  warning: "#F4A261",
  warningLight: "#FFF3E0",
  text: "#1B1B1B",
  textSecondary: "#6B6B6B",
  textMuted: "#9B9B9B",
  border: "#E8E5DE",
  borderLight: "#F0EDE6",
};

// ─── Nutrition Database (common Japanese foods) ───
const FOOD_DB = [
  { name: "白ご飯 (1杯)", cal: 235, carb: 53, protein: 4, fat: 0.5, gi: "高" },
  { name: "玄米ご飯 (1杯)", cal: 228, carb: 48, protein: 5, fat: 1.8, gi: "低" },
  { name: "食パン (1枚)", cal: 158, carb: 28, protein: 5, fat: 2.5, gi: "高" },
  { name: "全粒粉パン (1枚)", cal: 140, carb: 24, protein: 6, fat: 2, gi: "低" },
  { name: "鶏むね肉 (100g)", cal: 108, carb: 0, protein: 23, fat: 1.5, gi: "-" },
  { name: "鮭 (1切れ)", cal: 133, carb: 0, protein: 22, fat: 4.5, gi: "-" },
  { name: "豆腐 (1丁)", cal: 72, carb: 2, protein: 7, fat: 4, gi: "低" },
  { name: "納豆 (1パック)", cal: 100, carb: 6, protein: 8, fat: 5, gi: "低" },
  { name: "味噌汁 (1杯)", cal: 40, carb: 5, protein: 3, fat: 1, gi: "低" },
  { name: "サラダ (1皿)", cal: 25, carb: 5, protein: 1, fat: 0.3, gi: "低" },
  { name: "卵 (1個)", cal: 91, carb: 0.3, protein: 7, fat: 7, gi: "-" },
  { name: "バナナ (1本)", cal: 86, carb: 22, protein: 1, fat: 0.2, gi: "中" },
  { name: "りんご (1個)", cal: 57, carb: 15, protein: 0.2, fat: 0.1, gi: "低" },
  { name: "ヨーグルト (100g)", cal: 62, carb: 5, protein: 4, fat: 3, gi: "低" },
  { name: "牛乳 (200ml)", cal: 134, carb: 10, protein: 7, fat: 8, gi: "低" },
  { name: "うどん (1玉)", cal: 270, carb: 56, protein: 7, fat: 1, gi: "高" },
  { name: "そば (1玉)", cal: 260, carb: 50, protein: 10, fat: 2, gi: "低" },
  { name: "さつまいも (中1本)", cal: 140, carb: 33, protein: 1.2, fat: 0.2, gi: "中" },
  { name: "ブロッコリー (100g)", cal: 33, carb: 5, protein: 4, fat: 0.4, gi: "低" },
  { name: "鶏もも肉 (100g)", cal: 200, carb: 0, protein: 16, fat: 14, gi: "-" },
];

const MEAL_TYPES = [
  { key: "breakfast", label: "朝食", icon: "🌅", time: "7:00" },
  { key: "lunch", label: "昼食", icon: "☀️", time: "12:00" },
  { key: "dinner", label: "夕食", icon: "🌙", time: "19:00" },
  { key: "snack", label: "間食", icon: "🍎", time: "" },
];

const TIPS = [
  { icon: "🥗", text: "食事の最初に野菜を食べると、血糖値の急上昇を抑えられます（ベジファースト）" },
  { icon: "🚶", text: "食後15〜30分のウォーキングが血糖値コントロールに効果的です" },
  { icon: "🌾", text: "白米を玄米や雑穀米に置き換えると、GI値を下げられます" },
  { icon: "💧", text: "水をこまめに飲むことで、血糖値の安定に役立ちます" },
  { icon: "😴", text: "睡眠不足はインスリン抵抗性を高めます。7〜8時間の睡眠を心がけましょう" },
  { icon: "🥜", text: "ナッツ類は低GIで良質な脂質を含み、間食におすすめです" },
  { icon: "🍵", text: "緑茶に含まれるカテキンは、血糖値の上昇を緩やかにする効果があります" },
  { icon: "⏰", text: "規則正しい食事時間が、血糖値の安定に繋がります" },
];

const formatDate = (d) => {
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const todayStr = () => new Date().toISOString().split("T")[0];

// ─── Main App ───
export default function App() {
  const [tab, setTab] = useState("home");
  const [meals, setMeals] = useState([]);
  const [healthData, setHealthData] = useState([]);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const m = await window.storage.get(STORAGE_KEYS.MEALS);
        if (m) setMeals(JSON.parse(m.value));
      } catch (e) {}
      try {
        const h = await window.storage.get(STORAGE_KEYS.HEALTH);
        if (h) setHealthData(JSON.parse(h.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  // Save meals
  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.MEALS, JSON.stringify(meals)).catch(() => {});
  }, [meals, loaded]);

  // Save health data
  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.HEALTH, JSON.stringify(healthData)).catch(() => {});
  }, [healthData, loaded]);

  // Rotate tips
  useEffect(() => {
    const iv = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 8000);
    return () => clearInterval(iv);
  }, []);

  const todayMeals = meals.filter((m) => m.date === todayStr());
  const todayCal = todayMeals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.cal, 0), 0);
  const todayCarb = todayMeals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.carb, 0), 0);
  const todayProtein = todayMeals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.protein, 0), 0);
  const todayFat = todayMeals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.fat, 0), 0);

  const latestHealth = healthData.length > 0 ? healthData[healthData.length - 1] : null;

  const addMeal = (meal) => {
    setMeals((prev) => [...prev, { ...meal, id: Date.now(), date: todayStr() }]);
    setShowMealModal(false);
  };

  const addHealthRecord = (record) => {
    setHealthData((prev) => [...prev, { ...record, id: Date.now(), date: todayStr() }]);
    setShowHealthModal(false);
  };

  const deleteMeal = (id) => setMeals((prev) => prev.filter((m) => m.id !== id));

  const styles = getStyles();

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={styles.logo}>🌿</span>
            <div>
              <h1 style={styles.title}>ケアログ</h1>
              <p style={styles.subtitle}>糖尿病予防サポート</p>
            </div>
          </div>
          <div style={styles.dateChip}>
            {new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={styles.main}>
        {tab === "home" && (
          <HomeTab
            todayCal={todayCal}
            todayCarb={todayCarb}
            todayProtein={todayProtein}
            todayFat={todayFat}
            todayMeals={todayMeals}
            latestHealth={latestHealth}
            tipIndex={tipIndex}
            onAddMeal={() => setShowMealModal(true)}
            onAddHealth={() => setShowHealthModal(true)}
            styles={styles}
          />
        )}
        {tab === "meals" && (
          <MealsTab
            meals={meals}
            onAdd={() => setShowMealModal(true)}
            onDelete={deleteMeal}
            styles={styles}
          />
        )}
        {tab === "health" && (
          <HealthTab
            healthData={healthData}
            onAdd={() => setShowHealthModal(true)}
            styles={styles}
          />
        )}
        {tab === "tips" && <TipsTab styles={styles} />}
      </main>

      {/* Modals */}
      {showMealModal && (
        <MealModal onSave={addMeal} onClose={() => setShowMealModal(false)} styles={styles} />
      )}
      {showHealthModal && (
        <HealthModal onSave={addHealthRecord} onClose={() => setShowHealthModal(false)} styles={styles} />
      )}

      {/* Bottom Nav */}
      <nav style={styles.nav}>
        {[
          { key: "home", icon: "🏠", label: "ホーム" },
          { key: "meals", icon: "🍽️", label: "食事記録" },
          { key: "health", icon: "📊", label: "健康データ" },
          { key: "tips", icon: "💡", label: "アドバイス" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...styles.navItem,
              color: tab === t.key ? theme.primary : theme.textMuted,
              fontWeight: tab === t.key ? 700 : 400,
            }}
          >
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 10, marginTop: 2 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── Home Tab ───
function HomeTab({ todayCal, todayCarb, todayProtein, todayFat, todayMeals, latestHealth, tipIndex, onAddMeal, onAddHealth, styles }) {
  const calTarget = 1800;
  const calPct = Math.min((todayCal / calTarget) * 100, 100);
  const tip = TIPS[tipIndex];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Tip Banner */}
      <div style={styles.tipBanner}>
        <span style={{ fontSize: 28 }}>{tip.icon}</span>
        <p style={styles.tipText}>{tip.text}</p>
      </div>

      {/* Calorie Ring */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>今日のカロリー</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "8px 0" }}>
          <CalorieRing pct={calPct} cal={todayCal} target={calTarget} />
          <div style={{ flex: 1 }}>
            <MacroBar label="炭水化物" value={todayCarb} max={250} unit="g" color={theme.warning} />
            <MacroBar label="タンパク質" value={todayProtein} max={80} unit="g" color={theme.primary} />
            <MacroBar label="脂質" value={todayFat} max={55} unit="g" color={theme.accent} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button style={styles.actionBtn} onClick={onAddMeal}>
          <span style={{ fontSize: 22 }}>🍽️</span>
          <span>食事を記録</span>
        </button>
        <button style={{ ...styles.actionBtn, background: theme.accentLight, borderColor: theme.accent }} onClick={onAddHealth}>
          <span style={{ fontSize: 22 }}>📊</span>
          <span>健康データ</span>
        </button>
      </div>

      {/* Today's meals summary */}
      {todayMeals.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>今日の食事</h3>
          {todayMeals.map((meal) => (
            <div key={meal.id} style={styles.mealSummaryRow}>
              <span>{MEAL_TYPES.find((t) => t.key === meal.type)?.icon} {MEAL_TYPES.find((t) => t.key === meal.type)?.label}</span>
              <span style={{ color: theme.textSecondary, fontSize: 13 }}>
                {meal.items.reduce((a, i) => a + i.cal, 0)} kcal
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Latest health data */}
      {latestHealth && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>最新の健康データ</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {latestHealth.bloodSugar && (
              <div style={styles.statChip}>
                <span style={styles.statLabel}>血糖値</span>
                <span style={styles.statValue}>{latestHealth.bloodSugar}</span>
                <span style={styles.statUnit}>mg/dL</span>
              </div>
            )}
            {latestHealth.weight && (
              <div style={styles.statChip}>
                <span style={styles.statLabel}>体重</span>
                <span style={styles.statValue}>{latestHealth.weight}</span>
                <span style={styles.statUnit}>kg</span>
              </div>
            )}
            {latestHealth.hba1c && (
              <div style={styles.statChip}>
                <span style={styles.statLabel}>HbA1c</span>
                <span style={styles.statValue}>{latestHealth.hba1c}</span>
                <span style={styles.statUnit}>%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Calorie Ring ───
function CalorieRing({ pct, cal, target }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct > 100 ? theme.danger : pct > 80 ? theme.warning : theme.primary;
  return (
    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke={theme.borderLight} strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>{cal}</span>
        <span style={{ fontSize: 10, color: theme.textMuted }}>/ {target} kcal</span>
      </div>
    </div>
  );
}

// ─── Macro Bar ───
function MacroBar({ label, value, max, unit, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: theme.textSecondary }}>{label}</span>
        <span style={{ fontWeight: 600, color: theme.text }}>{value}{unit}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: theme.borderLight }}>
        <div style={{
          height: "100%", borderRadius: 3, background: color, width: `${pct}%`,
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Meals Tab ───
function MealsTab({ meals, onAdd, onDelete, styles }) {
  const grouped = {};
  [...meals].reverse().forEach((m) => {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={styles.sectionTitle}>食事記録</h2>
        <button style={styles.addBtn} onClick={onAdd}>＋ 記録する</button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{ fontSize: 48 }}>🍽️</span>
          <p style={{ color: theme.textMuted, marginTop: 12 }}>まだ食事記録がありません</p>
          <button style={{ ...styles.addBtn, marginTop: 12 }} onClick={onAdd}>最初の食事を記録する</button>
        </div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p style={styles.dateLabel}>
              {date === todayStr() ? "今日" : formatDate(date)}
              <span style={{ fontWeight: 400, marginLeft: 8, color: theme.textMuted }}>
                合計 {items.reduce((s, m) => s + m.items.reduce((a, i) => a + i.cal, 0), 0)} kcal
              </span>
            </p>
            {items.map((meal) => {
              const mt = MEAL_TYPES.find((t) => t.key === meal.type);
              return (
                <div key={meal.id} style={styles.mealCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{mt?.icon} {mt?.label}</span>
                      <div style={{ marginTop: 6 }}>
                        {meal.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6 }}>
                            {item.name}
                            <span style={{ marginLeft: 6, color: theme.textMuted, fontSize: 11 }}>
                              {item.cal}kcal {item.gi !== "-" && `GI:${item.gi}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 700, color: theme.primary, fontSize: 14 }}>
                        {meal.items.reduce((a, i) => a + i.cal, 0)} kcal
                      </span>
                      <button
                        onClick={() => onDelete(meal.id)}
                        style={styles.deleteBtn}
                      >✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}

// ─── Health Tab ───
function HealthTab({ healthData, onAdd, styles }) {
  const reversed = [...healthData].reverse();
  const last7Weight = healthData.filter((d) => d.weight).slice(-7);
  const last7BS = healthData.filter((d) => d.bloodSugar).slice(-7);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={styles.sectionTitle}>健康データ</h2>
        <button style={styles.addBtn} onClick={onAdd}>＋ 記録する</button>
      </div>

      {/* Mini charts */}
      {last7Weight.length >= 2 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>体重の推移</h3>
          <MiniChart data={last7Weight.map((d) => ({ label: formatDate(d.date), value: d.weight }))} unit="kg" color={theme.primary} />
        </div>
      )}
      {last7BS.length >= 2 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>血糖値の推移</h3>
          <MiniChart data={last7BS.map((d) => ({ label: formatDate(d.date), value: d.bloodSugar }))} unit="mg/dL" color={theme.accent}
            dangerZone={140}
          />
        </div>
      )}

      {/* Records list */}
      {reversed.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{ fontSize: 48 }}>📊</span>
          <p style={{ color: theme.textMuted, marginTop: 12 }}>まだ記録がありません</p>
          <button style={{ ...styles.addBtn, marginTop: 12 }} onClick={onAdd}>最初のデータを記録する</button>
        </div>
      ) : (
        reversed.map((rec) => (
          <div key={rec.id} style={styles.mealCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: theme.textMuted }}>{formatDate(rec.date)}</span>
              <div style={{ display: "flex", gap: 16 }}>
                {rec.bloodSugar && (
                  <span style={{ fontSize: 13 }}>
                    血糖値: <strong style={{ color: rec.bloodSugar > 140 ? theme.danger : theme.primary }}>{rec.bloodSugar}</strong> mg/dL
                  </span>
                )}
                {rec.weight && <span style={{ fontSize: 13 }}>体重: <strong>{rec.weight}</strong> kg</span>}
                {rec.hba1c && <span style={{ fontSize: 13 }}>HbA1c: <strong style={{ color: rec.hba1c > 6.0 ? theme.danger : theme.primary }}>{rec.hba1c}</strong>%</span>}
              </div>
            </div>
            {rec.note && <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 6 }}>{rec.note}</p>}
          </div>
        ))
      )}
    </div>
  );
}

// ─── Mini Chart ───
function MiniChart({ data, unit, color, dangerZone }) {
  const values = data.map((d) => d.value);
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;
  const range = max - min || 1;
  const w = 100 / (data.length - 1);

  const points = data.map((d, i) => {
    const x = i * w;
    const y = 100 - ((d.value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  const dangerY = dangerZone ? 100 - ((dangerZone - min) / range) * 80 - 10 : null;

  return (
    <div style={{ padding: "8px 0" }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: 120 }} preserveAspectRatio="none">
        {dangerY != null && dangerY > 0 && dangerY < 100 && (
          <>
            <line x1="0" y1={dangerY} x2="100" y2={dangerY} stroke={theme.danger} strokeWidth="0.3" strokeDasharray="2,2" />
            <text x="1" y={dangerY - 1.5} fill={theme.danger} fontSize="4" fontFamily="sans-serif">{dangerZone}</text>
          </>
        )}
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = i * w;
          const y = 100 - ((d.value - min) / range) * 80 - 10;
          return <circle key={i} cx={x} cy={y} r="1.8" fill={color} />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px" }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: 10, color: theme.textMuted }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Tips Tab ───
function TipsTab({ styles }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={styles.sectionTitle}>予防のヒント</h2>
      <p style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.7, marginBottom: 4 }}>
        糖尿病予備軍の段階で生活習慣を改善すれば、発症リスクを大幅に減らすことができます。以下のアドバイスを日常に取り入れてみましょう。
      </p>
      {TIPS.map((tip, i) => (
        <div key={i} style={styles.tipCard}>
          <span style={{ fontSize: 32, flexShrink: 0 }}>{tip.icon}</span>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: theme.text, margin: 0 }}>{tip.text}</p>
        </div>
      ))}

      <div style={{ ...styles.card, background: theme.primaryPale, border: `1px solid ${theme.primaryLight}40` }}>
        <h3 style={{ ...styles.cardTitle, color: theme.primary }}>⚠️ 注意事項</h3>
        <p style={{ fontSize: 12, lineHeight: 1.7, color: theme.textSecondary, margin: 0 }}>
          このアプリは一般的な健康管理の参考情報を提供するものであり、医療アドバイスではありません。
          具体的な治療や食事療法については、必ず医師や管理栄養士にご相談ください。
        </p>
      </div>
    </div>
  );
}

// ─── Meal Modal ───
function MealModal({ onSave, onClose, styles }) {
  const [mealType, setMealType] = useState("breakfast");
  const [selectedItems, setSelectedItems] = useState([]);
  const [search, setSearch] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCal, setCustomCal] = useState("");
  const [customCarb, setCustomCarb] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customFat, setCustomFat] = useState("");

  const filtered = FOOD_DB.filter((f) => f.name.includes(search));

  const addItem = (food) => setSelectedItems((prev) => [...prev, { ...food }]);
  const removeItem = (idx) => setSelectedItems((prev) => prev.filter((_, i) => i !== idx));

  const addCustom = () => {
    if (!customName || !customCal) return;
    addItem({
      name: customName,
      cal: Number(customCal),
      carb: Number(customCarb) || 0,
      protein: Number(customProtein) || 0,
      fat: Number(customFat) || 0,
      gi: "-",
    });
    setCustomName(""); setCustomCal(""); setCustomCarb(""); setCustomProtein(""); setCustomFat("");
    setCustomMode(false);
  };

  const save = () => {
    if (selectedItems.length === 0) return;
    onSave({ type: mealType, items: selectedItems });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>食事を記録</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Meal type selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {MEAL_TYPES.map((mt) => (
            <button
              key={mt.key}
              onClick={() => setMealType(mt.key)}
              style={{
                ...styles.chipBtn,
                background: mealType === mt.key ? theme.primary : theme.cardAlt,
                color: mealType === mt.key ? "#fff" : theme.text,
              }}
            >
              {mt.icon} {mt.label}
            </button>
          ))}
        </div>

        {/* Selected items */}
        {selectedItems.length > 0 && (
          <div style={{ marginBottom: 12, padding: 12, background: theme.primaryPale, borderRadius: 10 }}>
            {selectedItems.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", fontSize: 13 }}>
                <span>{item.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: theme.textMuted }}>{item.cal} kcal</span>
                  <button onClick={() => removeItem(idx)} style={{ ...styles.deleteBtn, fontSize: 11 }}>✕</button>
                </div>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${theme.primary}30`, marginTop: 8, paddingTop: 8, fontSize: 14, fontWeight: 700, textAlign: "right", color: theme.primary }}>
              合計: {selectedItems.reduce((a, i) => a + i.cal, 0)} kcal
            </div>
          </div>
        )}

        {/* Search / Custom toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            placeholder="食品を検索..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCustomMode(false); }}
            style={styles.input}
          />
          <button onClick={() => setCustomMode(!customMode)} style={{ ...styles.chipBtn, fontSize: 12, whiteSpace: "nowrap" }}>
            {customMode ? "一覧" : "手入力"}
          </button>
        </div>

        {/* Custom input */}
        {customMode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <input placeholder="食品名" value={customName} onChange={(e) => setCustomName(e.target.value)} style={styles.input} />
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="カロリー" type="number" value={customCal} onChange={(e) => setCustomCal(e.target.value)} style={{ ...styles.input, flex: 1 }} />
              <input placeholder="炭水化物(g)" type="number" value={customCarb} onChange={(e) => setCustomCarb(e.target.value)} style={{ ...styles.input, flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="タンパク質(g)" type="number" value={customProtein} onChange={(e) => setCustomProtein(e.target.value)} style={{ ...styles.input, flex: 1 }} />
              <input placeholder="脂質(g)" type="number" value={customFat} onChange={(e) => setCustomFat(e.target.value)} style={{ ...styles.input, flex: 1 }} />
            </div>
            <button onClick={addCustom} style={styles.addBtn}>追加する</button>
          </div>
        ) : (
          <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12 }}>
            {filtered.map((food, i) => (
              <button key={i} onClick={() => addItem(food)} style={styles.foodItem}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{food.name}</span>
                  <span style={{
                    marginLeft: 8, fontSize: 10, padding: "1px 6px", borderRadius: 4,
                    background: food.gi === "低" ? theme.primaryPale : food.gi === "高" ? theme.dangerLight : food.gi === "中" ? theme.warningLight : "transparent",
                    color: food.gi === "低" ? theme.primary : food.gi === "高" ? theme.danger : food.gi === "中" ? theme.warning : "transparent",
                  }}>
                    {food.gi !== "-" && `GI:${food.gi}`}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: theme.textMuted }}>{food.cal} kcal</span>
              </button>
            ))}
          </div>
        )}

        {/* Save */}
        <button
          onClick={save}
          disabled={selectedItems.length === 0}
          style={{
            ...styles.saveBtn,
            opacity: selectedItems.length === 0 ? 0.5 : 1,
          }}
        >
          記録する
        </button>
      </div>
    </div>
  );
}

// ─── Health Modal ───
function HealthModal({ onSave, onClose, styles }) {
  const [bloodSugar, setBloodSugar] = useState("");
  const [weight, setWeight] = useState("");
  const [hba1c, setHba1c] = useState("");
  const [note, setNote] = useState("");

  const save = () => {
    if (!bloodSugar && !weight && !hba1c) return;
    onSave({
      bloodSugar: bloodSugar ? Number(bloodSugar) : null,
      weight: weight ? Number(weight) : null,
      hba1c: hba1c ? Number(hba1c) : null,
      note,
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>健康データを記録</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={styles.label}>血糖値 (mg/dL)</label>
            <input type="number" placeholder="例: 110" value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} style={styles.input} />
            {bloodSugar && Number(bloodSugar) >= 140 && (
              <p style={{ fontSize: 11, color: theme.danger, marginTop: 4 }}>⚠️ 140mg/dL以上は要注意です。医師にご相談ください。</p>
            )}
          </div>
          <div>
            <label style={styles.label}>体重 (kg)</label>
            <input type="number" step="0.1" placeholder="例: 65.0" value={weight} onChange={(e) => setWeight(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>HbA1c (%)</label>
            <input type="number" step="0.1" placeholder="例: 5.8" value={hba1c} onChange={(e) => setHba1c(e.target.value)} style={styles.input} />
            {hba1c && Number(hba1c) >= 6.0 && (
              <p style={{ fontSize: 11, color: theme.danger, marginTop: 4 }}>⚠️ 6.0%以上は糖尿病予備軍の基準値です。</p>
            )}
          </div>
          <div>
            <label style={styles.label}>メモ</label>
            <input placeholder="体調や気になることなど" value={note} onChange={(e) => setNote(e.target.value)} style={styles.input} />
          </div>
        </div>

        <button
          onClick={save}
          disabled={!bloodSugar && !weight && !hba1c}
          style={{
            ...styles.saveBtn,
            marginTop: 20,
            opacity: !bloodSugar && !weight && !hba1c ? 0.5 : 1,
          }}
        >
          記録する
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───
function getStyles() {
  return {
    app: {
      fontFamily: "'DM Sans', 'Noto Sans JP', 'Hiragino Sans', sans-serif",
      background: theme.bg,
      minHeight: "100vh",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
      color: theme.text,
      paddingBottom: 80,
    },
    header: {
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryLight})`,
      padding: "16px 20px 14px",
      position: "sticky",
      top: 0,
      zIndex: 10,
    },
    headerInner: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
    },
    logo: { fontSize: 28 },
    title: {
      margin: 0, fontSize: 20, fontWeight: 800, color: "#fff",
      letterSpacing: -0.5,
    },
    subtitle: { margin: 0, fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 400, marginTop: 1 },
    dateChip: {
      background: "rgba(255,255,255,0.2)",
      color: "#fff",
      fontSize: 12,
      padding: "5px 12px",
      borderRadius: 20,
      fontWeight: 500,
    },
    main: { padding: "16px 16px 24px" },
    nav: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 430,
      background: "#fff",
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 0 12px",
      borderTop: `1px solid ${theme.border}`,
      zIndex: 10,
    },
    navItem: {
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
      fontFamily: "inherit", transition: "color 0.2s",
    },
    card: {
      background: theme.card,
      borderRadius: 14,
      padding: 16,
      border: `1px solid ${theme.border}`,
    },
    cardTitle: {
      fontSize: 14, fontWeight: 700, margin: "0 0 10px 0", color: theme.text,
    },
    sectionTitle: {
      fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.3,
    },
    tipBanner: {
      background: `linear-gradient(135deg, ${theme.accentLight}, #FFF8F0)`,
      borderRadius: 14,
      padding: 16,
      display: "flex",
      gap: 12,
      alignItems: "start",
      border: `1px solid ${theme.accent}30`,
    },
    tipText: {
      fontSize: 13, lineHeight: 1.7, color: theme.text, margin: 0, fontWeight: 400,
    },
    actionBtn: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      padding: "16px 12px",
      borderRadius: 14,
      border: `1px solid ${theme.primary}30`,
      background: theme.primaryPale,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      color: theme.primary,
      fontFamily: "inherit",
      transition: "transform 0.15s",
    },
    mealSummaryRow: {
      display: "flex", justifyContent: "space-between", padding: "6px 0",
      fontSize: 14, borderBottom: `1px solid ${theme.borderLight}`,
    },
    statChip: {
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "10px 16px", background: theme.cardAlt, borderRadius: 10,
      border: `1px solid ${theme.borderLight}`, flex: 1, minWidth: 80,
    },
    statLabel: { fontSize: 10, color: theme.textMuted, marginBottom: 4 },
    statValue: { fontSize: 22, fontWeight: 800, color: theme.primary },
    statUnit: { fontSize: 10, color: theme.textMuted, marginTop: 2 },
    addBtn: {
      padding: "8px 16px",
      borderRadius: 10,
      border: "none",
      background: theme.primary,
      color: "#fff",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
    },
    dateLabel: {
      fontSize: 14, fontWeight: 700, color: theme.text, margin: "0 0 8px 2px",
    },
    mealCard: {
      background: theme.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      border: `1px solid ${theme.border}`,
    },
    deleteBtn: {
      background: "none", border: "none", color: theme.textMuted, cursor: "pointer",
      fontSize: 14, padding: "2px 6px", borderRadius: 4,
    },
    emptyState: {
      textAlign: "center", padding: "48px 20px",
    },
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 100,
    },
    modal: {
      background: theme.card,
      borderRadius: "20px 20px 0 0",
      padding: "20px 20px 32px",
      width: "100%",
      maxWidth: 430,
      maxHeight: "85vh",
      overflowY: "auto",
    },
    closeBtn: {
      background: theme.cardAlt, border: "none", width: 32, height: 32,
      borderRadius: "50%", cursor: "pointer", fontSize: 16, color: theme.textSecondary,
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    chipBtn: {
      padding: "7px 14px",
      borderRadius: 20,
      border: `1px solid ${theme.border}`,
      background: theme.cardAlt,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 500,
      fontFamily: "inherit",
      transition: "all 0.15s",
    },
    input: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: 10,
      border: `1px solid ${theme.border}`,
      fontSize: 14,
      fontFamily: "inherit",
      outline: "none",
      boxSizing: "border-box",
      background: theme.cardAlt,
    },
    label: {
      fontSize: 12, fontWeight: 600, color: theme.textSecondary, marginBottom: 4, display: "block",
    },
    foodItem: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 12px", width: "100%", border: "none",
      borderBottom: `1px solid ${theme.borderLight}`,
      background: "transparent", cursor: "pointer", fontFamily: "inherit",
      textAlign: "left", transition: "background 0.15s",
    },
    saveBtn: {
      width: "100%",
      padding: "14px",
      borderRadius: 12,
      border: "none",
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryLight})`,
      color: "#fff",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit",
      marginTop: 8,
    },
    tipCard: {
      display: "flex", gap: 14, alignItems: "start",
      padding: 16, background: theme.card, borderRadius: 14,
      border: `1px solid ${theme.border}`,
    },
  };
}
