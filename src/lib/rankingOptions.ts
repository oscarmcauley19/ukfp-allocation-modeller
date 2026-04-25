import { DeaneryModel } from "../models/deanery";

export async function getOptions(): Promise<DeaneryModel[] | null> {
  console.log("Calling API");
  const response = await fetch("/api/deanery", {
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin,
  });
  const jsonResponse = response.json();
  return jsonResponse;
}
