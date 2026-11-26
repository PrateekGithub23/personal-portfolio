/**
 * Plan-view drawings for the personal page, drawn to real proportions, with a small animation:
 *   Cricket: a delivery from the bowler's end that pitches short of the batter and carries on to
 *            the stumps (the ball grows/shrinks slightly to suggest height).
 *   Tennis:  a cross-court rally: serve, bounce in the service box, return, bounce deep.
 *
 * Geometry (units are centimetres): cricket pitch 20.12 m between the stumps, 3.05 m wide, popping
 * crease 1.22 m in front of the stumps; tennis doubles court 23.77 × 10.97 m, singles 8.23 m wide,
 * service line 6.40 m from the net.
 *
 * Motion is CSS keyframes on transform/opacity only (see Drawings.module.css); it is switched off
 * under prefers-reduced-motion, leaving a still drawing with the ball at rest.
 */
import styles from "./Drawings.module.css";

export function CricketPitch({ className }: { className?: string }) {
  const L = 2012; // stumps to stumps
  const W = 305;
  const pop = 122;
  const m = 260;
  const cy = 150 + W / 2;
  return (
    <svg
      className={`${styles.drawing} ${className ?? ""}`}
      viewBox={`0 0 ${L + m * 2} ${W + 300}`}
      role="img"
      aria-label="Plan view of a cricket pitch. A ball is bowled from one end, pitches, and carries to the stumps at the other."
    >
      {/* the square around the pitch */}
      <rect
        className={styles.turf}
        x={m - pop - 90}
        y={60}
        width={L + pop * 2 + 180}
        height={W + 180}
        rx={30}
      />
      <g className={styles.lines}>
        <rect x={m - pop} y={150} width={L + pop * 2} height={W} />
        {[m, m + L].map((x, i) => {
          const popX = i === 0 ? x + pop : x - pop;
          return (
            <g key={x}>
              <line x1={x} y1={150 + 23} x2={x} y2={150 + W - 23} />
              <line x1={popX} y1={90} x2={popX} y2={150 + W + 60} />
              <line x1={x} y1={150 + 23} x2={popX} y2={150 + 23} />
              <line x1={x} y1={150 + W - 23} x2={popX} y2={150 + W - 23} />
            </g>
          );
        })}
      </g>
      {[m, m + L].map((x) =>
        [-11, 0, 11].map((dy) => (
          <circle key={`${x}${dy}`} className={styles.stump} cx={x} cy={cy + dy} r="7" />
        )),
      )}
      {/* where the ball pitches: flashes as the ball lands */}
      <circle className={`${styles.mark} ${styles.cricketMark}`} cx={m + 560} cy={cy} r="16" />
      {/* the ball: drawn at the origin and moved by CSS in viewBox units */}
      <circle className={`${styles.ball} ${styles.cricketBall}`} cx={0} cy={0} r="13" />
    </svg>
  );
}

export function TennisCourt({ className }: { className?: string }) {
  const L = 2377;
  const W = 1097;
  const singles = (W - 823) / 2;
  const service = 640;
  const m = 120;
  const half = L / 2;
  return (
    <svg
      className={`${styles.drawing} ${className ?? ""}`}
      viewBox={`0 0 ${L + m * 2} ${W + m * 2}`}
      role="img"
      aria-label="Plan view of a tennis court. A ball travels cross-court in a rally, bouncing in the service box and deep in the court."
    >
      <rect className={styles.turf} x={m} y={m} width={L} height={W} />
      <g className={styles.lines} transform={`translate(${m} ${m})`}>
        <rect x={0} y={0} width={L} height={W} />
        <line x1={0} y1={singles} x2={L} y2={singles} />
        <line x1={0} y1={W - singles} x2={L} y2={W - singles} />
        <line x1={half - service} y1={singles} x2={half - service} y2={W - singles} />
        <line x1={half + service} y1={singles} x2={half + service} y2={W - singles} />
        <line x1={half - service} y1={W / 2} x2={half + service} y2={W / 2} />
        <line x1={0} y1={W / 2} x2={20} y2={W / 2} />
        <line x1={L - 20} y1={W / 2} x2={L} y2={W / 2} />
      </g>
      <line className={styles.net} x1={m + half} y1={m - 60} x2={m + half} y2={m + W + 60} />
      {/* bounce marks for the two landings in the rally */}
      <circle
        className={`${styles.mark} ${styles.tennisMark1}`}
        cx={m + half - 420}
        cy={m + 800}
        r="22"
      />
      <circle
        className={`${styles.mark} ${styles.tennisMark2}`}
        cx={m + half + 900}
        cy={m + 300}
        r="22"
      />
      <circle className={`${styles.ball} ${styles.tennisBall}`} cx={0} cy={0} r="20" />
    </svg>
  );
}
