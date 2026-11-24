import { PageSnapshot } from "../schemas/snapshot.js";
import { TaskModel, TaskStep, TaskKind } from "../schemas/taskmodel.js";

export function buildTaskModel(snapshot: PageSnapshot): TaskModel {
  // If the page contains a substantial table and few or no form fields -> "table"
  if (snapshot.tables.length > 0 && snapshot.fields.length <= 2) {
    return {
      schemaVersion: "1.0",
      taskKind: "table",
      title: snapshot.title || "Transaction Records",
      steps: [
        {
          stepId: "step_table_view",
          fieldRefs: [],
          required: false,
          groupLabel: snapshot.tables[0].caption || "Statement View",
          errorRefs: [],
          confidence: "high",
        },
      ],
      finalActionRef: null,
      finalActionDestructive: "safe",
    };
  }

  // Otherwise, it's a form task
  const steps: TaskStep[] = [];
  let stepIndex = 1;

  for (const field of snapshot.fields) {
    // Find matching group label
    let groupLabel = "Details";
    if (field.groupRef) {
      const grp = snapshot.groups.find((g) => g.ref === field.groupRef);
      if (grp && grp.legend) {
        groupLabel = grp.legend;
      }
    }

    steps.push({
      stepId: `step_${stepIndex++}`,
      fieldRefs: [field.ref],
      required: field.required,
      groupLabel,
      errorRefs: field.state.invalid ? [`err_${field.ref}`] : [],
      confidence: field.nameConfidence,
    });
  }

  // Find primary submit action
  const submitAction = snapshot.actions.find((a) => a.kind === "submit") || snapshot.actions[0] || null;

  return {
    schemaVersion: "1.0",
    taskKind: snapshot.fields.length > 0 ? "form" : "unknown",
    title: snapshot.headings[0]?.text || snapshot.title || "Form Application",
    steps,
    finalActionRef: submitAction ? submitAction.ref : null,
    finalActionDestructive: submitAction?.destructive || "unknown",
  };
}
