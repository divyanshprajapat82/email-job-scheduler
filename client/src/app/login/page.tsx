"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { context } from "../context/mainContext";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { app } from "../config/firebase";

export default function LoginPage() {
	const provider = new GoogleAuthProvider();
	const auth = getAuth(app);
	const [data, setData] = useState({
		email: "",
		password: "",
	});
	// const [userData, setUserData] = useState(null);

	const APIURL = process.env.NEXT_PUBLIC_APIURL;

	const router = useRouter();

	const { userData, setUserData, getMe } = context();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		let obj = {
			email: data.email,
			password: data.password,
		};

		axios
			.post(`${APIURL}/auth/login`, obj, {
				withCredentials: true,
			})
			.then((res) => res.data)
			.then((finalData) => {
				if (finalData.success) {
					getMe();
					router.push("/");
				}
			})
			.catch((err) => {
				if (err.response) {
					console.log(err.response.data.message);
				} else {
					console.log("Something went wrong");
				}
			});
	};

	const googleLogin = () => {
		// const auth = getAuth();
		signInWithPopup(auth, provider)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				// const credential = GoogleAuthProvider.credentialFromResult(result);
				const credential = GoogleAuthProvider.credentialFromResult(result);
				if (!credential) {
					throw new Error("Unable to get Google credentials");
				}
				const token = credential.accessToken;
				// The signed-in user info.
				const user = result.user;

				// console.log(user);

				const obj = {
					name: user.displayName,
					email: user.email,
				};

				axios
					.post(`${APIURL}/auth/google-login`, obj, {
						withCredentials: true,
					})
					.then((res) => res.data)
					.then((finalData) => {
						if (finalData.success) {
							getMe();
							router.push("/");
						}
					});

				// IdP data available using getAdditionalUserInfo(result)
				// ...
			})
			.catch((error) => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				// The email of the user's account used.
				const email = error.customData.email;
				// The AuthCredential type that was used.
				const credential = GoogleAuthProvider.credentialFromError(error);
				// ...
			});
	};

	// const googleLogin = async () => {
	// 	try {
	// 		const { GoogleAuthProvider, signInWithPopup, getAuth } =
	// 			await import("firebase/auth");
	
	// 		const { app } = await import("../config/firebase");
	
	// 		const auth = getAuth(app);
	// 		const provider = new GoogleAuthProvider();
	
	// 		const result = await signInWithPopup(auth, provider);
	
	// 		const user = result.user;
	
	// 		const obj = {
	// 			name: user.displayName,
	// 			email: user.email,
	// 		};
	
	// 		const res = await axios.post(
	// 			`${APIURL}/auth/google-login`,
	// 			obj,
	// 			{
	// 				withCredentials: true,
	// 			}
	// 		);
	
	// 		if (res.data.success) {
	// 			await getMe();
	// 			router.push("/");
	// 		}
	// 	} catch (error) {
	// 		console.error("Google login error:", error);
	// 	}
	// };

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setData({
			...data,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
			<div className="w-full max-w-[420px] p-10 bg-white border border-gray-200 rounded-xl">
				<h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
					Login
				</h1>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<button
						type="button"
						onClick={googleLogin}
						className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-8 bg-[#EEF5F0] hover:bg-[#e2ede5] transition-colors rounded-md text-[15px] font-medium text-gray-800 cursor-pointer"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24">
							<path
								fill="#EA4335"
								d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
							/>
							<path
								fill="#34A853"
								d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.806L1.24 17.35C3.198 21.302 7.269 24 12 24c3.24 0 5.966-1.08 7.96-2.916l-3.92-3.071Z"
							/>
							<path
								fill="#4A90E2"
								d="M19.96 21.084C22.045 18.984 24 15.86 24 12c0-.795-.085-1.545-.24-2.273H12v4.545h6.726c-.33 1.7-1.326 3.14-2.806 4.02v2.792h4.04Z"
							/>
							<path
								fill="#FBBC05"
								d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
							/>
						</svg>
						Login with Google
					</button>

					<div className="flex items-center mb-8">
						<div className="flex-grow border-t border-gray-100"></div>
						<span className="mx-4 text-sm text-gray-400 bg-white px-2">
							or sign up through email
						</span>
						<div className="flex-grow border-t border-gray-100"></div>
					</div>

					<div>
						<input
							type="email"
							name="email"
							value={data.email}
							onChange={handleChange}
							placeholder="Email ID"
							className="w-full px-4 py-3.5 bg-[#F6F7F6] rounded-md text-[15px] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#58A555] focus:bg-white transition-all"
							required
						/>
					</div>

					<div>
						<input
							type="password"
							name="password"
							value={data.password}
							onChange={handleChange}
							placeholder="Password"
							className="w-full px-4 py-3.5 bg-[#F6F7F6] rounded-md text-[15px] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#58A555] focus:bg-white transition-all"
							required
						/>
					</div>

					<button
						type="submit"
						className="w-full px-4 py-3.5 mt-2 text-[15px] font-medium text-white bg-[#58A555] rounded-md hover:bg-[#4d934a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#58A555] focus:ring-offset-2 cursor-pointer"
					>
						Login
					</button>
				</form>

				<p className="mt-8 text-center text-sm text-gray-500">
					Don't have an account?{" "}
					<Link
						href="/register"
						className="text-[#58A555] font-medium hover:underline"
					>
						Register
					</Link>
				</p>
			</div>
		</div>
	);
}
