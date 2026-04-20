import { Router, Request, Response } from "express";
import { Deanery } from "../models/deaneryModels";
import { parseIntIdParam } from "../utils/paramUtils";

const router = Router();

// Dummy deaneries
const deaneries: Deanery[] = [
  {
    deaneryId: 1,
    deaneryName: "East of England",
    places: 898,
    applicants: 580,
    ratio: 0.6,
  },
  {
    deaneryId: 2,
    deaneryName: "Kent, Surrey & Sussex (KSS)",
    places: 696,
    applicants: 665,
    ratio: 0.95,
  },
  {
    deaneryId: 3,
    deaneryName: "Leicestershire, Northamptonshire & Rutland (LNR)",
    places: 317,
    applicants: 227,
    ratio: 0.68,
  },
  {
    deaneryId: 4,
    deaneryName: "London",
    places: 1238,
    applicants: 2200,
    ratio: 2.07,
  },
  {
    deaneryId: 5,
    deaneryName: "North West of England",
    places: 1062,
    applicants: 1437,
    ratio: 1.42,
  },
  {
    deaneryId: 6,
    deaneryName: "Northern",
    places: 520,
    applicants: 490,
    ratio: 0.94,
  },
  {
    deaneryId: 7,
    deaneryName: "Northern Ireland",
    places: 412,
    applicants: 349,
    ratio: 0.84,
  },
  {
    deaneryId: 8,
    deaneryName: "Peninsula",
    places: 313,
    applicants: 271,
    ratio: 0.86,
  },
  {
    deaneryId: 9,
    deaneryName: "Scotland",
    places: 1109,
    applicants: 1117,
    ratio: 1.01,
  },
  {
    deaneryId: 10,
    deaneryName: "Severn",
    places: 405,
    applicants: 496,
    ratio: 1.24,
  },
  {
    deaneryId: 11,
    deaneryName: "Thames Valley Oxford",
    places: 364,
    applicants: 596,
    ratio: 1.69,
  },
  {
    deaneryId: 12,
    deaneryName: "Trent",
    places: 505,
    applicants: 237,
    ratio: 0.43,
  },
  {
    deaneryId: 13,
    deaneryName: "Wales",
    places: 463,
    applicants: 303,
    ratio: 0.64,
  },
  {
    deaneryId: 14,
    deaneryName: "Wessex",
    places: 417,
    applicants: 252,
    ratio: 0.58,
  },
  {
    deaneryId: 15,
    deaneryName: "West Midlands Central",
    places: 297,
    applicants: 330,
    ratio: 1.16,
  },
  {
    deaneryId: 16,
    deaneryName: "West Midlands North",
    places: 446,
    applicants: 171,
    ratio: 0.35,
  },
  {
    deaneryId: 17,
    deaneryName: "West Midlands South",
    places: 294,
    applicants: 159,
    ratio: 0.52,
  },
  {
    deaneryId: 18,
    deaneryName: "Yorkshire and Humber",
    places: 878,
    applicants: 758,
    ratio: 0.84,
  },
];
// Get all deaneries
router.get("/", (req: Request, res: Response) => {
  res.json(deaneries);
});

// Get a single deanery by ID
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedId = parseIntIdParam(id);
  const deanery = deaneries.find((d) => d.deaneryId === parsedId);

  if (!deanery) {
    res.status(404).json({ message: "Deanery not found" });
    return;
  }
  res.json(deanery);
});

export default router;
