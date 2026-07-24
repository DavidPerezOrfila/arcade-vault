import Link from "next/link";
import { GAMES } from "@/app/data/games";
import { getScoresByGame } from "@/app/data/scores";

interface HallOfFamePageProps {
  searchParams: Promise<{ game?: string }>;
}

function formatDate(at: number): string {
  const d = new Date(at);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${mon}/${d.getFullYear()}`;
}

export default async function HallOfFame({ searchParams }: HallOfFamePageProps) {
  const sp = await searchParams;
  const activeId =
    sp.game && GAMES.some((g) => g.id === sp.game) ? sp.game : GAMES[0].id;
  const active = GAMES.find((g) => g.id === activeId) ?? GAMES[0];
  const rows = (await getScoresByGame(activeId)).slice(0, 12);

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className="hall-tabs">
        {GAMES.map((g) => (
          <Link
            key={g.id}
            href={{ pathname: "/salon", query: { game: g.id } }}
            className={`chip${activeId === g.id ? " active" : ""}`}
          >
            {g.title}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="hall-empty pixel neon-cyan">
          ▸ AÚN NO HAY PUNTUACIONES PARA {active.title.toUpperCase()}
        </div>
      ) : (
        <>
          <div className="podium">
            {rows[1] && (
              <div className="podium-slot silver">
                <div className="rank-num">02</div>
                <div className="name">{rows[1].name}</div>
                <div className="score">
                  {rows[1].score.toLocaleString("es-ES")}
                </div>
                <div className="date">{formatDate(rows[1].at)}</div>
              </div>
            )}
            {rows[0] && (
              <div className="podium-slot gold">
                <div
                  className="pixel"
                  style={{
                    fontSize: 9,
                    color: "var(--gold)",
                    letterSpacing: "0.18em",
                  }}
                >
                  CAMPEÓN
                </div>
                <div className="rank-num" style={{ fontSize: 36, marginTop: 4 }}>
                  01
                </div>
                <div className="name">{rows[0].name}</div>
                <div className="score" style={{ fontSize: 20 }}>
                  {rows[0].score.toLocaleString("es-ES")}
                </div>
                <div className="date">{formatDate(rows[0].at)}</div>
              </div>
            )}
            {rows[2] && (
              <div className="podium-slot bronze">
                <div className="rank-num">03</div>
                <div className="name">{rows[2].name}</div>
                <div className="score">
                  {rows[2].score.toLocaleString("es-ES")}
                </div>
                <div className="date">{formatDate(rows[2].at)}</div>
              </div>
            )}
          </div>

          <div className="hall-table">
            <div className="th">
              <div>RANGO</div>
              <div>JUGADOR</div>
              <div>PUNTUACIÓN</div>
              <div>FECHA</div>
            </div>
            {rows.map((r, i) => (
              <div
                key={`${r.name}-${r.at}-${i}`}
                className={`tr${i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : ""
                  }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="rk">#{String(i + 1).padStart(2, "0")}</div>
                <div className="pl">{r.name}</div>
                <div className="sc">{r.score.toLocaleString("es-ES")}</div>
                <div className="dt">{formatDate(r.at)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}
