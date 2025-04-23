import React, { useContext, useState } from "react";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/UserContext";
import app from "../../firebase/firebase.config";
import { toast } from "react-toastify";
import "./Register.css";
import logoImage from "../../assets/img/SGAirStackedBlack.png";
import eyeImage from "../../assets/img/eye-slash.svg";
import backgroundImage from "../../assets/img/background.png";

const Register = () => {
  const navigate = useNavigate();
  const { createUser } = useContext(AuthContext);
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");

  const validateForm = () => {
    if (!fullname || !email || !password || !repassword) {
      return "All fields are required.";
    }
    if (password !== repassword) {
      return "Passwords do not match.";
    }
    if (password.length === 6) {
      return "Password must be at least 6 characters long.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError); // Show error notification
      return;
    }

    createUser(fullname, email, password)
      .then(async (result) => {
        const user = result;
        const db = getFirestore(app);

        await setDoc(doc(db, "subscriptions", user.uid), {
          subscriptionId: "",
          status: "free",
          priceId: "",
          currentPeriodEnd: new Date(),
          updatedAt: new Date(),
        });

        window.localStorage.setItem("registered", 1);

        toast.success("Registration successful!"); // Show success notification
        navigate("/login");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Registration failed: " + error.message); // Show error notification
      });
  };

  const handleEyeIcon = (e) => {
    const passwordInput = e.target.parentElement.children[0];
    const typeInput = passwordInput.getAttribute("type");
    passwordInput.setAttribute(
      "type",
      typeInput === "text" ? "password" : "text"
    );
  };

  return (
    <div
      className="w-full flex flex-col items-center justify-center h-full xl:flex-row"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center justify-center p-8 fixed xl:absolute max-w-[80%] md:max-w-full">
        <form onSubmit={handleSubmit} className="w-full">
          <div
            className="text-center font-bold text-[14px] mb-10 sm:mb-12 sm:text-[26px]"
            style={{ fontFamily: "Montserrat", color: "#001132" }}
          >
            WELCOME TO SHUTTERGUIDE
          </div>
          <div
            className="text-center text-[16px] mb-10 sm:mb-16 sm:text-3xl"
            style={{ fontFamily: "Montserrat", color: "#001132" }}
          >
            CREATE AN ACCOUNT
          </div>
          <div className="w-full mb-3">
            <div className="relative flex items-center mb-3 w-full">
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full flex items-center pl-3 text-[14px] sm:text-md py-2 text-black border-2 border-solid rounded-xl"
                style={{ borderColor: "#383E50" }}
                placeholder="FULL NAME"
              />
            </div>
            <div className="relative flex items-center mb-3 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full flex items-center pl-3 text-[14px] sm:text-md py-2 text-black border-2 border-solid rounded-xl"
                style={{ borderColor: "#383E50" }}
                placeholder="EMAIL"
              />
            </div>
            <div className="relative flex items-center mb-3 w-full">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full flex items-center pl-3 text-[14px] sm:text-md py-2 text-black border-2 border-solid rounded-xl"
                style={{ borderColor: "#383E50" }}
                placeholder="PASSWORD"
              />
              <img
                onClick={(e) => handleEyeIcon(e)}
                src={eyeImage}
                alt="eye"
                className="absolute right-3 cursor-pointer"
              />
            </div>
            <div className="relative flex items-center w-full">
              <input
                type="password"
                value={repassword}
                onChange={(e) => setRePassword(e.target.value)}
                className="w-full flex items-center pl-3 text-[14px] sm:text-md py-2 text-black border-2 border-solid rounded-xl"
                style={{ borderColor: "#383E50" }}
                placeholder="CONFIRM PASSWORD"
              />
              <img
                onClick={(e) => handleEyeIcon(e)}
                src={eyeImage}
                alt="eye"
                className="absolute right-3 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full justify-center items-center text-white text-[14px] sm:text-xl 2xl:text-2xl font-medium rounded-xl p-3 mb-3"
            style={{ backgroundColor: "#000", fontFamily: "Montserrat" }}
          >
            REGISTER
          </button>

          <div className="flex justify-between mb-10 sm:mb-24 font-medium">
            <div
              className="mr-1 text-[14px] text-black"
              style={{ fontFamily: "Montserrat" }}
            >
              ALREADY HAVE AN ACCOUNT?
            </div>
            <Link
              to="/login"
              className="text-[14px]"
              style={{ fontFamily: "Montserrat", color: "#000" }}
            >
              SIGN IN
            </Link>
          </div>

          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logoImage}
              className="w-[180px] sm:w-[220px] h-auto mx-auto"
              alt="logo"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
