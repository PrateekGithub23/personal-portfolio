/**
 * Line drawings for the personal page. Plain geometry drawn to real proportions, deliberately
 * quiet: a thin-line plan view, not an illustration.
 *
 * Cricket: the pitch is 22 yards (20.12 m) between the stumps and 3.05 m wide; the popping crease
 * is 1.22 m in front of the stumps. Tennis: a doubles court is 23.77 m × 10.97 m; singles width
 * 8.23 m; service line 6.40 m from the net.
 * Units in both viewBoxes are centimetres, so the numbers above appear directly in the code.
 */

export function CricketPitch({ className }: { className?: string }) {
  // Pitch drawn horizontally: length on x, width on y. Margin of 150 cm around it.
  const L = 2012; // stumps to stumps
  const W = 305;
  const pop = 122; // popping crease in front of stumps
  const m = 260;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${L + m * 2} ${W + 300}`}
      role="img"
      aria-label="Plan view of a cricket pitch with creases and stumps at each end."
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke">
        {/* pitch rectangle */}
        <rect x={m - pop} y={150} width={L + pop * 2} height={W} />
        {[m, m + L].map((x, i) => {
          const popX = i === 0 ? x + pop : x - pop;
          return (
            <g key={x}>
              {/* bowling crease (through the stumps) and popping crease, which runs past the pitch edge */}
              <line x1={x} y1={150 + 23} x2={x} y2={150 + W - 23} />
              <line x1={popX} y1={70} x2={popX} y2={150 + W + 80} />
              {/* return creases */}
              <line x1={x} y1={150 + 23} x2={popX} y2={150 + 23} />
              <line x1={x} y1={150 + W - 23} x2={popX} y2={150 + W - 23} />
            </g>
          );
        })}
      </g>
      {/* stumps: three dots at each end */}
      {[m, m + L].map((x) =>
        [-11, 0, 11].map((dy) => (
          <circle key={`${x}${dy}`} cx={x} cy={150 + W / 2 + dy} r="7" fill="currentColor" />
        )),
      )}
    </svg>
  );
}

export function TennisCourt({ className }: { className?: string }) {
  const L = 2377;
  const W = 1097;
  const singles = (W - 823) / 2; // alley width
  const service = 640; // service line distance from net
  const m = 120;
  const half = L / 2;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${L + m * 2} ${W + m * 2}`}
      role="img"
      aria-label="Plan view of a tennis court showing doubles and singles lines, service boxes and the net."
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        transform={`translate(${m} ${m})`}
      >
        <rect x={0} y={0} width={L} height={W} />
        <line x1={0} y1={singles} x2={L} y2={singles} />
        <line x1={0} y1={W - singles} x2={L} y2={W - singles} />
        <line x1={half - service} y1={singles} x2={half - service} y2={W - singles} />
        <line x1={half + service} y1={singles} x2={half + service} y2={W - singles} />
        <line x1={half - service} y1={W / 2} x2={half + service} y2={W / 2} />
        {/* centre marks */}
        <line x1={0} y1={W / 2} x2={20} y2={W / 2} />
        <line x1={L - 20} y1={W / 2} x2={L} y2={W / 2} />
      </g>
      {/* the net, dotted and extending past the court */}
      <line
        x1={m + half}
        y1={m - 60}
        x2={m + half}
        y2={m + W + 60}
        stroke="currentColor"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        strokeDasharray="1 3"
      />
    </svg>
  );
}
