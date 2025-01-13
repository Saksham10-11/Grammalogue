import PropTypes from "prop-types";
import { useRef, useState, useEffect } from "react";

// material-ui
import ButtonBase from "@mui/material/ButtonBase";
import CardContent from "@mui/material/CardContent";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Popper from "@mui/material/Popper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Transitions from "@mui/material/Fade";
import { useNavigate } from "react-router-dom";

// project import
import ProfileTab from "./ProfileTab";
import SettingTab from "./SettingTab";
import MainCard from "../MainCard";
import { logoutUser } from "../../services/logoutUser";
import { auth } from "./../../../firebase/firebase";

// assets
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import avatar1 from "../../assets/users/user.png";

// Accessible tab panel wrapper with ARIA support
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

// Helper function for tab accessibility props
function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    "aria-controls": `profile-tabpanel-${index}`,
  };
}

export default function Profile() {
  // Theme constants for consistent styling
  const iconBackColorOpen = "#f5f5f5";
  const textPrimary = "#000000";
  const secondaryLighter = "#e0e0e0";
  const boxShadow =
    "0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)";

  // Refs and state for popper positioning and animation
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // State management for tabs and profile image
  const [value, setValue] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Sync profile image with Firebase auth state
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.photoURL) {
      setProfileImage(currentUser.photoURL);
    }
  }, []);

  useEffect(() => {
    console.log("Profile Image updated:", profileImage);
  }, [profileImage]);

  // Handle user logout with Firebase auth
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      {/* Profile Button Trigger */}
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open ? iconBackColorOpen : "transparent",
          borderRadius: 1,
          "&:hover": { bgcolor: secondaryLighter },
          "&:focus-visible": {
            outline: `2px solid #FF4081`,
            outlineOffset: 2,
          },
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? "profile-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ p: 0.5 }}
        >
          <Avatar alt="profile user" src={avatar1} size="sm" />
          <Typography variant="subtitle1" sx={{ textTransform: "capitalize" }}>
            {JSON.parse(localStorage.getItem("currUser"))?.username || "Guest"}
          </Typography>
        </Stack>
      </ButtonBase>

      {/* Profile Dropdown Menu with Animation */}
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 9],
              },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position="top-right"
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={{
                boxShadow: boxShadow,
                width: 290,
                minWidth: 240,
                maxWidth: { xs: 250, md: 290 },
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  {/* Profile Header */}
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item>
                        <Stack
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                        >
                          <Avatar
                            alt="profile user"
                            src={avatar1}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Stack>
                            <Typography variant="h6">
                              {JSON.parse(localStorage.getItem("currUser"))
                                ?.username || "Guest"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              UI/UX Designer
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Logout">
                          <IconButton
                            size="large"
                            sx={{ color: textPrimary }}
                            onClick={handleLogout}
                          >
                            <LogoutOutlined />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>

                  {/* Profile Tabs Navigation */}
                  <Box sx={{ borderBottom: 1, borderColor: "#D3D3D3" }}>
                    <Tabs
                      variant="fullWidth"
                      value={value}
                      onChange={handleChange}
                      aria-label="profile tabs"
                    >
                      <Tab
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          textTransform: "capitalize",
                        }}
                        icon={
                          <UserOutlined
                            style={{ marginBottom: 0, marginRight: "10px" }}
                          />
                        }
                        label="Profile"
                        {...a11yProps(0)}
                      />
                      <Tab
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          textTransform: "capitalize",
                        }}
                        icon={
                          <SettingOutlined
                            style={{ marginBottom: 0, marginRight: "10px" }}
                          />
                        }
                        label="Setting"
                        {...a11yProps(1)}
                      />
                    </Tabs>
                  </Box>

                  {/* Tab Content */}
                  <TabPanel value={value} index={0} dir="ltr">
                    <ProfileTab />
                  </TabPanel>
                  <TabPanel value={value} index={1} dir="ltr">
                    <SettingTab />
                  </TabPanel>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number,
  index: PropTypes.number,
  other: PropTypes.any,
};