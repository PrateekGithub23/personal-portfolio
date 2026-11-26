"use client";

/**
 * ClaimTrace: "Fig. 1, trace one claim".
 *
 * The site's signature interaction. A visitor picks a sentence that TraceLayer's integrity engine
 * was tested on and sees, from the recorded run, which check decided it, the verdict, the engine's
 * exact reason, and whether that verdict blocks approval. One of the options is a case the engine
 * got wrong, on purpose: the figure shows the evaluation, not a highlight reel.
 *
 * Accessibility: the claims are a native radio group (Tab to enter, arrow keys to move, no custom
 * key handling needed). The result is an aria-live region. No animation beyond colour changes.
 */
import { useId, useState } from "react";
import {
  BLOCKS_APPROVAL,
  VERDICT_LABEL,
  heldoutSummary,
  stages,
  traceCases,
} from "@/content/claim-trace";
import styles from "./ClaimTrace.module.css";

interface Props {
  figure?: string;
  /** Compact = homepage version (fewer explanatory lines). */
  compact?: boolean;
}

export function ClaimTrace({ figure = "1", compact = false }: Props) {
  const [id, setId] = useState(traceCases[0]!.id);
  const name = useId();
  const current = traceCases.find((c) => c.id === id) ?? traceCases[0]!;
  const decidedAt = stages.findIndex((s) => s.id === current.stage);
  const blocks = BLOCKS_APPROVAL[current.actual];
  const correct = current.expected === current.actual;

  return (
    <figure className={styles.figure} aria-labelledby={`${name}-cap`}>
      <figcaption id={`${name}-cap`} className={styles.caption}>
        <span className={styles.figNo}>Fig. {figure}</span>
        <span>Trace one AI-written claim through TraceLayer&rsquo;s integrity engine</span>
        <span className={styles.source}>Recorded output · held-out set v3</span>
      </figcaption>

      <div className={styles.plate}>
        {/* ---- Left: choose a claim ---- */}
        <fieldset className={styles.choices}>
          <legend className={styles.legend}>Choose a claim</legend>
          <div className={styles.choiceList}>
            {traceCases.map((c) => (
              <label key={c.id} className={styles.choice}>
                <input
                  type="radio"
                  name={name}
                  value={c.id}
                  checked={c.id === id}
                  onChange={() => setId(c.id)}
                  className={styles.radio}
                />
                <span className={styles.choiceMeta}>
                  <span>{c.id}</span>
                  <span>{c.adversarial ? "adversarial" : "legitimate"}</span>
                  {c.expected !== c.actual && <span className={styles.missTag}>engine miss</span>}
                </span>
                <span className={styles.choiceText}>{c.text}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* ---- Right: what happened ---- */}
        <div className={styles.result} aria-live="polite">
          <p className={styles.claim}>
            <span className={styles.claimMark} aria-hidden="true">
              &ldquo;
            </span>
            {current.text}
            <span aria-hidden="true">&rdquo;</span>
          </p>
          {current.id === "h3-38" && (
            <p className={styles.footnote}>
              The &ldquo;е&rdquo; in &ldquo;wеb-01&rdquo; is Cyrillic. It looks identical to a Latin
              &ldquo;e&rdquo;.
            </p>
          )}

          <ol className={styles.stages} aria-label="Checks, in the engine's order">
            {stages.map((s, i) => {
              const state = i < decidedAt ? "before" : i === decidedAt ? "decided" : "after";
              return (
                <li key={s.id} className={styles.stage} data-state={state}>
                  <span className={styles.stageNo}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.stageLabel}>{s.label}</span>
                  {state === "decided" && (
                    <>
                      <span className={styles.decided}>decided here</span>
                      {!compact && <span className={styles.stageDetail}>{s.detail}</span>}
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          <dl className={styles.outcome}>
            <div>
              <dt>Engine verdict</dt>
              <dd className={blocks ? styles.unsafe : undefined}>
                {VERDICT_LABEL[current.actual]}
              </dd>
            </div>
            <div>
              <dt>Expected</dt>
              <dd>{VERDICT_LABEL[current.expected]}</dd>
            </div>
            <div>
              <dt>Blocks approval</dt>
              <dd>{blocks ? "Yes" : "No"}</dd>
            </div>
            <div className={styles.reasonRow}>
              <dt>Reason, as recorded</dt>
              <dd className={styles.reason}>{current.reason}</dd>
            </div>
          </dl>

          {!correct && (
            <p className={styles.miss}>
              One of the two misses in this set. The expected label was a different unsafe verdict,
              so the claim was still blocked.
            </p>
          )}
        </div>
      </div>

      <p className={styles.note}>
        Claims, verdicts and reasons are copied from{" "}
        <code>benchmarks/results/evaluation-v3.json</code>. On the full frozen set the engine was
        right on {heldoutSummary.correct} of {heldoutSummary.cases} ({heldoutSummary.accuracy}) with{" "}
        {heldoutSummary.falseVerifications} false verifications. Stage names summarise the
        engine&rsquo;s documented check order.
      </p>
    </figure>
  );
}
