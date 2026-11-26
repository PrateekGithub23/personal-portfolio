/**
 * BarChart: horizontal bars for a handful of recorded values.
 *
 * Server-rendered HTML (real text, readable by screen readers as a definition list). The bars grow
 * from zero when the chart scrolls into view: the wrapper carries `data-reveal`, RevealObserver adds
 * `data-visible`, and CSS transitions each bar's scaleX with a small stagger. Under reduced motion
 * the bars are simply drawn at full length.
 *
 * Colour: `--hue` (set by the caller, usually the project's hue) for highlighted rows; baseline rows
 * are drawn in a muted tone so before/after comparisons read at a glance.
 */
import type { Chart } from "@/content/charts";
import styles from "./BarChart.module.css";

interface Props {
  chart: Chart;
  hue: string;
  compact?: boolean;
}

export function BarChart({ chart, hue, compact = false }: Props) {
  return (
    <figure
      className={compact ? `${styles.chart} ${styles.compact}` : styles.chart}
      style={{ "--hue": hue } as React.CSSProperties}
      data-reveal
    >
      <figcaption className={styles.title}>
        {chart.title}
        {chart.lowerIsBetter && <span className={styles.dir}>lower is better</span>}
      </figcaption>
      <dl className={styles.rows}>
        {chart.rows.map((row, i) => (
          <div key={row.label} className={styles.row} data-tone={row.tone}>
            <dt className={styles.label}>{row.label}</dt>
            <dd className={styles.barCell}>
              {/* The track is the 0..max scale; the value label sits outside it so it never overflows. */}
              <span className={styles.track}>
                <span
                  className={styles.bar}
                  style={
                    {
                      "--w": `${Math.max((row.value / chart.max) * 100, row.value > 0 ? 1.5 : 0)}%`,
                      "--i": i,
                    } as React.CSSProperties
                  }
                />
              </span>
              <span className={styles.value}>{row.display}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className={styles.note}>{chart.note}</p>
    </figure>
  );
}
