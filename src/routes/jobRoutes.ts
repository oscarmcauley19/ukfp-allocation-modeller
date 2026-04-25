import { Router, Request, Response } from "express";
import publishTask from "../lib/celeryPublisher";
import { getJobResultById } from "../queries/jobQueries";
import { startJobSchema } from "../schemas/jobSchemas";
import { validatePostRequest } from "../utils/validation";
import { parseIdParam } from "../utils/paramUtils";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const validationResult = validatePostRequest(req, res, startJobSchema);
  if (validationResult) {
    res.status(validationResult.code).json(validationResult.json);
  }

  // Publish a Celery-compatible task message to RabbitMQ and return the
  // generated task id. The Python Celery worker (registered task
  // `celery_app.run_simulation`) will pick up and execute this task.
  try {
    const taskId = await publishTask("celery_app.run_simulation", [
      req.body.user_ranking,
      req.body.runs,
    ]);
    res.json({ job_id: taskId });
  } catch (err) {
    console.error("Failed to publish task:", err);
    res.status(500).json({ error: "Failed to enqueue job" });
  }
});

router.get("/:jobId", async (req: Request, res: Response) => {
  const { jobId } = req.params;
  try {
    const jobIdParsed = parseIdParam(jobId);
    const status = await getJobResultById(jobIdParsed);
    if (!status) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(status);
  } catch (error) {
    console.error(`Error retrieving job ${jobId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
