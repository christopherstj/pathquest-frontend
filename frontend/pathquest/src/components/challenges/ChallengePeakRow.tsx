// import hexToRgb from "@/helpers/hexToRgb";
// import Activity from "@/typeDefs/Activity";
// import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
// import { Box, ButtonBase, IconButton, ListItem, ListItemAvatar, SxProps, Theme, Typography } from "@mui/material";
// import Link from "next/link";
// import React from "react";

// const rowStyles: SxProps<Theme> = (theme) => ({
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     gap: "12px",
//     padding: "8px",
//     borderRadius: "12px",
//     backgroundColor: "primary.containerDim",
//     position: "relative",
//     overflow: "hidden",
//     minHeight: "54px",
//     width: {
//         xs: "100%",
//         md: "auto",
//     },
//     transition: "box-shadow 0.2s",
//     cursor: "pointer",
//     marginBottom: "8px",
//     "&:hover": {
//         boxShadow: `0px 3px 3px -2px rgba(${hexToRgb(
//             theme.palette.primary.base
//         )}, 0.2), 0px 3px 4px 0px rgba(${hexToRgb(
//             theme.palette.primary.base
//         )}, 0.14), 0px 1px 8px 0px rgba(${hexToRgb(
//             theme.palette.primary.base
//         )}, 0.12);`,
//     },
// });

// type Props = {
//     peak: UnclimbedPeak;
//     onRowClick: (lat: number, long: number) => void;
//     onFavoriteClick: (peakId: string, newValue: boolean) => void;
// };

// const ChallengePeakRow = ({ peak, onRowClick, onFavoriteClick }: Props) => {
//     const color =
//         (peak.Altitude ?? 0) < 1000
//             ? "primary"
//             : (peak.Altitude ?? 0) < 3000
//             ? "secondary"
//             : "tertiary";

//     return (
//         <ListItem
//             sx={{
//                 paddingLeft: "0",
//                 paddingRight: "0",
//                 gap: "8px",
//                 cursor: "pointer",
//             }}
//             onClick={() => onRowClick(peak.Lat, peak.Long)}
//         >
//             <ListItemAvatar sx={{ minWidth: "32px" }}>
//                 {!peak.isSummitted ? (
//                     <IconButton
//                         color={rowColor}
//                         size="small"
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             onFavoriteClick(peak.Id, !peak.isFavorited);
//                         }}
//                     >
//                         {peak.isFavorited ? (
//                             <Star
//                                 sx={{
//                                     color: "tertiary.onContainerDim",
//                                 }}
//                             />
//                         ) : (
//                             <StarBorder
//                                 sx={{
//                                     color: `${rowColor}.onContainerDim`,
//                                 }}
//                             />
//                         )}
//                     </IconButton>
//                 ) : (
//                     <Avatar
//                         sx={{
//                             backgroundColor: `${rowColor}.containerDim`,
//                             color: `${rowColor}.onContainerDim`,
//                             width: "32px",
//                             height: "32px",
//                         }}
//                     >
//                         <Check sx={{ color: `${rowColor}.onContainerDim` }} />
//                     </Avatar>
//                 )}
//             </ListItemAvatar>
//             <ListItemText
//                 sx={{
//                     flex: 1,
//                 }}
//                 primary={
//                     <Typography
//                         variant="body1"
//                         fontWeight="bold"
//                         color={`${rowColor}.onContainerDim`}
//                     >
//                         {peak.Name}
//                     </Typography>
//                 }
//                 secondary={
//                     <Typography
//                         variant="caption"
//                         color={`${rowColor}.onContainerDim`}
//                     >
//                         {peak.Country ? `${peak.Country}` : ""}
//                         {peak.State ? ` | ${peak.State}` : ""}
//                         {peak.County ? ` | ${peak.County}` : ""}
//                     </Typography>
//                 }
//             />
//             {peak.Altitude && (
//                 <Box
//                     sx={{
//                         backgroundColor: `${color}.onContainerDim`,
//                         padding: {
//                             xs: "4px",
//                             md: "8px",
//                         },
//                         borderRadius: "8px",
//                         flexShrink: 0,
//                     }}
//                 >
//                     <Typography
//                         variant="body1"
//                         color={`${color}.containerDim`}
//                         fontWeight="bold"
//                         sx={{
//                             fontSize: {
//                                 xs: "0.825rem",
//                                 md: "1rem",
//                             },
//                         }}
//                     >
//                         {Math.round(
//                             units === "metric"
//                                 ? peak.Altitude
//                                 : metersToFt(peak.Altitude)
//                         )
//                             .toString()
//                             .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
//                         {units === "metric" ? " m" : " ft"}
//                     </Typography>
//                 </Box>
//             )}
//         </ListItem>
//     )
// };

// export default ChallengePeakRow;
