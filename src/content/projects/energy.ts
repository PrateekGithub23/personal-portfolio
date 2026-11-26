/**
 * Energy Analytics case study.
 *
 * Sources (github.com/PrateekGithub23/energy-analytics): README.md, data_generator/, ingestion/,
 * spark-jobs/energy_aggregation.py, docker/. The pipeline has no measured throughput, so no
 * performance numbers are shown. Spark runs as a BATCH job (spark.read.json), not Structured
 * Streaming, and the page says so.
 */
import type { ArchDiagram, Project } from "../types";

const REPO = "https://github.com/PrateekGithub23/energy-analytics";

const flow: ArchDiagram = {
  id: "energy-flow",
  title: "Energy analytics data flow",
  width: 1000,
  height: 280,
  initial: "kafka",
  summary:
    "Simulated smart-meter sensors publish JSON readings to a Kafka topic. A consumer writes them into a raw zone of a local data lake, partitioned by date. A Spark batch job aggregates daily and hourly usage and writes Parquet partitioned by date and hour, which a Streamlit dashboard reads.",
  nodes: [
    {
      id: "sensors",
      label: "Simulated sensors",
      sub: "Python generator",
      x: 10,
      y: 30,
      w: 150,
      h: 64,
      role: "Generates readings per simulated sensor: energy in kWh, voltage and room temperature, drawn from uniform random ranges every 0.1 s.",
      tradeoff:
        "Simulated data keeps the project runnable anywhere but has no real daily pattern, so the dashboard shows mechanics, not insight.",
    },
    {
      id: "kafka",
      label: "Kafka",
      sub: "energy_readings",
      x: 210,
      y: 30,
      w: 160,
      h: 64,
      role: "Decouples producers from the writer. One topic, JSON-serialized messages.",
      tech: ["Apache Kafka", "ZooKeeper", "kafka-python", "Docker Compose"],
      failure:
        "The producer catches and logs send errors; there are no retries or dead-letter topic yet. The producer flushes after every message, which favours simplicity over throughput.",
    },
    {
      id: "consumer",
      label: "Lake writer",
      sub: "consumer group",
      x: 420,
      y: 30,
      w: 160,
      h: 64,
      role: "Consumer group energy-lake-writer reads from the earliest offset and appends each reading as a JSON line.",
      dataFlow:
        "Writes to data-lake/raw/energy/date=YYYY-MM-DD/, Hive-style partitions that Spark can prune.",
      failure:
        "Offsets auto-commit, so a crash between commit and write can drop a reading. At-least-once would need manual commits after the write.",
    },
    {
      id: "raw",
      label: "Raw zone",
      sub: "JSON lines · date=",
      x: 420,
      y: 180,
      w: 160,
      h: 64,
      role: "The immutable landing area. Keeps exactly what arrived so the processed layer can always be rebuilt.",
    },
    {
      id: "spark",
      label: "Spark batch job",
      sub: "master + worker",
      x: 630,
      y: 180,
      w: 170,
      h: 64,
      role: "Reads all raw JSON, derives event date and hour from the timestamp, and aggregates total kWh per day and per hour.",
      tech: ["Apache Spark (PySpark)", "Docker"],
      tradeoff:
        "Batch, not Structured Streaming. A scheduled batch over a partitioned raw zone is simpler to reason about and re-run; streaming would cut latency at the cost of state and checkpoint management.",
    },
    {
      id: "parquet",
      label: "Processed zone",
      sub: "Parquet · date/hour",
      x: 630,
      y: 30,
      w: 170,
      h: 64,
      role: "Daily totals, and hourly usage partitioned by event_date and event_hour.",
      tech: ["Parquet"],
      dataFlow:
        "Written in overwrite mode, so a re-run replaces results instead of duplicating them.",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      sub: "Streamlit",
      x: 850,
      y: 105,
      w: 140,
      h: 64,
      role: "Reads the processed Parquet and charts daily and hourly consumption.",
      tech: ["Streamlit", "pandas", "Matplotlib"],
    },
  ],
  edges: [
    { from: "sensors", to: "kafka", label: "JSON" },
    { from: "kafka", to: "consumer" },
    { from: "consumer", to: "raw", label: "append" },
    { from: "raw", to: "spark", label: "read" },
    { from: "spark", to: "parquet", label: "write" },
    { from: "parquet", to: "dashboard" },
  ],
};

export const energy: Project = {
  slug: "energy-analytics",
  index: "04",
  title: "Energy Analytics",
  kind: "A small end-to-end data pipeline: Kafka ingestion, a partitioned data lake, Spark aggregation",
  short: "Kafka → Spark → Parquet data pipeline",
  summary:
    "Simulated smart-meter readings flow through Kafka into a date-partitioned raw zone, a Spark batch job aggregates them into Parquet partitioned by date and hour, and a Streamlit dashboard reads the result. Built to learn how the pieces of a data platform fit together.",
  domains: ["data"],
  period: "2026",
  status: "Learning project",
  stack: ["Python", "Kafka", "Spark", "Parquet", "Docker Compose", "Streamlit"],
  links: [{ label: "Source", href: REPO }],
  headline: [],
  hero: "flow",
  glance: {
    problem:
      "I wanted to understand the parts of a data platform by building each one: how events get in, where they land, how they are processed and how layout affects reading them back.",
    built:
      "A Kafka producer and consumer, a raw zone with Hive-style date partitions, a Spark batch job writing partitioned Parquet, and a Streamlit dashboard, all runnable with Docker Compose.",
    result:
      "A working pipeline from event to chart. No performance numbers: the data is simulated and nothing was benchmarked.",
  },
  published: true,
  sections: [
    {
      id: "flow",
      title: "Data flow",
      blocks: [
        {
          type: "p",
          text: 'Select a stage to see what it does and how it behaves when something fails. Several answers are "not handled yet", and they are listed as such.',
        },
        { type: "architecture", diagram: flow },
      ],
    },
    {
      id: "partitioning",
      title: "Partitioning",
      blocks: [
        {
          type: "p",
          text: "Both zones are partitioned by time because every question the dashboard asks is bounded by time. The raw zone uses date= folders. The hourly table is partitioned by date and hour, so a query for one day reads one folder instead of the whole table.",
        },
        {
          type: "code",
          lang: "python",
          file: "spark-jobs/energy_aggregation.py",
          href: `${REPO}/blob/main/spark-jobs/energy_aggregation.py`,
          code: `df = spark.read.json("/workspace/data-lake/raw/energy/*/*.json")
df = df.withColumn("event_date", to_date(col("timestamp")))
df = df.withColumn("event_hour", hour(col("timestamp")))

hourly_usage = df.groupBy("event_date", "event_hour") \\
                 .agg(sum("energy_kwh").alias("total_energy_kwh"))

hourly_usage.write.mode("overwrite") \\
            .partitionBy("event_date", "event_hour").parquet(hourly_output_path)`,
          note: "Excerpt, lightly reflowed.",
        },
        {
          type: "aside",
          title: "A trade-off I would revisit",
          text: "Partitioning by hour creates many small files for a small dataset. At this size, date-only partitioning would be faster to read; hour partitions only pay off once each hour holds substantial data.",
        },
      ],
    },
    {
      id: "limitations",
      title: "Known limitations",
      blocks: [
        {
          type: "list",
          items: [
            "Simulated, uniformly random data, so the charts have no real pattern.",
            "Spark runs as a batch job that re-reads the whole raw zone; there is no incremental processing.",
            "No schema validation, data-quality checks or tests.",
            "No retries or dead-letter topic; auto-committed offsets mean a crash can lose a reading.",
            "Runs locally only.",
          ],
        },
      ],
    },
    {
      id: "next",
      title: "Next",
      blocks: [
        {
          type: "list",
          items: [
            "Schema validation at the consumer, with rejected records routed to a dead-letter topic.",
            "Manual offset commits after a successful write, for at-least-once delivery.",
            "Incremental Spark runs that read only new date partitions.",
          ],
        },
      ],
    },
  ],
};
