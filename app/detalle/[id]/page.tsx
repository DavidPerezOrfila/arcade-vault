import Link from "next/link";
import { notFound } from "next/navigation";
import { GAMES } from "@/app/data/games";
import { getScoresByGame } from "@/app/data/scores";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

function formatDate(at: number): string {
  const d = new Date(at);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${mon}/${d.getFullYear()}`;
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) return notFound();

  const rows = (await getScoresByGame(id)).slice(0, 10);

  return (
    <div className="av-detail fade-in">
      <div>
        <div className="detail-cover">
          <div className={`cover-bg ${game.cover}`} />
        </div>
        <div className="detail-info" style={{ marginTop: 20 }}>
          <div className="detail-tags">
            <span>{game.cat}</span>
            <span>1 JUGADOR</span>
            <span>TECLADO / TÁCTIL</span>
            <span>RETRO 1985</span>
          </div>
          <h2 className="neon-cyan">{game.title}</h2>
          <p>{game.long}</p>
          <div className="stat-strip">
            <div>
              <div className="l">Partidas</div>
              <div className="v">{game.plays}</div>
            </div>
            <div>
              <div className="l">Mejor global</div>
              <div
                className="v"
                style={{
                  color: "var(--magenta)",
                  textShadow: "0 0 6px rgba(255,0,110,0.5)",
                }}
              >
                {game.best.toLocaleString("es-ES")}
              </div>
            </div>
            <div>
              <div className="l">Dificultad</div>
              <div
                className="v"
                style={{
                  color: "var(--yellow)",
                  textShadow: "0 0 6px rgba(245,255,0,0.5)",
                }}
              >
                ★ ★ ★ ☆ ☆
              </div>
            </div>
          </div>
          <div className="detail-actions">
            <Link href={`/player/${game.id}`} className="btn xl pulse">
              ▶ JUGAR AHORA
            </Link>
            <Link href="/" className="btn ghost lg">
              VOLVER AL VAULT
            </Link>
          </div>
        </div>
      </div>

      <aside>
        <div className="leaderboard">
          <h3>MEJORES PUNTUACIONES</h3>
          {rows.length === 0 ? (
            <div className="lb-empty pixel neon-cyan">
              ▸ AÚN NO HAY PUNTUACIONES
            </div>
          ) : (
            rows.map((r, i) => (
              <div
                key={`${r.name}-${r.at}-${i}`}
                className={`lb-row${i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : ""
                  }`}
              >
                <div className="rk">#{String(i + 1).padStart(2, "0")}</div>
                <div className="pl">
                  {r.name}
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--ink-faint)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {formatDate(r.at)}
                  </div>
                </div>
                <div className="sc">{r.score.toLocaleString("es-ES")}</div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
