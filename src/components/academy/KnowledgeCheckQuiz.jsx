import { useMemo, useState } from "react";

function shuffleOptions(options, correctIndex) {
  const labeled = options.map((text, index) => ({ text, isCorrect: index === correctIndex }));
  for (let i = labeled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [labeled[i], labeled[j]] = [labeled[j], labeled[i]];
  }
  return labeled;
}

export function buildQuestionsFromModule(module) {
  const questions = [];
  const lessons = Array.isArray(module.lessons) ? module.lessons : [];
  const lessonTitles = lessons.map((lesson) => (typeof lesson === "string" ? lesson : lesson.title)).filter(Boolean);

  lessonTitles.slice(0, 3).forEach((title, index) => {
    const distractors = lessonTitles.filter((item) => item !== title).slice(0, 2);
    while (distractors.length < 3) {
      distractors.push(`Topic not covered in module ${module.moduleNumber}`);
    }
    questions.push({
      id: `lesson-${index + 1}`,
      prompt: `Which of the following is a learning objective for this module?`,
      options: [title, ...distractors.slice(0, 3)],
      correctIndex: 0,
    });
  });

  if (module.objective) {
    questions.push({
      id: "objective",
      prompt: `What is the primary objective of "${module.title}"?`,
      options: [
        module.objective,
        "Skip safety procedures to increase production speed",
        "Avoid documentation and field verification",
        "Complete work without knowledge checks",
      ],
      correctIndex: 0,
    });
  }

  if (module.practicalLab || module.lab) {
    questions.push({
      id: "lab",
      prompt: "What practical lab activity supports this module?",
      options: [
        module.practicalLab || module.lab,
        "No hands-on activity is required",
        "Only watch a video with no field application",
        "Submit a blank worksheet",
      ],
      correctIndex: 0,
    });
  }

  questions.push({
    id: "pass-rule",
    prompt: "What score is required to pass this module knowledge check?",
    options: ["80 percent or higher", "50 percent or higher", "No minimum score", "100 percent only"],
    correctIndex: 0,
  });

  return questions.slice(0, 5);
}

const panelStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
};

export default function KnowledgeCheckQuiz({ module, onSubmit, busy = false }) {
  const questions = useMemo(() => buildQuestionsFromModule(module), [module]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const prepared = useMemo(
    () => questions.map((question) => ({
      ...question,
      shuffled: shuffleOptions(question.options, question.correctIndex),
    })),
    [questions],
  );

  function setAnswer(questionId, optionIndex) {
    if (submitted) return;
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
  }

  function computeScore() {
    let correct = 0;
    prepared.forEach((question) => {
      const selected = answers[question.id];
      if (selected === undefined) return;
      if (question.shuffled[selected]?.isCorrect) correct += 1;
    });
    return Math.round((correct / Math.max(prepared.length, 1)) * 100);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const score = computeScore();
    setSubmitted(true);
    if (onSubmit) {
      await onSubmit(score);
    }
  }

  const score = submitted ? computeScore() : null;
  const passed = score !== null && score >= 80;

  return (
    <form onSubmit={handleSubmit} style={panelStyle}>
      <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Knowledge Check</div>
      <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
        {module.knowledgeCheck || "Answer all questions. A score of 80 percent or higher is required to complete this module."}
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {prepared.map((question, qIndex) => (
          <fieldset key={question.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, margin: 0 }}>
            <legend style={{ fontWeight: 700, padding: "0 6px" }}>
              Question {qIndex + 1}
            </legend>
            <p style={{ color: "#334155", lineHeight: 1.65 }}>{question.prompt}</p>
            <div style={{ display: "grid", gap: 8 }}>
              {question.shuffled.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                let border = "#e2e8f0";
                let background = "#fff";
                if (submitted) {
                  if (option.isCorrect) {
                    border = "#16a34a";
                    background = "#f0fdf4";
                  } else if (selected) {
                    border = "#dc2626";
                    background = "#fef2f2";
                  }
                } else if (selected) {
                  border = "#2563eb";
                  background = "#eff6ff";
                }
                return (
                  <label
                    key={`${question.id}-${optionIndex}`}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      border: `1px solid ${border}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      background,
                      cursor: submitted ? "default" : "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={selected}
                      disabled={submitted}
                      onChange={() => setAnswer(question.id, optionIndex)}
                    />
                    <span style={{ color: "#334155", lineHeight: 1.6 }}>{option.text}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {submitted ? (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: passed ? "#f0fdf4" : "#fef2f2", border: `1px solid ${passed ? "#86efac" : "#fecaca"}` }}>
          <strong style={{ color: passed ? "#15803d" : "#991b1b" }}>
            Score: {score}% {passed ? "- Passed" : "- Did not pass (80% required)"}
          </strong>
        </div>
      ) : (
        <button
          type="submit"
          disabled={busy || Object.keys(answers).length < prepared.length}
          style={{ marginTop: 16, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}
        >
          {busy ? "Submitting..." : "Submit knowledge check"}
        </button>
      )}
    </form>
  );
}
