/**
 * SystemMap: the homepage hero visual.
 *
 * Each project is a lane showing its real pipeline stages, with packets flowing left to right and
 * each stage lighting up as a packet passes. Every lane is a link to that project's case study, and
 * carries its strongest measured result, so the visual doubles as the "selected work" index.
 *
 * Implementation notes:
 * - Pure CSS animation, no client JavaScript. A packet sits inside a full-width "runner" that is
 *   translated from 0% to 100% of its own width, i.e. exactly across the track.
 * - Stage n of N is hit at fraction n/(N-1) of the trip; its pulse animation uses that as a
 *   negative-free delay so the highlight is synchronised with the packet.
 * - Two packets per lane, half a cycle apart, so stage pulses repeat every half cycle.
 * - prefers-reduced-motion: packets are removed and stages stay static.
 */
import Link from "next/link";
import { getProject } from "@/content/projects";
import { lanes } from "@/content/system-map";
import { projectHue } from "@/lib/hues";
import styles from "./SystemMap.module.css";

export function SystemMap() {
  return (
    <figure className={styles.map} aria-labelledby="map-cap">
      <figcaption id="map-cap" className={styles.caption}>
        <span className={styles.capTitle}>Selected work</span>
        <span className={styles.capNote}>Real pipeline stages · animated flow is illustrative</span>
      </figcaption>

      <ol className={styles.lanes}>
        {lanes.map((lane) => {
          const p = getProject(lane.slug);
          if (!p) return null;
          const metric = p.headline[0];
          const n = lane.stages.length;
          const half = lane.speed / 2;
          return (
            <li key={lane.slug}>
              <Link
                href={`/work/${p.slug}`}
                className={styles.lane}
                style={
                  {
                    "--hue": projectHue(p.slug),
                    "--speed": `${lane.speed}s`,
                    "--half": `${half}s`,
                  } as React.CSSProperties
                }
              >
                <span className={styles.head}>
                  <span className={styles.no}>{p.index}</span>
                  <span className={styles.title}>{p.title}</span>
                  <span className={styles.short}>{p.short}</span>
                </span>

                <span className={styles.track} aria-hidden="true">
                  <span className={styles.rail} />
                  <span className={styles.runner}>
                    <span className={styles.packet} />
                  </span>
                  <span className={styles.runner} style={{ animationDelay: `${half}s` }}>
                    <span className={styles.packet} />
                  </span>
                  {lane.stages.map((stage, i) => {
                    const at = i / (n - 1);
                    return (
                      <span
                        key={stage}
                        className={styles.stage}
                        data-end={i === 0 ? "start" : i === n - 1 ? "end" : undefined}
                        style={
                          {
                            left: `${at * 100}%`,
                            animationDelay: `${(at * lane.speed) % half}s`,
                          } as React.CSSProperties
                        }
                      >
                        <span className={styles.stageLabel}>{stage}</span>
                      </span>
                    );
                  })}
                </span>

                <span className={styles.metric}>
                  {metric ? (
                    <>
                      <strong>{metric.value}</strong> {metric.label}
                    </>
                  ) : (
                    <>{p.stack.slice(0, 3).join(" · ")}</>
                  )}
                </span>
                <span className="visually-hidden">Stages: {lane.stages.join(", ")}.</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
