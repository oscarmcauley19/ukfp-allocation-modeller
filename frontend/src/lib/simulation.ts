import { DeaneryModel } from "../models/deanery";
import {
  DetailedSimulationResult,
  SimulationJobResponse,
  SimulationResults,
} from "../models/simultation";

export async function createSimulationJob(
  ranking: number[],
  runs: number,
): Promise<string | null> {
  const response = await fetch("/api/job", {
    method: "POST",
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin,
    body: JSON.stringify({ user_ranking: ranking, runs }),
  });
  const jsonResponse: SimulationJobResponse = await response.json();
  return jsonResponse.job_id;
}

export async function getSimulationResults(
  jobId: string,
  runs: number,
  deaneries: DeaneryModel[],
): Promise<DetailedSimulationResult[]> {
  const response = await fetch(`/api/job/${jobId}`, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
  });
  if (!response.ok) {
    throw new Error(
      `Error fetching simulation results: ${response.statusText}`,
    );
  }
  const jsonResponse: SimulationResults = await response.json();
  const ids = Object.keys(jsonResponse);
  const detailedResults: DetailedSimulationResult[] = ids.map((id: string) => {
    const intId: number = parseInt(id);
    return {
      id: intId,
      name: deaneries[intId - 1].deaneryName,
      chance: (1.0 * jsonResponse[intId]) / runs,
    };
  });
  const sortedResults = detailedResults.sort((a, b) => b.chance - a.chance);
  return sortedResults;
}
