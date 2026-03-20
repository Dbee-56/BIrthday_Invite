import { useState, useEffect, useRef } from "react";

// Inline confetti — no external dep needed
function fireConfetti() {
  if (typeof window !== "undefined" && window.confetti) {
    window.confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
  }
}

export default function App() {
  const [stage, setStage] = useState("entry");
  const [flipped, setFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [imgIndex, setImgIndex] = useState(0);
  const audioRef = useRef(null);
  const [clicks, setClicks] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [failed, setFailed] = useState(false);

  const images = [
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
  ];

  const targetDate = new Date("March 24, 2026 20:30:00").getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = targetDate - now;
      if (distance < 0) {
        setTimeLeft("🎉 It's Party Time!");
        clearInterval(timer);
        return;
      }
      const d = Math.floor(distance / 86400000);
      const h = Math.floor((distance / 3600000) % 24);
      const m = Math.floor((distance / 60000) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setImgIndex((p) => (p + 1) % images.length),
      3000,
    );
    return () => clearInterval(interval);
  }, []);

  const handleTap = () => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    const newClicks = clicks + 1;
    setClicks(newClicks);

    if (newClicks >= 5) {
      const timeTaken = Date.now() - startTime;

      if (timeTaken <= 1000) {
        fireConfetti();
        setTimeout(() => setStage("invite"), 500);
      } else {
        // Fail
        setFailed(true);
        setTimeout(() => {
          setClicks(0);
          setStartTime(null);
          setFailed(false);
        }, 1200);
      }
    }
  };

  const startGame = () => {
    setStage("game");
    fireConfetti();

    setClicks(0);
    setStartTime(null);
    setFailed(false);

    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at 20% 50%, #2d1b69 0%, #11052c 40%, #1a0533 60%, #3d0a2e 100%);
          overflow-y: auto;
          padding: 20px 0;
        }

        /* Floating orbs */
        body::before, body::after {
          content: '';
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        body::before {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(180,40,255,0.18), transparent 70%);
          top: -100px; left: -100px;
          animation: drift1 8s ease-in-out infinite alternate;
        }
        body::after {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(255,60,130,0.15), transparent 70%);
          bottom: -80px; right: -80px;
          animation: drift2 10s ease-in-out infinite alternate;
        }
        @keyframes drift1 { from { transform: translate(0,0); } to { transform: translate(60px, 40px); } }
        @keyframes drift2 { from { transform: translate(0,0); } to { transform: translate(-50px, -30px); } }

        /* Entry */
        .entry-wrap {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .do-not-btn {
          padding: 18px 44px;
          background: linear-gradient(135deg, #ff2d87, #c026d3);
          border: none; border-radius: 100px;
          color: white;
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700;
          cursor: pointer;
          box-shadow: 0 0 40px rgba(255,45,135,0.5), 0 4px 24px rgba(0,0,0,0.4);
          animation: pulse-btn 1.6s ease-in-out infinite;
          transition: transform 0.15s;
        }
        .do-not-btn:hover { transform: scale(1.07); }
        @keyframes pulse-btn {
          0%, 100% { box-shadow: 0 0 40px rgba(255,45,135,0.5), 0 4px 24px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 70px rgba(255,45,135,0.8), 0 4px 32px rgba(0,0,0,0.5); }
        }
        .entry-hint { color: rgba(255,255,255,0.35); font-size: 13px; letter-spacing: 2px; text-transform: uppercase; }

        /* Game */
        .game-wrap { position: relative; z-index: 1; width: 100vw; height: 100vh; }
        .game-header { text-align: center; padding: 32px 0 8px; }
        .game-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px; color: white; margin-bottom: 8px;
        }
        .score-bar {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          color: rgba(255,255,255,0.6); font-size: 15px;
        }
        .score-dots { display: flex; gap: 6px; }
        .dot {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4);
          transition: all 0.3s;
        }
        .dot.filled { background: #ff2d87; border-color: #ff2d87; box-shadow: 0 0 10px #ff2d87; }
        .catch-btn {
          position: absolute;
          transform: translate(-50%, -50%);
          padding: 14px 28px;
          background: linear-gradient(135deg, #ffd700, #ff8c00);
          border: none; border-radius: 50px;
          color: #1a0000; font-weight: 700; font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(255,200,0,0.5);
          transition: transform 0.1s, box-shadow 0.1s;
          white-space: nowrap;
        }
        .catch-btn:hover { transform: translate(-50%, -50%) scale(1.1); }
        .catch-btn:active { transform: translate(-50%, -50%) scale(0.95); }

        /* Card */
        .card-scene {
          position: relative; z-index: 1;
          width: 360px;
          perspective: 1200px;
        }
        .card-flip {
          width: 100%; height: 640px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.85s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .card-flip.flipped { transform: rotateY(180deg); }

        .card-face {
          position: absolute; inset: 0;
          border-radius: 28px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
        }

        /* Front */
        .card-front {
          background: linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04));
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
        }
        .front-icon { font-size: 56px; animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .front-label {
          font-family: 'Playfair Display', serif;
          font-size: 26px; color: white; text-align: center;
        }
        .front-sub { color: rgba(255,255,255,0.45); font-size: 13px; letter-spacing: 2px; text-transform: uppercase; }

        /* Back */
        .card-back {
          transform: rotateY(180deg);
          background: linear-gradient(160deg, rgba(45,10,80,0.92), rgba(20,5,50,0.96));
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15);
          display: flex; flex-direction: column;
          padding: 0;
        }

        /* Image section */
        .card-image-wrap {
          position: relative;
          height: 180px;
          overflow: hidden;
          border-radius: 28px 28px 0 0;
          flex-shrink: 0;
        }
        .card-image {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: opacity 0.8s ease;
        }
        .card-image.hidden { opacity: 0; position: absolute; inset: 0; }
        .img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(20,5,50,0.7) 100%);
        }
        .card-title-overlay {
          position: absolute; bottom: 16px; left: 20px; right: 20px;
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 900;
          color: white;
          text-shadow: 0 2px 12px rgba(0,0,0,0.8);
        }

        /* Image dots */
        .img-dots {
          display: flex; gap: 6px;
          position: absolute; bottom: 10px; right: 16px;
        }
        .img-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transition: background 0.3s, transform 0.3s;
        }
        .img-dot.active { background: white; transform: scale(1.3); }

        /* Info section */
        .card-info {
          padding: 14px 20px;
          display: flex; flex-direction: column; gap: 7px;
          flex: 1;
        }
        .info-row {
          display: flex; align-items: center; gap: 12px;
          padding: 9px 12px;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .info-icon { font-size: 18px; flex-shrink: 0; }
        .info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.4); margin-bottom: 1px; }
        .info-value { font-size: 15px; font-weight: 500; color: white; }

        /* Countdown special */
        .countdown-row {
          background: linear-gradient(135deg, rgba(255,45,135,0.2), rgba(180,40,255,0.15));
          border-color: rgba(255,45,135,0.3);
        }
        .countdown-value {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          background: linear-gradient(135deg, #ff2d87, #c026d3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Buttons */
        .card-actions {
          padding: 0 20px 20px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .btn-rsvp {
          display: block;
          padding: 13px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 14px;
          color: white;
          font-weight: 600; font-size: 15px;
          text-align: center;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(34,197,94,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.5px;
        }
        .btn-rsvp:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(34,197,94,0.5); }
        .btn-location {
          display: block;
          padding: 13px;
          background: rgba(255,255,255,0.08);
          border-radius: 14px;
          color: rgba(255,255,255,0.85);
          font-weight: 500; font-size: 14px;
          text-align: center;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.15);
          transition: background 0.15s;
        }
        .btn-location:hover { background: rgba(255,255,255,0.14); }

        .tap-hint {
          text-align: center;
          margin-top: 12px;
          color: rgba(255,255,255,0.25);
          font-size: 12px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          position: relative; z-index: 1;
        }
        .memory-grid {
          display: grid;
          grid-template-columns: repeat(3, 100px); /* 3 columns */
          gap: 18px;
          justify-content: center;
          margin-top: 40px;
        }

        .memory-card {
          width: 100px;
          height: 100px;
        }

        .memory-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }

        .memory-card.flipped .memory-inner {
          transform: rotateY(180deg);
        }

        .memory-face {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Front (hidden side) */
        .memory-front {
          background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }

        /* Back (emoji side) */
        .memory-back {
          transform: rotateY(180deg);
          background: white;
          color: black;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }

        /* Hover effect */
        .memory-card:hover .memory-inner {
          transform: scale(1.05);
        }
      `}</style>

      <audio ref={audioRef} loop>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
      </audio>

      {/* ENTRY */}
      {stage === "entry" && (
        <div className="entry-wrap">
          <button className="do-not-btn" onClick={startGame}>
            🚫 DO NOT CLICK 🚫
          </button>
          <p className="entry-hint">seriously, don't</p>
        </div>
      )}

      {/* GAME */}
      {stage === "game" && (
        <div className="game-wrap">
          <div className="game-header">
            <h1 className="game-title">⚡ Tap Challenge</h1>

            <div className="score-bar">
              <span style={{ color: "rgba(255,255,255,0.5)" }}>
                Tap 5 times in 1 seconds
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60%",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <button
              onClick={handleTap}
              style={{
                padding: "20px 40px",
                borderRadius: "50px",
                border: "none",
                fontSize: "18px",
                fontWeight: "700",
                background: failed
                  ? "linear-gradient(135deg, #ff4d4d, #ff0000)"
                  : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "white",
                cursor: "pointer",
                boxShadow: "0 0 25px rgba(34,197,94,0.5)",
                transition: "all 0.2s",
              }}
            >
              {failed ? "Too Slow 😭" : "TAP FAST ⚡"}
            </button>

            <div style={{ fontSize: "18px", fontWeight: "600" }}>
              {clicks}/5
            </div>
          </div>
        </div>
      )}

      {/* INVITE */}
      {stage === "invite" && (
        <>
          <div className="card-scene">
            <div
              className={`card-flip${flipped ? " flipped" : ""}`}
              onClick={() => setFlipped((f) => !f)}
            >
              {/* FRONT */}
              <div className="card-face card-front">
                <div className="front-icon">🎉</div>
                <div className="front-label">You're Invited!</div>
                <div className="front-sub">Tap to reveal</div>
              </div>

              {/* BACK */}
              <div className="card-face card-back">
                {/* Image */}
                <div className="card-image-wrap">
                  {images.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt="party"
                      className={`card-image${i !== imgIndex ? " hidden" : ""}`}
                      style={i !== imgIndex ? {} : {}}
                    />
                  ))}
                  <div className="img-overlay" />
                  <div className="card-title-overlay">Dibyendu's Party 🎊</div>
                  <div className="img-dots">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className={`img-dot${i === imgIndex ? " active" : ""}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Info rows */}
                <div className="card-info">
                  <div className="info-row">
                    <span className="info-icon">📅</span>
                    <div>
                      <div className="info-label">Date</div>
                      <div className="info-value">Monday, 24 March 2026</div>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">⏰</span>
                    <div>
                      <div className="info-label">Time</div>
                      <div className="info-value">8:30 PM onwards</div>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">📍</span>
                    <div>
                      <div className="info-label">Venue</div>
                      <div className="info-value">Maize & Malt, Whitefield</div>
                    </div>
                  </div>
                  <div className="info-row countdown-row">
                    <span className="info-icon">⏳</span>
                    <div>
                      <div className="info-label">Starts in</div>
                      <div className="countdown-value">{timeLeft}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions">
                  <a
                    href="https://wa.me/918827216849?text=Yo%20I%20am%20coming%20🔥"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-rsvp"
                    onClick={(e) => e.stopPropagation()}
                  >
                    RSVP via WhatsApp 🚀
                  </a>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Maize+and+Malt+Whitefield"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-location"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📍 Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
          <p className="tap-hint">tap card to flip</p>
        </>
      )}
    </>
  );
}
