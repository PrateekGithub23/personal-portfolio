/**
 * ConfusionMatrix: MarketPulse's held-out confusion matrix, drawn from the recorded counts
 * (results/confusion_matrix.png: [[724, 24], [10, 23]]) rather than shown as a screenshot,
 * so the numbers are real text and the precision/recall arithmetic is visible.
 */
import styles from "./ConfusionMatrix.module.css";

const TN = 724;
const FP = 24;
const FN = 10;
const TP = 23;

export function ConfusionMatrix({ figure }: { figure?: string }) {
  const recall = TP / (TP + FN);
  const precision = TP / (TP + FP);
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className={styles.figNo}>{figure ? `Fig. ${figure}` : "Figure"}</span>
        <span>Held-out minutes, 9 unseen pump events</span>
      </figcaption>

      <div className={styles.body}>
        <table className={styles.matrix}>
          <caption className="visually-hidden">
            Confusion matrix: rows are the actual label, columns the prediction.
          </caption>
          <thead>
            <tr>
              <td />
              <th scope="col">Predicted normal</th>
              <th scope="col">Predicted pump</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Actual normal</th>
              <td>
                <span className={styles.n}>{TN}</span>
                <span className={styles.k}>true negatives</span>
              </td>
              <td>
                <span className={styles.n}>{FP}</span>
                <span className={styles.k}>false alarms</span>
              </td>
            </tr>
            <tr>
              <th scope="row">Actual pump</th>
              <td>
                <span className={styles.n}>{FN}</span>
                <span className={styles.k}>missed</span>
              </td>
              <td className={styles.hit}>
                <span className={styles.n}>{TP}</span>
                <span className={styles.k}>caught</span>
              </td>
            </tr>
          </tbody>
        </table>

        <dl className={styles.derived}>
          <div>
            <dt>Recall</dt>
            <dd>
              <span className={styles.big}>{pct(recall)}</span>
              <span className={styles.calc}>
                {TP} / ({TP} + {FN})
              </span>
            </dd>
          </div>
          <div>
            <dt>Precision</dt>
            <dd>
              <span className={styles.big}>{pct(precision)}</span>
              <span className={styles.calc}>
                {TP} / ({TP} + {FP})
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </figure>
  );
}
