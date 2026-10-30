"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface AuthRouteProps {
	children: ReactNode;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [authenticated, setAuthenticated] = useState(false);

	const APIURL = process.env.NEXT_PUBLIC_APIURL;

	useEffect(() => {
		const checkUser = async () => {
			try {
				const response = await axios.get(`${APIURL}/auth/me`, {
					withCredentials: true,
				});

				if (response.data.success) {
					setAuthenticated(true);
				} else {
					router.replace("/");
				}
			} catch (error) {
				router.replace("/login");
			} finally {
				setLoading(false);
			}
		};

		checkUser();
	}, [router]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />
			</div>
		);
	}

	if (!authenticated) {
		return null;
	}

	return children;
};

export default AuthRoute;
