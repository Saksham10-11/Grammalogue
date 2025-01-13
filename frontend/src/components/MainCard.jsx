import PropTypes from "prop-types";
import { forwardRef } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

const headerSX = {
  padding: "20px",
  "& .MuiCardHeader-action": { margin: "0px auto", alignSelf: "center" },
};

function MainCard(
  {
    border = true,
    boxShadow = false,
    children,
    content = true,
    contentSX = {},
    darkTitle,
    elevation = 0,
    secondary,
    shadow,
    sx = {},
    title,
    ...others
  },
  ref
) {
  return (
    <Card
      elevation={elevation}
      ref={ref}
      {...others}
      sx={{
        border: border ? "1px solid #E0E0E0" : "none",
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        boxShadow: boxShadow
          ? shadow || "0px 4px 12px rgba(0, 0, 0, 0.1)"
          : "none",
        transition: "box-shadow 0.3s ease-in-out",
        ":hover": {
          boxShadow: boxShadow
            ? shadow || "0px 6px 16px rgba(0, 0, 0, 0.15)"
            : "none",
        },
        "& pre": {
          margin: 0,
          padding: "16px",
          fontFamily: "Arial, sans-serif",
          fontSize: "0.875rem",
        },
        ...sx,
      }}
    >
      {title && (
        <CardHeader
          sx={headerSX}
          titleTypographyProps={{
            variant: darkTitle ? "h3" : "subtitle1",
            fontWeight: "bold",
            color: "#333333",
          }}
          title={
            <Typography variant={darkTitle ? "h3" : "subtitle1"}>
              {title}
            </Typography>
          }
          action={secondary}
        />
      )}
      {content && (
        <CardContent sx={{ padding: "20px", ...contentSX }}>
          {children}
        </CardContent>
      )}
      {!content && children}
    </Card>
  );
}

export default forwardRef(MainCard);

MainCard.propTypes = {
  border: PropTypes.bool,
  boxShadow: PropTypes.bool,
  children: PropTypes.node,
  subheader: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.bool,
  contentSX: PropTypes.object,
  darkTitle: PropTypes.bool,
  divider: PropTypes.bool,
  elevation: PropTypes.number,
  secondary: PropTypes.any,
  shadow: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  modal: PropTypes.bool,
  others: PropTypes.any,
};
