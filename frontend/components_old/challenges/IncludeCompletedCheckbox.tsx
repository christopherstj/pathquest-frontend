// "use client";
// import { useChallengeDashboard } from "@/state/ChallengeDashboardContext";
// import { Checkbox, FormControlLabel, Typography } from "@mui/material";
// import React from "react";

// const IncludeCompletedCheckbox = () => {
//     const [{ includeCompleted }, setChallengeDashboardState] =
//         useChallengeDashboard();

//     return (
//         <FormControlLabel
//             control={
//                 <Checkbox
//                     checked={includeCompleted}
//                     onChange={(e) =>
//                         setChallengeDashboardState((state) => ({
//                             ...state,
//                             includeCompleted: e.target.checked,
//                         }))
//                     }
//                     sx={{
//                         ".MuiSvgIcon-root": {
//                             color: "primary.onContainerDim",
//                         },
//                     }}
//                 />
//             }
//             label={
//                 <Typography variant="body2" color="primary.onContainerDim">
//                     Show completed challenges
//                 </Typography>
//             }
//         />
//     );
// };

// export default IncludeCompletedCheckbox;
