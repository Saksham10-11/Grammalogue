import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { auth } from "../../../../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { saveOrRetrieveUser } from "../../../services/userLogin";

// material-ui
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// third party
import * as Yup from "yup";
import { Formik } from "formik";

// project import
import { AnimateButton } from "../../../components";
import {
  strengthColor,
  strengthIndicator,
} from "../../../utils/password-strength";

// assets
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";

export default function AuthRegister() {
  const navigate = useNavigate();
  // State for password strength visualization
  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);

  // Password visibility toggle handlers
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault(); // Prevent focus loss on mouse down
  };

  // Update password strength indicator on password change
  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  // Handle form submission with Firebase registration
  const handleRegisterSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const { firstname, lastname, email, company, password } = values;

      // Create Firebase user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // Prepare user data for database storage
      const userPayload = {
        username: `${firstname} ${lastname}`,
        email: firebaseUser.email,
        token: firebaseUser.uid, // Using Firebase UID for session management
      };

      // Save user data to backend database
      const user = await saveOrRetrieveUser(userPayload);

      console.log("User successfully registered and saved:", user);

      // Set up user session
      localStorage.setItem("token", user.token);
      localStorage.setItem("currUser", JSON.stringify(userPayload));

      navigate("/dashboard");
    } catch (error) {
      console.error("Error during registration:", error);
      setErrors({
        submit: error.response?.data?.message || "User already exists",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Initialize password strength on component mount
  useEffect(() => {
    changePassword("");
  }, []);

  return (
    <>
      <Formik
        initialValues={{
          firstname: "",
          lastname: "",
          email: "",
          company: "",
          password: "",
          submit: null,
        }}
        // Form validation schema with Yup
        validationSchema={Yup.object().shape({
          firstname: Yup.string().max(255).required("First Name is required"),
          lastname: Yup.string().max(255).required("Last Name is required"),
          email: Yup.string()
            .email("Must be a valid email")
            .max(255)
            .required("Email is required"),
          password: Yup.string().max(255).required("Password is required"),
        })}
        onSubmit={(values, formikHelpers) =>
          handleRegisterSubmit(values, formikHelpers, navigate)
        }
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values,
        }) => (
          <form
            noValidate
            onSubmit={handleSubmit}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <Grid container spacing={3}>
              {/* First Name Field */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel
                    htmlFor="firstname-signup"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    First Name*
                  </InputLabel>
                  <OutlinedInput
                    id="firstname-login"
                    type="firstname"
                    value={values.firstname}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="John"
                    fullWidth
                    error={Boolean(touched.firstname && errors.firstname)}
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </Stack>
                {touched.firstname && errors.firstname && (
                  <FormHelperText
                    error
                    id="helper-text-firstname-signup"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {errors.firstname}
                  </FormHelperText>
                )}
              </Grid>

              {/* Last Name Field */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel
                    htmlFor="lastname-signup"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Last Name*
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.lastname && errors.lastname)}
                    id="lastname-signup"
                    type="lastname"
                    value={values.lastname}
                    name="lastname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Doe"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </Stack>
                {touched.lastname && errors.lastname && (
                  <FormHelperText
                    error
                    id="helper-text-lastname-signup"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {errors.lastname}
                  </FormHelperText>
                )}
              </Grid>

              {/* Company Field (Optional) */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel
                    htmlFor="company-signup"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Company
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.company && errors.company)}
                    id="company-signup"
                    value={values.company}
                    name="company"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Demo Inc."
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </Stack>
                {touched.company && errors.company && (
                  <FormHelperText
                    error
                    id="helper-text-company-signup"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {errors.company}
                  </FormHelperText>
                )}
              </Grid>

              {/* Email Field */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel
                    htmlFor="email-signup"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Email Address*
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="demo@company.com"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText
                    error
                    id="helper-text-email-signup"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              {/* Password Field with Strength Indicator */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel
                    htmlFor="password-signup"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Password
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? (
                            <EyeOutlined />
                          ) : (
                            <EyeInvisibleOutlined />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="******"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText
                    error
                    id="helper-text-password-signup"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {errors.password}
                  </FormHelperText>
                )}
                {/* Password Strength Visualization */}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Box
                        sx={{
                          bgcolor: level?.color,
                          width: 85,
                          height: 8,
                          borderRadius: "7px",
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <Typography
                        variant="subtitle1"
                        fontSize="0.75rem"
                        sx={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>

              {/* Terms and Conditions */}
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  By Signing up, you agree to our &nbsp;
                  <Link
                    variant="subtitle2"
                    component={RouterLink}
                    to="#"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Terms of Service
                  </Link>
                  &nbsp; and &nbsp;
                  <Link
                    variant="subtitle2"
                    component={RouterLink}
                    to="#"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
              </Grid>

              {/* Error Message Display */}
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText
                    error
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {errors.submit}
                  </FormHelperText>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Create Account
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}