import { auth } from "./../../firebase/firebase";

export const logoutUser = async () => {
  try {
    // Use Firebase auth to log out the user
    await auth.signOut();

    // Clear user data from localStorage
    localStorage.removeItem("currUser");

    console.log("User logged out successfully");
  } catch (error) {
    console.error("Logout error:", error.message || "Failed to log out");
    throw new Error("Logout failed. Please try again.");
  }
};
