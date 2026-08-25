"use client";

import { FormEvent, useEffect, useState } from "react";

type Status =
  | "planned"
  | "active"
  | "completed"
  | "partial"
  | "changed"
  | "skipped";
type ExperimentStatus = "active" | "paused" | "completed";
type Experiment = {
  id: string;
  name: string;
  category: string;
  status: ExperimentStatus;
  target?: number;
  startDate: string;
  hours: number;
  progress: number;
  milestones: number;
  achievement: string;
  lessons: string;
};
type Block = {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  experimentId?: string;
  status: Status;
  note?: string;
  actualMinutes?: number;
};
type Income = { id: string; date: string; amount: number; source: string };
type Data = {
  endDate: string;
  incomeTarget: number;
  interval: number;
  experiments: Experiment[];
  blocks: Block[];
  income: Income[];
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const shiftDate = (value: string, offset: number) => {
  const d = new Date(`${value}T12:00:00`);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const uid = () => Math.random().toString(36).slice(2, 10);
const minutes = (start: string, end: string) => {
  const [a, b] = [start, end].map((x) => x.split(":").map(Number));
  return b[0] * 60 + b[1] - (a[0] * 60 + a[1]);
};
const money = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
const prettyDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
const isBlockOverdue = (block: Block, today: string) => {
  if (block.status !== "planned") return false;
  if (block.date < today) return true;
  if (block.date > today) return false;
  return block.end < new Date().toTimeString().slice(0, 5);
};

function demoData(): Data {
  const t = todayISO();
  const y = day(-1);
  const two = day(-2);
  const tm = day(1);
  return {
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 9))
      .toISOString()
      .slice(0, 10),
    incomeTarget: 12000,
    interval: 30,
    experiments: [
      {
        id: "freelance",
        name: "Freelance systems",
        category: "Freelancing",
        status: "active",
        target: 4000,
        startDate: day(-34),
        hours: 46.5,
        progress: 38,
        milestones: 3,
        achievement: "First retainer proposal sent",
        lessons: "Shorter offers get more replies.",
      },
      {
        id: "search",
        name: "Product role search",
        category: "Job search",
        status: "active",
        target: 8000,
        startDate: day(-21),
        hours: 31,
        progress: 25,
        milestones: 2,
        achievement: "7 tailored applications",
        lessons: "Case-study portfolio leads with outcomes.",
      },
      {
        id: "content",
        name: "Tiny content engine",
        category: "Marketing",
        status: "active",
        startDate: day(-14),
        hours: 16,
        progress: 42,
        milestones: 5,
        achievement: "Five useful posts published",
        lessons: "Writing from a client problem is easiest.",
      },
      {
        id: "old",
        name: "Design template shop",
        category: "Side hustle",
        status: "completed",
        target: 500,
        startDate: day(-70),
        hours: 28,
        progress: 100,
        milestones: 4,
        achievement: "Validated demand with 12 sales",
        lessons: "A narrow audience beats a broad catalogue.",
      },
    ],
    blocks: [
      {
        id: "b1",
        date: t,
        start: "08:30",
        end: "09:15",
        title: "Weekly role shortlist",
        experimentId: "search",
        status: "completed",
        actualMinutes: 48,
      },
      {
        id: "b2",
        date: t,
        start: "09:30",
        end: "11:00",
        title: "Client prospecting sprint",
        experimentId: "freelance",
        status: "active",
        actualMinutes: 25,
      },
      {
        id: "b3",
        date: t,
        start: "11:30",
        end: "12:15",
        title: "Draft a useful post",
        experimentId: "content",
        status: "planned",
      },
      {
        id: "b4",
        date: t,
        start: "14:00",
        end: "15:30",
        title: "Portfolio case study",
        experimentId: "search",
        status: "planned",
      },
      {
        id: "b5",
        date: y,
        start: "09:00",
        end: "10:30",
        title: "Build prospect list",
        experimentId: "freelance",
        status: "completed",
        actualMinutes: 90,
      },
      {
        id: "b6",
        date: y,
        start: "11:00",
        end: "12:00",
        title: "Application research",
        experimentId: "search",
        status: "partial",
        actualMinutes: 35,
      },
      {
        id: "b7",
        date: two,
        start: "09:30",
        end: "10:30",
        title: "Post outline",
        experimentId: "content",
        status: "changed",
        actualMinutes: 45,
      },
      {
        id: "b8",
        date: tm,
        start: "08:30",
        end: "10:00",
        title: "Proposal refinement",
        experimentId: "freelance",
        status: "planned",
      },
      {
        id: "b9",
        date: tm,
        start: "10:30",
        end: "11:30",
        title: "Three role applications",
        experimentId: "search",
        status: "planned",
      },
    ],
    income: [
      { id: "i1", date: day(-18), amount: 480, source: "Landing page audit" },
      { id: "i2", date: day(-7), amount: 250, source: "Research sprint" },
      { id: "i3", date: day(-1), amount: 150, source: "Advisory call" },
    ],
  };
}

const navIcons = {
  "⌂": "house",
  "◷": "calendar-days",
  "◌": "flask-conical",
  "□": "archive",
  "↗": "chart-no-axes-combined",
  "⚙": "settings",
};
const StaticIcon = ({ name, size = 17 }: { name: string; size?: number }) => (
  <span
    className="static-icon"
    aria-hidden="true"
    style={{
      width: size,
      height: size,
      maskImage: `url(./icons/${name}.svg)`,
      WebkitMaskImage: `url(./icons/${name}.svg)`,
    }}
  />
);
const Icon = ({ children }: { children: string }) => {
  const name = navIcons[children as keyof typeof navIcons];
  return (
    <span className="icon" aria-hidden="true">
      {name ? <StaticIcon name={name} /> : children}
    </span>
  );
};

export default function Home() {
  const [data, setData] = useState<Data>(demoData);
  const [hydrated, setHydrated] = useState(false);
  const [page, setPage] = useState<
    | "dashboard"
    | "planner"
    | "achievements"
    | "experiments"
    | "archive"
    | "week"
  >("dashboard");
  const [plannerDate, setPlannerDate] = useState(todayISO());
  const [modal, setModal] = useState<
    "income" | "experiment" | "settings" | "checkin" | null
  >(null);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(
    null,
  );
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [timerBlock, setTimerBlock] = useState<Block | null>(null);
  const [focusBlock, setFocusBlock] = useState<Block | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("momentum-v1");
    if (saved)
      try {
        setData(JSON.parse(saved));
      } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem("momentum-v1", JSON.stringify(data));
  }, [data, hydrated]);
  useEffect(() => {
    if (!timerBlock || !timerRunning) return;
    const id = window.setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerBlock, timerRunning]);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(""), 2600);
    return () => clearTimeout(id);
  }, [notice]);
  const today = todayISO();
  const activeExperiments = data.experiments.filter(
    (e) => e.status === "active",
  );
  const archivedExperiments = data.experiments.filter(
    (e) => e.status !== "active",
  );
  const achievements = data.experiments.filter((e) => e.achievement.trim());
  const todayBlocks = data.blocks
    .filter((b) => b.date === today)
    .sort((a, b) => a.start.localeCompare(b.start));
  const earned = data.income.reduce((sum, item) => sum + item.amount, 0);
  const incomePct = Math.min(
    100,
    Math.round((earned / data.incomeTarget) * 100),
  );
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(`${data.endDate}T12:00:00`).getTime() - new Date().getTime()) /
        86400000,
    ),
  );
  const plannedToday = todayBlocks.reduce(
    (sum, b) => sum + minutes(b.start, b.end),
    0,
  );
  const formatTime = (secs: number) =>
    `${String(Math.floor(secs / 3600)).padStart(2, "0")}:${String(Math.floor(secs / 60) % 60).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  const experimentFor = (id?: string) =>
    data.experiments.find((e) => e.id === id);
  const updateData = (fn: (old: Data) => Data) => setData((old) => fn(old));
  const go = (next: typeof page) => {
    setPage(next);
    if (next === "planner") setPlannerDate(today);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  function beginTimer(block: Block) {
    setFocusBlock(block);
    setTimerBlock(block);
    setTimerRunning(true);
    setTimerSeconds(block.actualMinutes ? block.actualMinutes * 60 : 0);
    updateData((d) => ({
      ...d,
      blocks: d.blocks.map((b) =>
        b.id === block.id ? { ...b, status: "active" } : b,
      ),
    }));
  }
  function stopTimer() {
    setTimerRunning(false);
    setModal("checkin");
  }
  function finishCheckin(status: Status, note: string) {
    if (!timerBlock) return;
    const tracked = Math.max(1, Math.round(timerSeconds / 60));
    updateData((d) => ({
      ...d,
      blocks: d.blocks.map((b) =>
        b.id === timerBlock.id
          ? { ...b, status, note, actualMinutes: tracked }
          : b,
      ),
      experiments: d.experiments.map((e) =>
        e.id === timerBlock.experimentId
          ? { ...e, hours: +(e.hours + tracked / 60).toFixed(1) }
          : e,
      ),
    }));
    setTimerRunning(false);
    setTimerBlock(null);
    setFocusBlock(null);
    setTimerSeconds(0);
    setModal(null);
    setNotice("Progress saved. Keep the day simple.");
  }
  function saveIncome(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const amount = Number(f.get("amount"));
    if (!amount) return;
    updateData((d) => ({
      ...d,
      income: [
        {
          id: uid(),
          date: String(f.get("date") || today),
          amount,
          source: String(f.get("source") || "Income"),
        },
        ...d.income,
      ],
    }));
    setModal(null);
    setNotice("Income logged.");
  }
  function saveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    updateData((d) => ({
      ...d,
      endDate: String(f.get("endDate")),
      incomeTarget: Number(f.get("incomeTarget")),
      interval: Number(f.get("interval")),
    }));
    setModal(null);
    setNotice("Sprint settings updated.");
  }
  function saveExperiment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const id = editingExperiment?.id || uid();
    const exp: Experiment = {
      id,
      name: String(f.get("name")),
      category: String(f.get("category")),
      status: String(f.get("status")) as ExperimentStatus,
      target: Number(f.get("target")) || undefined,
      startDate: String(f.get("startDate")),
      hours: Number(f.get("hours")) || 0,
      progress: Number(f.get("progress")) || 0,
      milestones: Number(f.get("milestones")) || 0,
      achievement: String(f.get("achievement")),
      lessons: String(f.get("lessons")),
    };
    updateData((d) => ({
      ...d,
      experiments: editingExperiment
        ? d.experiments.map((x) => (x.id === id ? exp : x))
        : [exp, ...d.experiments],
    }));
    setModal(null);
    setEditingExperiment(null);
    setNotice(editingExperiment ? "Experiment updated." : "Experiment added.");
  }
  function saveBlock(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const isExisting = Boolean(editingBlock?.id);
    const id = editingBlock?.id || uid();
    const b: Block = {
      id,
      date: String(f.get("date")),
      start: String(f.get("start")),
      end: String(f.get("end")),
      title: String(f.get("title")),
      experimentId: String(f.get("experimentId")) || undefined,
      status: editingBlock?.status || "planned",
      actualMinutes: editingBlock?.actualMinutes,
      note: editingBlock?.note,
    };
    updateData((d) => ({
      ...d,
      blocks: isExisting
        ? d.blocks.map((x) => (x.id === id ? b : x))
        : [...d.blocks, b],
    }));
    setEditingBlock(null);
    setNotice(isExisting ? "Plan block updated." : "Block added to your plan.");
  }
  const deleteBlock = () => {
    if (!editingBlock) return;
    updateData((d) => ({
      ...d,
      blocks: d.blocks.filter((b) => b.id !== editingBlock.id),
    }));
    setEditingBlock(null);
    setNotice("Block removed from the plan.");
  };
  const reset = () => {
    localStorage.removeItem("momentum-v1");
    setData(demoData());
    setModal(null);
    setNotice("Demo data restored.");
  };
  const nav = [
    ["dashboard", "⌂", "Overview"],
    ["planner", "◷", "Planner"],
    ["experiments", "◌", "Experiments"],
    ["archive", "□", "Archive"],
    ["week", "↗", "Weekly"],
  ] as const;
  const mobileNav = nav.filter(([id]) => id !== "archive");
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => go("dashboard")}>
          <span className="brand-mark">M</span>
          <span>momentum</span>
        </button>
        <nav>
          {nav.map(([id, icon, label]) => (
            <button
              key={id}
              className={page === id ? "nav-item selected" : "nav-item"}
              onClick={() => go(id)}
            >
              <Icon>{icon}</Icon>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="nav-item" onClick={() => setModal("settings")}>
            <Icon>⚙</Icon>
            <span>Settings</span>
          </button>
          <p>
            Private by default
            <br />
            Saved on this device
          </p>
        </div>
      </aside>
      <div className="mobile-nav">
        <button className="brand" onClick={() => go("dashboard")}>
          <span className="brand-mark">M</span>
          <span>momentum</span>
        </button>
        <button
          className="icon-button"
          onClick={() => setModal("settings")}
          aria-label="Open settings"
        >
          <StaticIcon name="settings" />
        </button>
      </div>
      <section className="content">
        {page === "dashboard" && <Dashboard />}
        {page === "planner" && <Planner />}
        {page === "achievements" && <Achievements />}
        {page === "experiments" && <Experiments archived={false} />}
        {page === "archive" && <Experiments archived />}
        {page === "week" && <Weekly />}
      </section>
      {focusBlock && (
        <FocusSession
          block={
            data.blocks.find((block) => block.id === focusBlock.id) ||
            focusBlock
          }
        />
      )}
      <div className="mobile-tabs">
        {mobileNav.map(([id, icon, label]) => (
          <button
            key={id}
            className={page === id ? "selected" : ""}
            onClick={() => go(id)}
          >
            <Icon>{icon}</Icon>
            <small>{label}</small>
          </button>
        ))}
      </div>
      {timerBlock && !focusBlock && (
        <div className="timer-dock">
          <span className={timerRunning ? "pulse" : "pulse paused"} />
          <div>
            <small>{timerRunning ? "Now focused on" : "Session paused"}</small>
            <strong>{timerBlock.title}</strong>
          </div>
          <b>{formatTime(timerSeconds)}</b>
          <button
            className="button primary"
            onClick={() => {
              setFocusBlock(timerBlock);
              if (!timerRunning) setTimerRunning(true);
            }}
          >
            {timerRunning ? "Open" : "Resume"}
          </button>
        </div>
      )}
      {notice && <div className="toast">{notice}</div>}
      {modal === "income" && (
        <Modal title="Log income" onClose={() => setModal(null)}>
          <form onSubmit={saveIncome} className="form-grid">
            <label>
              Amount
              <input
                name="amount"
                type="number"
                min="1"
                step="1"
                autoFocus
                required
                placeholder="0"
              />
            </label>
            <label>
              Source
              <input name="source" required placeholder="e.g. Website audit" />
            </label>
            <label>
              Date
              <input name="date" type="date" defaultValue={today} required />
            </label>
            <button className="button primary full">Save income</button>
          </form>
        </Modal>
      )}
      {modal === "settings" && (
        <Modal title="Sprint settings" onClose={() => setModal(null)}>
          <form onSubmit={saveSettings} className="form-grid">
            <label>
              Target end date
              <input
                name="endDate"
                type="date"
                defaultValue={data.endDate}
                required
              />
            </label>
            <label>
              Income target
              <input
                name="incomeTarget"
                type="number"
                min="1"
                defaultValue={data.incomeTarget}
                required
              />
            </label>
            <label>
              Planner interval
              <select name="interval" defaultValue={data.interval}>
                <option value="30">30 minutes</option>
                <option value="15">15 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </label>
            <button className="button primary full">Save settings</button>
            <button
              className="text-button danger full"
              type="button"
              onClick={reset}
            >
              Reset demo data
            </button>
          </form>
        </Modal>
      )}
      {modal === "experiment" && (
        <Modal
          title={editingExperiment ? "Edit experiment" : "New experiment"}
          onClose={() => {
            setModal(null);
            setEditingExperiment(null);
          }}
        >
          <form onSubmit={saveExperiment} className="form-grid structured-form">
            <fieldset className="form-section">
              <legend>Basics</legend>
              <label>
                Name
                <input
                  name="name"
                  defaultValue={editingExperiment?.name}
                  required
                  autoFocus
                  placeholder="e.g. Freelance systems"
                />
              </label>
              <div className="form-pair">
                <label>
                  Category
                  <input
                    name="category"
                    defaultValue={editingExperiment?.category}
                    required
                    placeholder="Freelancing"
                  />
                </label>
                <label>
                  Status
                  <select
                    name="status"
                    defaultValue={editingExperiment?.status || "active"}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused (archive)</option>
                    <option value="completed">Completed (archive)</option>
                  </select>
                </label>
              </div>
              <div className="form-pair">
                <label>
                  Money target
                  <input
                    name="target"
                    type="number"
                    defaultValue={editingExperiment?.target}
                    placeholder="Optional"
                  />
                </label>
                <label>
                  Start date
                  <input
                    name="startDate"
                    type="date"
                    defaultValue={editingExperiment?.startDate || today}
                    required
                  />
                </label>
              </div>
            </fieldset>
            <fieldset className="form-section">
              <legend>Progress</legend>
              <div className="form-pair">
                <label>
                  Total hours
                  <input
                    name="hours"
                    type="number"
                    min="0"
                    step="0.5"
                    defaultValue={editingExperiment?.hours || 0}
                  />
                </label>
                <label>
                  Progress %
                  <input
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingExperiment?.progress || 0}
                  />
                </label>
              </div>
              <label>
                Milestones reached
                <input
                  name="milestones"
                  type="number"
                  min="0"
                  defaultValue={editingExperiment?.milestones || 0}
                />
              </label>
            </fieldset>
            <fieldset className="form-section">
              <legend>Results & learning</legend>
              <label>
                Achievements / results
                <textarea
                  name="achievement"
                  defaultValue={editingExperiment?.achievement}
                  placeholder="What moved forward?"
                />
              </label>
              <label>
                Lessons learned
                <textarea
                  name="lessons"
                  defaultValue={editingExperiment?.lessons}
                  placeholder="What would you repeat or change?"
                />
              </label>
            </fieldset>
            <div className="form-actions">
              <button className="button primary full">
                {editingExperiment ? "Save changes" : "Create experiment"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {editingBlock && (
        <Modal title="Plan block" onClose={() => setEditingBlock(null)}>
          <form onSubmit={saveBlock} className="form-grid">
            <label>
              Title
              <input
                name="title"
                defaultValue={editingBlock.title}
                required
                autoFocus
              />
            </label>
            <label>
              Date
              <input
                name="date"
                type="date"
                defaultValue={editingBlock.date}
                required
              />
            </label>
            <div className="form-pair">
              <label>
                Start
                <input
                  name="start"
                  type="time"
                  defaultValue={editingBlock.start}
                  required
                />
              </label>
              <label>
                End
                <input
                  name="end"
                  type="time"
                  defaultValue={editingBlock.end}
                  required
                />
              </label>
            </div>
            <label>
              Link to experiment
              <select
                name="experimentId"
                defaultValue={editingBlock.experimentId || ""}
              >
                <option value="">No linked experiment</option>
                {activeExperiments.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button primary full">Save block</button>
            <button
              className="text-button danger full"
              type="button"
              onClick={deleteBlock}
            >
              Remove block
            </button>
          </form>
        </Modal>
      )}
      {modal === "checkin" && <Checkin />}
    </main>
  );
  function Dashboard() {
    const completedToday = todayBlocks.filter(
      (block) => block.status === "completed",
    ).length;
    const latestAchievement = achievements[0];
    return (
      <>
        <header className="page-head home-heading">
          <div>
            <p className="eyebrow">{hydrated ? prettyDate(today) : "Today"}</p>
            <h1>Your day, clearly.</h1>
          </div>
        </header>
        <section className="home-top-grid">
          <article className="hero home-time-card">
            <img
              src="./momentum-hero.png"
              alt="A quiet early-morning workspace"
            />
            <div className="hero-shade" />
            <div className="hero-content">
              <p className="eyebrow">Time remaining</p>
              <div className="count">
                <strong>{hydrated ? daysLeft : "—"}</strong>
                <span>
                  days
                  <br />
                  left
                </span>
              </div>
              <div className="hero-meta">
                <span>
                  Until{" "}
                  {new Intl.DateTimeFormat("en-GB", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(`${data.endDate}T12:00:00`))}
                </span>
                <button
                  className="ghost-link"
                  onClick={() => setModal("settings")}
                >
                  Adjust →
                </button>
              </div>
            </div>
          </article>
          <article className="panel money-panel home-target-card">
            <div className="panel-label">
              <span>Money target</span>
              <button
                className="text-button"
                onClick={() => setModal("income")}
              >
                Log income +
              </button>
            </div>
            <div className="money-numbers">
              <strong>{money(earned)}</strong>
              <span>of {money(data.incomeTarget)}</span>
            </div>
            <Progress value={incomePct} />
            <div className="metric-foot">
              <span>{incomePct}% funded</span>
              <span>
                {money(Math.max(0, data.incomeTarget - earned))} remaining
              </span>
            </div>
            <div className="target-caption">
              <span>{data.income.length} income entries</span>
              <button onClick={() => setModal("settings")}>Edit target</button>
            </div>
          </article>
        </section>
        <section className="home-folder-grid">
          <button
            className="home-folder today-folder"
            onClick={() => {
              setPlannerDate(today);
              go("planner");
            }}
          >
            <span className="folder-topline">
              <span className="folder-icon">
                <StaticIcon name="calendar-days" size={20} />
              </span>
              <span className="folder-count">
                {completedToday}/{todayBlocks.length} done
              </span>
            </span>
            <span className="folder-heading">
              <span>
                <small>Today&apos;s plan</small>
                <strong>See everything for today.</strong>
              </span>
              <b aria-hidden="true">→</b>
            </span>
            <span className="folder-preview-list">
              {todayBlocks.slice(0, 3).map((block) => (
                <span key={block.id}>
                  <time>{block.start}</time>
                  <span>{block.title}</span>
                  <i className={block.status} />
                </span>
              ))}
              {!todayBlocks.length && (
                <span className="folder-empty">No tasks planned yet.</span>
              )}
            </span>
            <span className="folder-footer">
              <span>{Math.round(plannedToday / 6) / 10} planned hours</span>
              <span>Open today&apos;s page</span>
            </span>
          </button>
          <button
            className="home-folder achievement-folder"
            onClick={() => go("achievements")}
          >
            <img src="./momentum-hero.png" alt="" />
            <span className="achievement-shade" />
            <span className="achievement-folder-content">
              <span className="folder-topline">
                <span className="folder-icon achievement-icon">★</span>
                <span className="folder-count">
                  {achievements.length} wins saved
                </span>
              </span>
              <span className="folder-heading">
                <span>
                  <small>Achievements</small>
                  <strong>Notice how far you&apos;ve come.</strong>
                </span>
                <b aria-hidden="true">→</b>
              </span>
              {latestAchievement ? (
                <span className="achievement-preview">
                  <small>Latest highlight</small>
                  <strong>{latestAchievement.achievement}</strong>
                  <span>{latestAchievement.name}</span>
                </span>
              ) : (
                <span className="achievement-preview">
                  <strong>Your first win belongs here.</strong>
                </span>
              )}
              <span className="folder-footer">
                <span>
                  {data.experiments.reduce(
                    (total, experiment) => total + experiment.milestones,
                    0,
                  )}{" "}
                  milestones
                </span>
                <span>View all achievements</span>
              </span>
            </span>
          </button>
        </section>
      </>
    );
  }
  function Achievements() {
    const totalMilestones = data.experiments.reduce(
      (sum, experiment) => sum + experiment.milestones,
      0,
    );
    const completedExperiments = data.experiments.filter(
      (experiment) => experiment.status === "completed",
    ).length;
    return (
      <>
        <header className="page-head achievements-head">
          <div>
            <p className="eyebrow">Your progress history</p>
            <h1>Achievements</h1>
          </div>
          <button className="button quiet" onClick={() => go("dashboard")}>
            ← Back home
          </button>
        </header>
        <section className="achievement-hero">
          <img src="./momentum-hero.png" alt="A calm workspace at sunrise" />
          <div className="achievement-hero-shade" />
          <div>
            <p className="eyebrow">Evidence of momentum</p>
            <h2>Small wins become a better life.</h2>
            <p>Every result stays here—even when an experiment changes.</p>
          </div>
        </section>
        <section className="achievement-stats">
          <article className="panel">
            <span>Wins recorded</span>
            <strong>{achievements.length}</strong>
          </article>
          <article className="panel">
            <span>Milestones reached</span>
            <strong>{totalMilestones}</strong>
          </article>
          <article className="panel">
            <span>Experiments completed</span>
            <strong>{completedExperiments}</strong>
          </article>
        </section>
        <section className="achievement-list">
          {achievements.map((experiment, index) => (
            <article className="achievement-card panel" key={experiment.id}>
              <span className="achievement-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="achievement-card-copy">
                <span className="category">{experiment.category}</span>
                <h2>{experiment.achievement}</h2>
                <p>{experiment.name}</p>
                <div className="achievement-details">
                  <span>{experiment.milestones} milestones</span>
                  <span>{experiment.hours} tracked hours</span>
                  <span>{experiment.progress}% progress</span>
                </div>
                {experiment.lessons && (
                  <blockquote>{experiment.lessons}</blockquote>
                )}
              </div>
              <button
                className="button quiet"
                onClick={() => {
                  setEditingExperiment(experiment);
                  setModal("experiment");
                }}
              >
                Open experiment
              </button>
            </article>
          ))}
        </section>
        {!achievements.length && (
          <Empty
            icon="★"
            title="Your first win belongs here"
            copy="Add an achievement to any experiment and it will appear automatically."
            action="Open experiments"
            onClick={() => go("experiments")}
          />
        )}
      </>
    );
  }
  function Planner() {
    const blocks = data.blocks
      .filter((b) => b.date === plannerDate)
      .sort((a, b) => a.start.localeCompare(b.start));
    return (
      <>
        <header className="page-head">
          <div>
            <p className="eyebrow">
              Daily planner · {data.interval}-minute rhythm
            </p>
            <h1>
              {plannerDate === today
                ? "Today’s plan."
                : plannerDate === day(1)
                  ? "Plan tomorrow."
                  : "Plan the day."}
            </h1>
          </div>
          <button
            className="button primary"
            onClick={() =>
              setEditingBlock({
                id: "",
                date: plannerDate,
                start: "09:00",
                end: "09:30",
                title: "",
                status: "planned",
              })
            }
          >
            + Add block
          </button>
        </header>
        <section className="planner-toolbar">
          <button
            aria-label="Previous day"
            onClick={() => setPlannerDate((value) => shiftDate(value, -1))}
          >
            <StaticIcon name="chevron-left" size={16} />
          </button>
          <input
            aria-label="Planner date"
            type="date"
            value={plannerDate}
            onChange={(e) => setPlannerDate(e.target.value)}
          />
          <button
            aria-label="Next day"
            onClick={() => setPlannerDate((value) => shiftDate(value, 1))}
          >
            <StaticIcon name="chevron-right" size={16} />
          </button>
          <span>{prettyDate(plannerDate)}</span>
          <button
            className="text-button today-control"
            onClick={() => setPlannerDate(today)}
          >
            Today
          </button>
        </section>
        <section className="panel planner-panel">
          <div className="planner-intro">
            <div>
              <p className="eyebrow">Original plan stays intact</p>
              <h2>
                {plannerDate === today
                  ? "Today’s timeline"
                  : "Your planned day"}
              </h2>
            </div>
          </div>
          {blocks.length ? (
            <Timeline
              blocks={blocks}
              onEdit={(b) => setEditingBlock(b)}
              onOpen={setFocusBlock}
              onStart={beginTimer}
            />
          ) : (
            <Empty
              icon="＋"
              title="Open space, on purpose"
              copy="Add your first time block, then let the day take shape."
              action="Add a block"
              onClick={() =>
                setEditingBlock({
                  id: "",
                  date: plannerDate,
                  start: "09:00",
                  end: "09:30",
                  title: "",
                  status: "planned",
                })
              }
            />
          )}
        </section>
      </>
    );
  }
  function Experiments({ archived }: { archived: boolean }) {
    const items = archived ? archivedExperiments : activeExperiments;
    return (
      <>
        <header className="page-head">
          <div>
            <p className="eyebrow">
              {archived ? "History, not clutter" : "Your working bets"}
            </p>
            <h1>{archived ? "Archive" : "Experiments"}</h1>
          </div>
          <div className="header-actions experiment-actions">
            <button
              className="button quiet"
              onClick={() => go(archived ? "experiments" : "archive")}
            >
              {archived ? "← Experiments" : "Archive"}
            </button>
            {!archived && (
              <button
                className="button primary"
                onClick={() => {
                  setEditingExperiment(null);
                  setModal("experiment");
                }}
              >
                + Add experiment
              </button>
            )}
          </div>
        </header>
        {items.length ? (
          <section className="experiment-list">
            {items.map((exp) => (
              <article className="panel experiment-card" key={exp.id}>
                <div className="experiment-top">
                  <div>
                    <span className="category">{exp.category}</span>
                    <h2>{exp.name}</h2>
                    <p>
                      Started {prettyDate(exp.startDate)} · {exp.hours} hours
                      invested
                    </p>
                  </div>
                  <button
                    className="button quiet"
                    onClick={() => {
                      setEditingExperiment(exp);
                      setModal("experiment");
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div className="experiment-progress">
                  <Progress value={exp.progress} />
                  <strong>{exp.progress}%</strong>
                </div>
                <div className="experiment-details">
                  <div>
                    <small>Milestones</small>
                    <b>{exp.milestones} reached</b>
                  </div>
                  {exp.target && (
                    <div>
                      <small>Money target</small>
                      <b>{money(exp.target)}</b>
                    </div>
                  )}
                  <div>
                    <small>Status</small>
                    <b className={`status-text ${exp.status}`}>{exp.status}</b>
                  </div>
                </div>
                <div className="notes-grid">
                  <div>
                    <small>Results</small>
                    <p>{exp.achievement || "No results recorded yet."}</p>
                  </div>
                  <div>
                    <small>Lesson</small>
                    <p>{exp.lessons || "No lesson recorded yet."}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="panel">
            <Empty
              icon="◌"
              title={
                archived ? "Nothing archived yet" : "Start with one useful bet"
              }
              copy={
                archived
                  ? "Paused and completed experiments will live here with their lessons intact."
                  : "An experiment can be a role search, client work, a side hustle, or anything you are testing."
              }
              action={archived ? undefined : "Add experiment"}
              onClick={() => {
                setEditingExperiment(null);
                setModal("experiment");
              }}
            />
          </section>
        )}
      </>
    );
  }
  function Weekly() {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const ws = weekStart.toISOString().slice(0, 10);
    const blocks = data.blocks.filter((b) => b.date >= ws && b.date <= today);
    const planned = blocks.reduce((s, b) => s + minutes(b.start, b.end), 0);
    const actual = blocks.reduce((s, b) => s + (b.actualMinutes || 0), 0);
    const split = activeExperiments
      .map((exp) => ({
        exp,
        mins: blocks
          .filter((b) => b.experimentId === exp.id)
          .reduce((s, b) => s + (b.actualMinutes || 0), 0),
      }))
      .filter((x) => x.mins);
    const incomeWeek = data.income
      .filter((i) => i.date >= ws)
      .reduce((s, i) => s + i.amount, 0);
    const outcome: Status[] = ["completed", "partial", "changed", "skipped"];
    return (
      <>
        <header className="page-head">
          <div>
            <p className="eyebrow">Automatic readout · last 7 days</p>
            <h1>Weekly summary</h1>
          </div>
          <span className="date-range">
            {prettyDate(ws)} – {prettyDate(today)}
          </span>
        </header>
        <section className="weekly-top">
          <article className="panel visual-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Hours</p>
                <h2>Plan versus actual</h2>
              </div>
            </div>
            <HoursVisual planned={planned} actual={actual} />
            <div className="legend">
              <span>
                <i className="planned" /> Planned {Math.round(planned / 6) / 10}
                h
              </span>
              <span>
                <i className="actual" /> Actual {Math.round(actual / 6) / 10}h
              </span>
            </div>
          </article>
          <article className="panel weekly-income">
            <p className="eyebrow">Income logged</p>
            <strong>{money(incomeWeek)}</strong>
            <p>this week</p>
            <Progress value={incomePct} />
            <small>
              {money(earned)} of {money(data.incomeTarget)} overall
            </small>
          </article>
        </section>
        <section className="weekly-grid">
          <article className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Actual time split</p>
                <h2>Where your hours went</h2>
              </div>
            </div>
            {split.length ? (
              <div className="split-list">
                {split.map(({ exp, mins }) => (
                  <div key={exp.id}>
                    <span>{exp.name}</span>
                    <b>{Math.round(mins / 6) / 10}h</b>
                    <Progress value={actual ? (mins / actual) * 100 : 0} />
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                icon="◷"
                title="No tracked time yet"
                copy="Finish a planned block to see the split."
              />
            )}
          </article>
          <article className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Block outcomes</p>
                <h2>How the plan changed</h2>
              </div>
            </div>
            <div className="outcomes">
              {outcome.map((s) => (
                <div key={s}>
                  <b>{blocks.filter((b) => b.status === s).length}</b>
                  <span>{s === "partial" ? "Partly done" : s}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Active progress</p>
              <h2>Experiments, this week</h2>
            </div>
          </div>
          <div className="experiment-strip">
            {activeExperiments.map((exp) => (
              <div className="experiment-mini" key={exp.id}>
                <span className="category">{exp.category}</span>
                <h3>{exp.name}</h3>
                <div className="mini-progress">
                  <Progress value={exp.progress} />
                  <span>{exp.progress}%</span>
                </div>
                <small>{exp.hours} total tracked hours</small>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }
  function FocusSession({ block }: { block: Block }) {
    const exp = experimentFor(block.experimentId);
    const isThisTimer = timerBlock?.id === block.id;
    const canTrack = block.status === "planned" || block.status === "active";
    const statusLabel =
      block.status === "completed"
        ? "Completed"
        : block.status === "partial"
          ? "Partly completed"
          : block.status === "changed"
            ? "Changed task"
            : block.status === "skipped"
              ? "Skipped"
              : block.status === "active"
                ? "In progress"
                : "Ready to begin";
    return (
      <section className="focus-session-page" aria-label="Focus session">
        <header className="focus-session-head">
          <button
            className="focus-back"
            onClick={() => setFocusBlock(null)}
            aria-label="Back to planner"
          >
            <StaticIcon name="chevron-left" size={16} />
            Back to plan
          </button>
          <span
            className={`focus-state ${timerRunning && isThisTimer ? "live" : ""}`}
          >
            <i />
            {timerRunning && isThisTimer ? "Focus session live" : statusLabel}
          </span>
        </header>
        <div className="focus-session-wrap">
          <article className="focus-session-card">
            <div className="focus-task-copy">
              <p className="eyebrow">{exp?.category || "Personal focus"}</p>
              <h1>{block.title}</h1>
              <p>{exp?.name || "Personal"}</p>
            </div>
            <div className="focus-meta">
              <span>
                <small>Planned time</small>
                <strong>
                  {block.start} – {block.end}
                </strong>
              </span>
              <span>
                <small>Planned length</small>
                <strong>{minutes(block.start, block.end)} min</strong>
              </span>
              <span>
                <small>Status</small>
                <strong>{statusLabel}</strong>
              </span>
            </div>
            <div className="focus-clock" aria-live="polite">
              <small>
                {timerRunning && isThisTimer ? "Time in focus" : "Session time"}
              </small>
              <strong>
                {isThisTimer
                  ? formatTime(timerSeconds)
                  : formatTime((block.actualMinutes || 0) * 60)}
              </strong>
              <div
                className={`focus-pulse-line ${timerRunning && isThisTimer ? "moving" : ""}`}
              >
                <span />
              </div>
            </div>
            <div className="focus-controls">
              {canTrack && !isThisTimer && (
                <button
                  className="button primary focus-primary"
                  onClick={() => beginTimer(block)}
                >
                  <StaticIcon name="play" size={14} /> Start session
                </button>
              )}
              {isThisTimer && timerRunning && (
                <button
                  className="button stop-button focus-primary"
                  onClick={stopTimer}
                >
                  <span className="stop-square" /> Stop &amp; check in
                </button>
              )}
              {isThisTimer && !timerRunning && (
                <>
                  <button
                    className="button primary focus-primary"
                    onClick={() => setTimerRunning(true)}
                  >
                    <StaticIcon name="play" size={14} /> Resume session
                  </button>
                  <button
                    className="button quiet"
                    onClick={() => setModal("checkin")}
                  >
                    End &amp; check in
                  </button>
                </>
              )}
              <button
                className="text-button focus-edit"
                onClick={() => {
                  setPlannerDate(block.date);
                  setEditingBlock(block);
                }}
              >
                Edit task details
              </button>
            </div>
            {block.note && <p className="focus-note">“{block.note}”</p>}
          </article>
        </div>
      </section>
    );
  }
  function Timeline({
    blocks,
    compact = false,
    onEdit,
    onOpen,
    onStart,
  }: {
    blocks: Block[];
    compact?: boolean;
    onEdit: (b: Block) => void;
    onOpen: (b: Block) => void;
    onStart: (b: Block) => void;
  }) {
    return (
      <div className={compact ? "task-stack compact" : "task-stack"}>
        {blocks.map((b) => {
          const exp = experimentFor(b.experimentId);
          const overdue = isBlockOverdue(b, today);
          return (
            <article
              className={`task-card ${b.status}${overdue ? " overdue" : ""}`}
              key={b.id}
            >
              <button className="task-card-main" onClick={() => onOpen(b)}>
                <span className="task-time">
                  <strong>{b.start}</strong>
                  <i />
                  <span>{b.end}</span>
                </span>
                <span className="task-copy">
                  <small>{exp?.category || "Personal focus"}</small>
                  <strong>{b.title}</strong>
                  <span>
                    {exp?.name || "Personal"} · {minutes(b.start, b.end)} min
                  </span>
                </span>
              </button>
              <div className="task-card-end">
                <span className={`block-status ${b.status}`}>
                  {overdue
                    ? "Overdue"
                    : b.status === "completed"
                      ? "Done"
                      : b.status === "partial"
                        ? "Partly"
                        : b.status === "changed"
                          ? "Changed"
                          : b.status === "skipped"
                            ? "Skipped"
                            : b.status === "active"
                              ? "In progress"
                              : "Planned"}
                </span>
                <button
                  className="task-edit"
                  onClick={() => onEdit(b)}
                  aria-label={`Edit ${b.title}`}
                >
                  Edit
                </button>
                {b.status === "planned" || b.status === "active" ? (
                  <button
                    className="play-button"
                    onClick={() =>
                      timerBlock?.id === b.id ? onOpen(b) : onStart(b)
                    }
                    aria-label={
                      timerBlock?.id === b.id
                        ? `Open ${b.title} focus session`
                        : `Start ${b.title}`
                    }
                  >
                    {timerBlock?.id === b.id ? (
                      <span className="timer-indicator" />
                    ) : (
                      <StaticIcon name="play" size={12} />
                    )}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    );
  }
  function Checkin() {
    const [note, setNote] = useState("");
    return (
      <Modal
        title="How did it go?"
        onClose={() => {
          setModal(null);
        }}
      >
        <p className="checkin-copy">
          A brief check-in keeps the plan honest without making it heavy.
        </p>
        <div className="checkin-actions">
          <button onClick={() => finishCheckin("completed", note)}>
            <span>✓</span>Completed
          </button>
          <button onClick={() => finishCheckin("partial", note)}>
            <span>◐</span>Partly completed
          </button>
          <button onClick={() => finishCheckin("changed", note)}>
            <span>↝</span>Changed task
          </button>
          <button onClick={() => finishCheckin("skipped", note)}>
            <span>–</span>Skipped
          </button>
        </div>
        <label className="check-note">
          Optional note
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A sentence is enough."
          />
        </label>
      </Modal>
    );
  }
}

function Progress({ value }: { value: number }) {
  return (
    <div className="progress">
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
function HoursVisual({ planned, actual }: { planned: number; actual: number }) {
  const max = Math.max(planned, actual, 60);
  const hours = (value: number) => `${Math.round(value / 6) / 10}h`;
  return (
    <div className="bar-visual">
      <div>
        <span style={{ height: `${Math.max(8, (planned / max) * 100)}%` }}>
          <b className="bar-value">{hours(planned)}</b>
        </span>
        <small>Plan</small>
      </div>
      <div>
        <span
          className="actual-bar"
          style={{ height: `${Math.max(8, (actual / max) * 100)}%` }}
        >
          <b className="bar-value">{hours(actual)}</b>
        </span>
        <small>Actual</small>
      </div>
    </div>
  );
}
function Empty({
  icon,
  title,
  copy,
  action,
  onClick,
}: {
  icon: string;
  title: string;
  copy: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
      {action && (
        <button className="text-button" onClick={onClick}>
          {action} →
        </button>
      )}
    </div>
  );
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-title">
          <h2>{title}</h2>
          <button className="close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
