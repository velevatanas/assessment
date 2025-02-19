// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "../store/authSlice";
// import API from "../api";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await API.post("/token/", { username, password });
//       dispatch(loginSuccess(data));
//       navigate("/products");
//     } catch (err) {
//       console.error("Login failed", err);
//     }
//   };

//   return (
//     <div>
//       <h1>Login</h1>
//       <form onSubmit={handleLogin}>
//         <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
//         <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default Login;


import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Import the CSS file

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/token/", { username, password });
      dispatch(loginSuccess(data));
      navigate("/products");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
