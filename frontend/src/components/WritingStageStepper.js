import React, { useMemo } from "react";

const WORKFLOW_STEPS = [
  { key: "discussion", label: "Discussion" },
  { key: "summary", label: "Summary" },
  { key: "outline", label: "Outline" },
  { key: "finalWriting", label: "Final Writing" },
];

const buildCheckedStateFromInitialStep = (initialStep) => {
  const step = Number.isFinite(Number(initialStep)) ? Number(initialStep) : 1;
  return {
    discussion: true,
    summary: step > 2,
    outline: step > 3,
    finalWriting: step > 4,
  };
};

const normalizeCheckedStages = (checkedStages, initialStep) => {
  if (!checkedStages || typeof checkedStages !== "object") {
    return buildCheckedStateFromInitialStep(initialStep);
  }

  return {
    discussion: true,
    summary: Boolean(checkedStages.summary),
    outline: Boolean(checkedStages.outline),
    finalWriting: Boolean(checkedStages.finalWriting),
  };
};

const resolveCurrentStepKey = (checkedStages) => {
  if (checkedStages.finalWriting) return "finalWriting";
  if (checkedStages.outline) return "outline";
  if (checkedStages.summary) return "summary";
  return "discussion";
};

export default function WritingStageStepper({ initialStep = 4, checkedStages }) {
  const normalizedCheckedStages = useMemo(
    () => normalizeCheckedStages(checkedStages, initialStep),
    [checkedStages, initialStep]
  );
  const currentStepKey = useMemo(
    () => resolveCurrentStepKey(normalizedCheckedStages),
    [normalizedCheckedStages]
  );

  return (
    <div
      style={{
        margin: "10px 8px 6px",
        padding: "10px",
        border: "1px solid #d7d0c9",
        borderRadius: "12px",
        backgroundColor: "#f9fbff",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.4px",
          color: "#1d4f91",
          marginBottom: "8px",
        }}
      >
        Writing Stages
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {WORKFLOW_STEPS.map(({ key, label }, index) => {
          const isDone = Boolean(normalizedCheckedStages[key]);
          const isCurrent = key === currentStepKey;
          const isLast = index === WORKFLOW_STEPS.length - 1;

          return (
            <div key={label}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      border: isCurrent ? "3px solid #0a5fb4" : "2px solid transparent",
                      backgroundColor: isDone ? "#0a5fb4" : isCurrent ? "#ffffff" : "#e6edf5",
                      color: isDone ? "#ffffff" : isCurrent ? "#0a5fb4" : "#6b7280",
                    }}
                  >
                    {isDone ? "\u2713" : ""}
                  </div>
                  {!isLast ? (
                    <div
                      style={{
                        width: "4px",
                        height: "18px",
                        marginTop: "2px",
                        marginBottom: "2px",
                        borderRadius: "2px",
                        backgroundColor: isDone ? "#0a5fb4" : "#dbe4ee",
                      }}
                    />
                  ) : null}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: isDone ? 700 : 400,
                    color: isCurrent || isDone ? "#0a5fb4" : "#5f6368",
                    paddingTop: "4px",
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
