/**
 * LeadTime: per-event view of MarketPulse's held-out results.
 *
 * One row per held-out pump event, on a shared axis of minutes after the announcement. The filled
 * mark is the model's first alert, the open ring is the local price peak. Data is transcribed from
 * data/processed/early_detection_results.csv (all 9 held-out events, none omitted).
 */
import styles from "./LeadTime.module.css";

interface EventRow {
  symbol: string;
  date: string;
  /** Minutes after the announcement; null = never alerted. */
  alert: number | null;
  peak: number;
}

const rows: EventRow[] = [
  { symbol: "ICN", date: "2018-09-19", alert: 0, peak: 6 },
  { symbol: "BRD", date: "2018-10-08", alert: 0, peak: 0 },
  { symbol: "EVX", date: "2018-11-07", alert: 0, peak: 0 },
  { symbol: "RDN", date: "2018-11-27", alert: 0, peak: 7 },
  { symbol: "BRD", date: "2018-12-30", alert: null, peak: 0 },
  { symbol: "RDN", date: "2019-05-10", alert: 0, peak: 0 },
  { symbol: "BRD", date: "2019-05-25", alert: null, peak: 1 },
  { symbol: "PPT", date: "2019-05-31", alert: 0, peak: 0 },
  { symbol: "BRD", date: "2019-10-03", alert: 1, peak: 1 },
];

const MAX = 8; // axis runs 0..8 minutes
const pos = (m: number) => `${(m / MAX) * 100}%`;

export function LeadTime({ figure }: { figure?: string }) {
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className={styles.figNo}>{figure ? `Fig. ${figure}` : "Figure"}</span>
        <span>First alert vs local price peak, minutes after the announcement</span>
      </figcaption>

      <div className={styles.legend} aria-hidden="true">
        <span>
          <i className={styles.alertDot} /> first alert
        </span>
        <span>
          <i className={styles.peakRing} /> price peak
        </span>
      </div>

      <table className={styles.table}>
        <caption className="visually-hidden">
          Nine held-out pump events. Seven were flagged at or before the local price peak, two with
          a lead of six and seven minutes. Two were not flagged.
        </caption>
        <thead className="visually-hidden">
          <tr>
            <th scope="col">Event</th>
            <th scope="col">Timeline</th>
            <th scope="col">Outcome</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const lead = r.alert === null ? null : r.peak - r.alert;
            return (
              <tr key={`${r.symbol}-${r.date}`}>
                <th scope="row" className={styles.label}>
                  {r.symbol}
                  <span>{r.date}</span>
                </th>
                <td className={styles.track}>
                  <span className={styles.lane} aria-hidden="true">
                    <span className={styles.axis} />
                    <span className={styles.peak} style={{ left: pos(r.peak) }} />
                    {r.alert !== null && (
                      <span className={styles.alert} style={{ left: pos(r.alert) }} />
                    )}
                  </span>
                  <span className="visually-hidden">
                    {r.alert === null
                      ? `No alert; peak at minute ${r.peak}.`
                      : `Alert at minute ${r.alert}, peak at minute ${r.peak}.`}
                  </span>
                </td>
                <td className={styles.outcome} data-miss={r.alert === null || undefined}>
                  {lead === null ? "not flagged" : lead > 0 ? `${lead} min lead` : "at peak"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot aria-hidden="true">
          <tr>
            <td />
            <td className={styles.track}>
              <span className={styles.ticks}>
                {Array.from({ length: MAX + 1 }, (_, m) => (
                  <span key={m} style={{ left: pos(m) }}>
                    {m}
                  </span>
                ))}
              </span>
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </figure>
  );
}
