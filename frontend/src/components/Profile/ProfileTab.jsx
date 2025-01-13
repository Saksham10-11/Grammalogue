import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// material-ui
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// assets
import EditOutlined from "@ant-design/icons/EditOutlined";
import ProfileOutlined from "@ant-design/icons/ProfileOutlined";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import WalletOutlined from "@ant-design/icons/WalletOutlined";

// project import
import { logoutUser } from "../../services/logoutUser";

export default function ProfileTab() {
  // Track selected menu item for visual feedback
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Handle menu item selection and navigation
  const handleListItemClick = (event, index, route) => {
    setSelectedIndex(index);
    if (route) {
      navigate(route);
    }
  };

  // Firebase logout with error handling and navigation
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
    <List
      component="nav"
      // Customize Material-UI list icons spacing
      sx={{ p: 0, "& .MuiListItemIcon-root": { minWidth: 32 } }}
    >
      {/* Edit Profile Option */}
      <ListItemButton
        selected={selectedIndex === 0}
        onClick={(event) =>
          handleListItemClick(event, 0, "/apps/profiles/user/personal")
        }
      >
        <ListItemIcon>
          <EditOutlined />
        </ListItemIcon>
        <ListItemText primary="Edit Profile" />
      </ListItemButton>

      {/* View Profile Option */}
      <ListItemButton
        selected={selectedIndex === 1}
        onClick={(event) =>
          handleListItemClick(event, 1, "/apps/profiles/account/basic")
        }
      >
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="View Profile" />
      </ListItemButton>

      {/* Social Profile Option */}
      <ListItemButton
        selected={selectedIndex === 3}
        onClick={(event) =>
          handleListItemClick(event, 3, "apps/profiles/account/personal")
        }
      >
        <ListItemIcon>
          <ProfileOutlined />
        </ListItemIcon>
        <ListItemText primary="Social Profile" />
      </ListItemButton>

      {/* Billing Option */}
      <ListItemButton
        selected={selectedIndex === 4}
        onClick={(event) =>
          handleListItemClick(event, 4, "/apps/invoice/details/1")
        }
      >
        <ListItemIcon>
          <WalletOutlined />
        </ListItemIcon>
        <ListItemText primary="Billing" />
      </ListItemButton>

      {/* Logout Option - Separate handler for Firebase logout */}
      <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = { handleLogout: PropTypes.func };