/**
 * Blocks: renders the typed content blocks of a case study (see `Block` in content/types.ts).
 *
 * Server component. Only the architecture explorer and claim trace hydrate on the client; text,
 * tables, code and images are static HTML.
 *
 * Figures are numbered in reading order across the whole article via a counter passed in from the
 * page, so "Fig. 3" means the third figure regardless of which section it is in.
 */
import Image from "next/image";
import { ArchitectureExplorer } from "@/components/architecture/ArchitectureExplorer";
import { BarChart } from "@/components/viz/BarChart";
import { passableLatency, traceLayerCharts } from "@/content/charts";
import { projectHue } from "@/lib/hues";
import type { Block, Metric } from "@/content/types";
import { ClaimTrace } from "./ClaimTrace";
import { ConfusionMatrix } from "./ConfusionMatrix";
import { LeadTime } from "./LeadTime";
import styles from "./Blocks.module.css";

/** Assigns figure numbers in order of appearance. Created once per page render. */
export function figureCounter() {
  let n = 0;
  return () => String(++n);
}

export function Blocks({ blocks, nextFigure }: { blocks: Block[]; nextFigure: () => string }) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} nextFigure={nextFigure} />
      ))}
    </>
  );
}

function BlockView({ block, nextFigure }: { block: Block; nextFigure: () => string }) {
  switch (block.type) {
    case "p":
      return <p className={styles.p}>{block.text}</p>;

    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List className={block.ordered ? styles.ol : styles.ul}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </List>
      );
    }

    case "image": {
      const fig = nextFigure();
      return (
        <figure className={block.wide ? styles.imageWide : styles.image}>
          <div
            className={styles.frame}
            data-tall={block.image.height > block.image.width * 1.2 || undefined}
          >
            <Image
              src={block.image.src}
              alt={block.image.alt}
              width={block.image.width}
              height={block.image.height}
              sizes="(max-width: 56rem) 100vw, 60rem"
            />
          </div>
          {block.image.caption && (
            <figcaption className={styles.figcaption}>
              <span className={styles.figNo}>Fig. {fig}</span> {block.image.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "architecture":
      return (
        <div className={styles.bleed}>
          <ArchitectureExplorer diagram={block.diagram} figure={nextFigure()} />
        </div>
      );

    case "code":
      return (
        <figure className={styles.code}>
          <figcaption className={styles.codeHead}>
            <span>{block.file}</span>
            {block.href && (
              <a href={block.href} target="_blank" rel="noopener noreferrer">
                View source
              </a>
            )}
          </figcaption>
          <pre tabIndex={0} aria-label={`Code excerpt from ${block.file}`}>
            <code>{block.code}</code>
          </pre>
          {block.note && <p className={styles.codeNote}>{block.note}</p>}
        </figure>
      );

    case "metrics":
      return <MetricTable metrics={block.metrics} note={block.note} />;

    case "decisions":
      return (
        <div className={styles.decisions}>
          {block.rows.map((row) => (
            <div key={row.chose} className={styles.decision}>
              <p className={styles.chose}>
                <span className={styles.tag}>Chose</span>
                {row.chose}
              </p>
              <p className={styles.rejected}>
                <span className={styles.tag}>Over</span>
                {row.rejected}
              </p>
              <p className={styles.why}>{row.why}</p>
            </div>
          ))}
        </div>
      );

    case "aside":
      return (
        <aside className={styles.aside}>
          <p className={styles.asideTitle}>{block.title}</p>
          <p>{block.text}</p>
        </aside>
      );

    case "custom":
      if (block.component === "claim-trace")
        return (
          <div className={styles.bleed}>
            <ClaimTrace figure={nextFigure()} />
          </div>
        );
      if (block.component === "confusion-matrix") return <ConfusionMatrix figure={nextFigure()} />;
      if (block.component === "tl-charts")
        return (
          <div className={styles.chartGrid}>
            {traceLayerCharts.map((c) => (
              <BarChart key={c.title} chart={c} hue={projectHue("tracelayer")} compact />
            ))}
          </div>
        );
      if (block.component === "pa-latency")
        return <BarChart chart={passableLatency} hue={projectHue("passable")} />;
      return <LeadTime figure={nextFigure()} />;
  }
}

/**
 * MetricTable: the evidence ledger. Every value sits next to the conditions it was measured under
 * and where it came from. Used in case studies and (compact) on the homepage.
 */
export function MetricTable({ metrics, note }: { metrics: Metric[]; note?: string }) {
  return (
    <div className={styles.metrics}>
      {note && <p className={styles.metricsNote}>{note}</p>}
      <dl>
        {metrics.map((m) => (
          <div key={m.label} className={styles.metric}>
            <dt className={styles.metricLabel}>{m.label}</dt>
            <dd className={styles.metricValue}>{m.value}</dd>
            <dd className={styles.metricContext}>
              {m.context}
              {m.source && <span className={styles.metricSource}>{m.source}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
