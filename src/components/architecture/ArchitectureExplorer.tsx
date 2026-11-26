"use client";

/**
 * ArchitectureExplorer
 *
 * A selectable architecture diagram. Each component of a real system is a button; selecting one
 * shows its responsibility, technology, data flow, failure handling and trade-off underneath.
 *
 * How it is built, and why:
 * - Nodes are real HTML <button>s positioned over an SVG that only draws the connecting lines.
 *   Buttons give keyboard focus, screen-reader semantics and crisp text for free; SVG gives exact
 *   lines. Both share one coordinate system (the diagram's viewBox, converted to percentages).
 * - On narrow screens the same buttons are re-laid out by CSS as a vertical list in flow order and
 *   the SVG is hidden, so the diagram stays readable at 375px instead of shrinking to illegibility.
 * - Arrow keys move between components; Tab still works normally.
 * - The detail panel is an aria-live region, so the change is announced without moving focus.
 * - All motion is a short colour transition that drops to 0ms under prefers-reduced-motion.
 */
import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { ArchDiagram, ArchNode } from "@/content/types";
import styles from "./ArchitectureExplorer.module.css";

interface Props {
  diagram: ArchDiagram;
  /** Figure number shown in the caption, e.g. "2". */
  figure?: string;
}

export function ArchitectureExplorer({ diagram, figure }: Props) {
  const [selected, setSelected] = useState(diagram.initial);
  const buttons = useRef<Map<string, HTMLButtonElement>>(new Map());
  const panelId = useId();

  const node = diagram.nodes.find((n) => n.id === selected) ?? diagram.nodes[0]!;
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));

  /** Arrow keys step through components in their authored (flow) order and move focus with them. */
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next: number | undefined;
    if (delta !== undefined) next = (index + delta + diagram.nodes.length) % diagram.nodes.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = diagram.nodes.length - 1;
    if (next === undefined) return;

    e.preventDefault();
    const target = diagram.nodes[next]!;
    setSelected(target.id);
    buttons.current.get(target.id)?.focus();
  }

  // Percentages relative to the viewBox, so buttons and lines line up at any width.
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <figure className={styles.figure} aria-labelledby={`${panelId}-cap`}>
      <figcaption id={`${panelId}-cap`} className={styles.caption}>
        <span className={styles.figNo}>{figure ? `Fig. ${figure}` : "Figure"}</span>
        <span>{diagram.title}</span>
        <span className={styles.hint}>Select a component · arrow keys move</span>
      </figcaption>

      <div className={styles.plate}>
        <p className="visually-hidden">{diagram.summary}</p>

        <div
          className={styles.canvas}
          style={{ aspectRatio: `${diagram.width} / ${diagram.height}` }}
          role="group"
          aria-label={`${diagram.title}: components`}
        >
          {/* Lines only. Decorative for assistive tech: the summary above and the panel below carry the meaning. */}
          <svg
            className={styles.edges}
            viewBox={`0 0 ${diagram.width} ${diagram.height}`}
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <marker
                id={`${panelId}-arrow`}
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L8,4 L0,8 z" className={styles.arrowHead} />
              </marker>
              <marker
                id={`${panelId}-arrow-on`}
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L8,4 L0,8 z" className={styles.arrowHeadOn} />
              </marker>
            </defs>
            {diagram.edges.map((edge) => {
              const a = byId.get(edge.from);
              const b = byId.get(edge.to);
              if (!a || !b) return null;
              const [x1, y1, x2, y2] = connect(a, b);
              const on = edge.from === selected || edge.to === selected;
              return (
                <g key={`${edge.from}-${edge.to}`} className={on ? styles.edgeOn : styles.edge}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    strokeDasharray={edge.dashed ? "4 4" : undefined}
                    markerEnd={`url(#${panelId}-${on ? "arrow-on" : "arrow"})`}
                  />
                  {/* Only label edges long enough to hold the text without running under a node. */}
                  {edge.label && Math.hypot(x2 - x1, y2 - y1) > edge.label.length * 6.8 + 24 && (
                    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {diagram.nodes.map((n, i) => (
            <button
              key={n.id}
              type="button"
              ref={(el) => {
                if (el) buttons.current.set(n.id, el);
                else buttons.current.delete(n.id);
              }}
              className={styles.node}
              style={{
                left: pct(n.x, diagram.width),
                top: pct(n.y, diagram.height),
                width: pct(n.w, diagram.width),
                height: pct(n.h, diagram.height),
              }}
              aria-pressed={n.id === selected}
              aria-controls={panelId}
              onClick={() => setSelected(n.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className={styles.nodeLabel}>{n.label}</span>
              {n.sub && <span className={styles.nodeSub}>{n.sub}</span>}
            </button>
          ))}
        </div>

        <div id={panelId} className={styles.panel} aria-live="polite">
          <div className={styles.panelHead}>
            <p className={styles.panelKicker}>Component{node.sub ? ` · ${node.sub}` : ""}</p>
            <h3 className={styles.panelTitle}>{node.label}</h3>
            <p className={styles.panelRole}>{node.role}</p>
          </div>
          <dl className={styles.facts}>
            {node.tech && node.tech.length > 0 && (
              <Fact term="Technology" value={node.tech.join(" · ")} />
            )}
            {node.dataFlow && <Fact term="Data flow" value={node.dataFlow} />}
            {node.failure && <Fact term="Failure handling" value={node.failure} />}
            {node.tradeoff && <Fact term="Trade-off" value={node.tradeoff} />}
          </dl>
        </div>
      </div>
    </figure>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className={styles.fact}>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/**
 * Compute a line between two boxes that starts and ends on their borders (not their centres),
 * so arrowheads touch the box edge. Works by scaling the centre-to-centre vector until it exits
 * each rectangle.
 */
function connect(a: ArchNode, b: ArchNode): [number, number, number, number] {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const dx = bc.x - ac.x;
  const dy = bc.y - ac.y;

  // Fraction of the vector at which it leaves a w×h box centred on the start point.
  const exit = (w: number, h: number) => {
    const tx = dx === 0 ? Infinity : w / 2 / Math.abs(dx);
    const ty = dy === 0 ? Infinity : h / 2 / Math.abs(dy);
    return Math.min(tx, ty);
  };

  const gap = 4; // leave a little air between line and box
  const ta = exit(a.w + gap * 2, a.h + gap * 2);
  const tb = exit(b.w + gap * 2, b.h + gap * 2);
  return [ac.x + dx * ta, ac.y + dy * ta, bc.x - dx * tb, bc.y - dy * tb];
}
