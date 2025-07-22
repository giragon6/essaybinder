// import { signInWithPopup, type User } from "firebase/auth";
// import { useState } from "react";
// // esLint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// import { auth } from "../services/firebase";
// // esLint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// import { configureGoogleProvider } from "../services/google-docs-service";

// const provider = configureGoogleProvider();

// export default function Login() {
//   const [user, setUser] = useState<User|null>(null);

//   const handleLogin = () => {
//     signInWithPopup(auth, provider)
//       .then((result) => {
//         setUser(result.user);
//       })
//       .catch((error) => {
//         console.error("Login failed:", error);
//       });
//   }

//   const handleLogout = () => {
//     auth.signOut()
//       .then(() => {
//         setUser(null);
//       })
//       .catch((error: Error) => {
//         console.error("Logout failed:", error);
//       });
//   }
  
//   return (
//     <div>
//       {!user ? (
//         <button onClick={handleLogin} className="bg-blue-500 text-white px
//         py-2 rounded">
//           Login with Google
//         </button>
//       ) : (
//         <div>
//           <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
//           <img src={user.photoURL || ""} alt="User Avatar" className="w-24 h-24 rounded-full" />
//           <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
//             Logout
//           </button>
//         </div>    
//       )}      
//     </div>
//   );
// }