import Link from "next/link";
import { seededScores } from "@/app/data/players";

// ponytail: seed fijo → mismos nombres y mismos números cada render, igual
// que el prototipo. Hasta que haya ≥5 jugadores reales sustituimos la lista
// por `getScores()`.
const SEED = 20260724;

export default function TopPlayersToday() {
  const rows = seededScores(SEED, 5);

  return (
    <div className="activity-card">
      <div className="ac-head">
        <div className="ac-title pixel neon-magenta">
          ▸ TOP JUGADORES · HOY
        </div>
        <Link href="/salon" className="lb-link">
          VER SALÓN →
        </Link>
      </div>
      <div className="top-list">
        {rows.map((r, i) => (
          <div
            key={`${r.name}-${i}`}
            className={`top-row${i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : ""}`}
          >
            <span className="tp-rk">#{String(r.rank).padStart(2, "0")}</span>
            <span className="tp-bar">
              <span
                className="tp-fill"
                style={{ width: `${100 - i * 16}%` }}
              />
            </span>
            <span className="tp-p">{r.name}</span>
            <span className="tp-s">{r.score.toLocaleString("es-ES")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
