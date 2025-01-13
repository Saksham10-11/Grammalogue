import useMediaQuery from "@mui/material/useMediaQuery";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { saveOrRetrieveUser } from "../../../services/userLogin";

// assets
import Google from "../../../assets/icons/google.svg";

// ==============================|| FIREBASE - SOCIAL BUTTON ||============================== //

export default function FirebaseSocial() {
  const navigate = useNavigate();

  const googleHandler = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      if (result.user) {
        const { displayName, email, uid } = result.user;

        // Create a payload for the user
        const userPayload = {
          username: displayName,
          email: email,
          token: uid, // Using Firebase UID as the token here for demonstration
        };

        // Save or retrieve the user using the API function
        const user = await saveOrRetrieveUser(userPayload);

        if (user) {
          console.log("User successfully stored/retrieved:", user);
          // Store token or perform additional logic as needed
          localStorage.setItem("token", user.token);
          localStorage.setItem("currUser", JSON.stringify(userPayload));
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 2 }}
      justifyContent="center"
      sx={{
        width: "100%",
      }}
    >
      <Button
        variant="outlined"
        startIcon={<img src={Google} alt="Google" />}
        onClick={googleHandler}
        sx={{
          width: "100%", // Make the button span the full width
          height: "56px", // Set a larger height for the button
          fontSize: "16px", // Larger font size
          textTransform: "none", // Prevent uppercase transformation
          backgroundColor: "#ffffff", // White background
          color: "#757575", // Grey text and icon color
          border: "1px solid #cccccc", // Light grey border
          "&:hover": {
            backgroundColor: "#f7f7f7", // Slightly darker white on hover
          },
        }}
      >
        Sign in with Google
      </Button>
    </Stack>
  );
}
