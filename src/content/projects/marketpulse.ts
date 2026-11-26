/**
 * MarketPulse case study.
 *
 * Sources (github.com/PrateekGithub23/marketpulse): build_dataset.py, train_model.py,
 * early_detection.py, results/confusion_matrix.png ([[724, 24], [10, 23]]),
 * data/processed/early_detection_results.csv, data/processed/ml_dataset.csv.
 *
 * The original run used scikit-learn 1.0.1. A re-run on 2026-11-25 with a current scikit-learn gave
 * slightly different numbers; both are shown so the result is not overstated.
 */
import type { ArchDiagram, Project } from "../types";

const pipeline: ArchDiagram = {
  id: "marketpulse-pipeline",
  title: "MarketPulse data and model pipeline",
  width: 1000,
  height: 300,
  initial: "split",
  summary:
    "Known pump events from Telegram pump groups are matched to Binance one-minute candles. A window around each event is labelled, seven features are computed from past data only, and events are split into train and test groups before a random forest is trained and evaluated per minute and per event.",
  nodes: [
    {
      id: "events",
      label: "Pump events",
      sub: "Telegram groups",
      x: 20,
      y: 40,
      w: 170,
      h: 64,
      role: "A public dataset of pump-and-dump announcements from Telegram groups, filtered to Binance.",
      dataFlow: "Each event gives a coin and an announcement time.",
    },
    {
      id: "candles",
      label: "1-minute candles",
      sub: "Binance klines",
      x: 20,
      y: 190,
      w: 170,
      h: 64,
      role: "Monthly 1-minute OHLCV files per coin, including trade counts and taker-buy volume.",
      tech: ["Python", "pandas"],
    },
    {
      id: "windows",
      label: "Windows + labels",
      sub: "−60 min … +10 min",
      x: 230,
      y: 115,
      w: 170,
      h: 64,
      role: "Cuts a window from one hour before to ten minutes after each announcement. The announcement minute and the next two are labelled as pump.",
      dataFlow: "36 events → 3,408 labelled minutes, 144 of them pump (4.2%).",
      tradeoff:
        "A three-minute label is a judgement call; a longer one would inflate recall by counting minutes after the move is obvious.",
    },
    {
      id: "features",
      label: "Features",
      sub: "7, past-only",
      x: 440,
      y: 115,
      w: 150,
      h: 64,
      role: "1- and 5-minute returns, log volume and trade-count ratios against a 30-minute baseline, 10-minute volatility, candle range and taker-buy ratio.",
      failure:
        "Rolling baselines are shifted by one minute so a feature never includes the minute it describes.",
    },
    {
      id: "split",
      label: "Group split",
      sub: "by pump event",
      x: 630,
      y: 115,
      w: 150,
      h: 64,
      role: "GroupShuffleSplit with the event as the group: 25% of events are held out entirely.",
      tradeoff:
        "A random row split would put minutes from the same pump in both train and test. Neighbouring minutes are nearly identical, so the model would be graded on data it has effectively seen.",
    },
    {
      id: "model",
      label: "Random forest",
      sub: "balanced classes",
      x: 820,
      y: 40,
      w: 160,
      h: 64,
      role: '200 trees, max depth 6, class_weight="balanced" to counter the 4% positive rate.',
      tech: ["scikit-learn", "joblib"],
    },
    {
      id: "eval",
      label: "Evaluation",
      sub: "minute + event",
      x: 820,
      y: 190,
      w: 160,
      h: 64,
      role: "Precision, recall and F1 on held-out minutes, plus an event-level question: was the first alert at or before the local price peak?",
      tech: ["Streamlit", "Plotly", "Matplotlib"],
      dataFlow:
        "A Streamlit dashboard replays each held-out event with the announcement, first alert and peak marked.",
    },
  ],
  edges: [
    { from: "events", to: "windows" },
    { from: "candles", to: "windows" },
    { from: "windows", to: "features" },
    { from: "features", to: "split" },
    { from: "split", to: "model", label: "train" },
    { from: "split", to: "eval", label: "test" },
    { from: "model", to: "eval" },
  ],
};

export const marketpulse: Project = {
  slug: "marketpulse",
  index: "03",
  title: "MarketPulse",
  kind: "Early detection of crypto pump-and-dump events from one-minute market data",
  short: "Pump-and-dump detection from minute data",
  summary:
    "A classifier that flags coordinated pump events from minute-level price and volume, evaluated on events it never saw in training. A feasibility study with a small test set, reported with its limits.",
  domains: ["ml", "data"],
  period: "2026",
  status: "Feasibility study",
  stack: ["Python", "pandas", "scikit-learn", "Streamlit", "Plotly"],
  links: [{ label: "Source", href: "https://github.com/PrateekGithub23/marketpulse" }],
  headline: [
    {
      value: "69.7%",
      label: "recall on held-out pump minutes",
      context:
        "23 of 33 pump minutes in 9 held-out events; precision 48.9%. Original run, scikit-learn 1.0.1.",
      source: "results/confusion_matrix.png",
    },
    {
      value: "7 of 9",
      label: "held-out events flagged at or before the peak",
      context: "2 with a 6–7 minute lead; 5 in the peak minute itself.",
      source: "early_detection_results.csv",
    },
  ],
  cover: {
    src: "/images/marketpulse/dashboard-replay.jpg",
    alt: "MarketPulse Historical Event Replay for ICN/BTC on 2018-09-19: pump time 18:22, first alert 18:22, lead to peak 6 minutes, with the price line rising sharply after 18:15.",
    width: 1920,
    height: 1089,
  },
  hero: "matrix",
  glance: {
    problem:
      "Pump-and-dump groups announce a coin and buy at once; the price spikes within minutes. Detecting it has to happen in the first minutes, from market data alone.",
    built:
      "A labelled minute-level dataset from 36 real events, seven past-only features, an event-grouped train/test split and a random forest, with an event replay dashboard.",
    result:
      "On 9 unseen events: 69.7% recall and 48.9% precision per minute; 7 of 9 events flagged at or before the local price peak.",
  },
  published: true,
  sections: [
    {
      id: "problem",
      title: "Problem",
      blocks: [
        {
          type: "p",
          text: "In a pump-and-dump, a Telegram group announces a coin and members buy at the same moment. Price and volume jump within a minute or two, then collapse. If detection is going to be useful, it has to fire before the peak, using only data available at that minute.",
        },
        {
          type: "p",
          text: "Two things make this easy to get wrong. Pump minutes are rare (about 4% of the data here), so accuracy is meaningless. And minutes from the same event are almost identical, so a careless split leaks the answer into training.",
        },
      ],
    },
    {
      id: "pipeline",
      title: "Pipeline",
      blocks: [{ type: "architecture", diagram: pipeline }],
    },
    {
      id: "leakage",
      title: "Preventing leakage",
      blocks: [
        {
          type: "p",
          text: "The split is by event, not by row. Every minute of a held-out pump stays out of training, so the test measures whether the model generalises to a new event rather than recognising neighbours of minutes it already saw.",
        },
        {
          type: "code",
          lang: "python",
          file: "train_model.py",
          href: "https://github.com/PrateekGithub23/marketpulse/blob/main/train_model.py",
          code: `groups = df["pump_time"].astype(str)

splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
train_idx, test_idx = next(splitter.split(X, y, groups))

model = RandomForestClassifier(n_estimators=200, max_depth=6,
                               class_weight="balanced", random_state=42)`,
          note: "Excerpt, lightly reflowed. The rolling volume and trade baselines are also shifted by one minute so no feature includes the minute being predicted.",
        },
      ],
    },
    {
      id: "results",
      title: "Results",
      blocks: [
        { type: "custom", component: "confusion-matrix" },
        {
          type: "metrics",
          note: 'Held-out test set: 781 minutes from 9 events, 33 of them pump minutes (4.2%). Accuracy (95.6%) is not used: predicting "no pump" for every minute would score 95.8%.',
          metrics: [
            {
              value: "69.7%",
              label: "Recall (23 of 33)",
              context:
                "Original run, scikit-learn 1.0.1. Re-running with a current scikit-learn gives 60.6%.",
              source: "results/confusion_matrix.png",
            },
            {
              value: "48.9%",
              label: "Precision (23 of 47)",
              context: "Re-run: 52.6%. Roughly one alert in two is a real pump minute.",
              source: "results/confusion_matrix.png",
            },
            {
              value: "0.575",
              label: "F1",
              context:
                "Re-run: 0.563. The difference comes from library version changes on a small sample.",
            },
          ],
        },
        { type: "custom", component: "lead-time" },
        {
          type: "image",
          wide: true,
          image: {
            src: "/images/marketpulse/dashboard-event-replay.jpg",
            alt: "MarketPulse dashboard replaying a held-out pump event with the announcement, first model alert and price peak marked on the price chart.",
            width: 1712,
            height: 1920,
            caption: "Event replay in the Streamlit dashboard.",
          },
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
            "Nine held-out events from one exchange. That is enough to show feasibility, not to estimate real-world performance.",
            "Results move a few points between scikit-learn versions, which is itself a sign of how small the test set is.",
            "Events come from a labelled historical dataset (2018–2019). Detecting unannounced pumps is a harder, unmeasured problem.",
            "No trading or profit claims: a detection at the peak minute is too late to act on.",
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
            "Cross-validation over event groups instead of one split, to report a range rather than a point.",
            "Pin library versions so results reproduce exactly.",
          ],
        },
      ],
    },
  ],
};
