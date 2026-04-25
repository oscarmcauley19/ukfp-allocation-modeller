import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { DetailedSimulationResult } from "../models/simultation";

export const ResultDisplay = ({
  results,
}: {
  results: DetailedSimulationResult[];
}) => {
  if (results) {
    return (
      <TableContainer component={Paper}>
        <Table
          aria-label="simple table"
          sx={{
            ".MuiTableRow-head": {
              backgroundColor: (theme) => theme.palette.primary.main,
            },
            ".MuiTableCell-head": {
              color: "white",
              fontWeight: "bold",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Deanery</TableCell>
              <TableCell>Probability</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((row) => (
              <TableRow
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>{`${(row.chance * 100).toFixed(1)}%`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
};
