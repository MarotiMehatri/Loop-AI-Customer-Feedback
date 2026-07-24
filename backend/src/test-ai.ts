import {
  askLoopService,
  classificationService,
  retrievalService,
} from "./ai/index.js";

async function test(): Promise<void> {
  try {
    await retrievalService.indexDocuments([
      {
        id: "feedback-1",
        workspaceId: "workspace-1",
        title: "Mobile application issue",
        source: "App Store",
        content:
          "The mobile application crashes whenever I try to upload a photo.",
      },

      {
        id: "feedback-2",
        workspaceId: "workspace-1",
        title: "Dark mode request",
        source: "Survey",
        content:
          "Please add dark mode because the dashboard is too bright at night.",
      },

      {
        id: "feedback-3",
        workspaceId: "workspace-1",
        title: "Positive support feedback",
        source: "Support",
        content:
          "The customer support team resolved my payment problem very quickly.",
      },
    ]);

    const classification = await classificationService.classifyFeedback(
      "The application crashes whenever I upload a profile image.",
    );

    console.log("Classification:", classification);

    const answer = await askLoopService.ask({
      workspaceId: "workspace-1",
      userId: "user-1",
      question: "What technical problems are customers reporting?",
    });

    console.log("Ask LOOP result:", answer);
  } catch (error) {
    console.error("AI test failed:", error);
    process.exitCode = 1;
  }
}

void test();
