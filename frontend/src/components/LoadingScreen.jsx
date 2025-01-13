import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <CircularProgress size={80} thickness={4.5} />
      <Typography variant="h6" sx={{ mt: 2, color: "#555" }}>
        Loading, please wait...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
