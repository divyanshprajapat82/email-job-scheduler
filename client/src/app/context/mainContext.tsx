"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback } from "react";

const { createContext, useContext, useState, useEffect } = require("react");

const AuthContext = createContext();

interface MainContextProps {
	children: ReactNode;
}

interface Email {
    _id: string;
    recipient: string;
    recipientName?: string;
    senderId?: string;
    senderEmail?: string;
    subject: string;
    body: string;
    scheduledAt: string;
    sentAt?: string | null;
    status: "SCHEDULED" | "PROCESSING" | "SENT" | "FAILED" | "CANCELLED";
    createdAt?: string;
}

interface EmailStats {
	scheduled: number;
	processing: number;
	sent: number;
	failed: number;
	cancelled: number;
}

const initialStats: EmailStats = {
	scheduled: 0,
	processing: 0,
	sent: 0,
	failed: 0,
	cancelled: 0,
};

const APIURL = process.env.NEXT_PUBLIC_APIURL;

export const MainContext = ({ children }: MainContextProps) => {
	const [userData, setUserData] = useState(null);
	const [emails, setEmails] = useState([]);
	const [emailStats, setEmailStats] = useState(initialStats);

	const [userLoading, setUserLoading] = useState(true);
	const [emailsLoading, setEmailsLoading] = useState(false);
	const [emailError, setEmailError] = useState("");

	const [search, setSearch] = useState("");
	const router = useRouter();

	const getMe = () => {
		axios
			.get(`${APIURL}/auth/me`, {
				withCredentials: true,
			})
			.then((res) => res.data)
			.then((finalData) => {
				if (finalData.success) {
					setUserData(finalData.data);
				} else {
					router.replace("/login");
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

	// Get emails, optionally filtered by status or search
	// const getEmails = async (
	// 	filters: { status?: string; search?: string } = {},
	// ) => {
	// 	setEmailsLoading(true);
	// 	setEmailError("");

	// 	try {
	// 		const response = await axios.get(`${APIURL}/email/get`, {
	// 			withCredentials: true,
	// 			params: filters,
	// 		});

	// 		if (response.data.success) {
	// 			setEmails(response.data.data || []);
	// 		} else {
	// 			setEmailError(response.data.message || "Failed to fetch emails");
	// 		}
	// 	} catch (error: any) {
	// 		const message = error.response?.data?.message || "Failed to fetch emails";

	// 		setEmailError(message);
	// 		console.error("Get emails error:", message);
	// 	} finally {
	// 		setEmailsLoading(false);
	// 	}
	// };

	// const getEmails = useCallback(
	// 	async (filters: { status?: string; search?: string } = {}) => {
	// 		setEmailsLoading(true);
	// 		setEmailError("");

	// 		try {
	// 			const response = await axios.get(`${APIURL}/email/get`, {
	// 				withCredentials: true,
	// 				params: filters,
	// 			});

	// 			if (response.data.success) {
	// 				setEmails(response.data.data || []);
	// 			}
	// 		} catch (error: any) {
	// 			const message =
	// 				error.response?.data?.message || "Failed to fetch emails";

	// 			setEmailError(message);
	// 			console.error(message);
	// 		} finally {
	// 			setEmailsLoading(false);
	// 		}
	// 	},
	// 	[],
	// );

	const getEmails = useCallback(
		async (
			filters: {
				status?: string;
				search?: string;
				from?: string;
				to?: string;
				page?: number;
				limit?: number;
			} = {},
		) => {
			setEmailsLoading(true);
			setEmailError("");
	
			try {
				const response = await axios.get(`${APIURL}/email/get`, {
					withCredentials: true,
					params: filters,
				});
	
				if (response.data.success) {
					setEmails(response.data.data || []);
				} else {
					setEmailError(
						response.data.message || "Failed to fetch emails",
					);
				}
			} catch (error: any) {
				const message =
					error.response?.data?.message || "Failed to fetch emails";
	
				setEmailError(message);
				console.error("Get emails error:", message);
			} finally {
				setEmailsLoading(false);
			}
		},
		[],
	);

	// Get email counts
	const getEmailStats = useCallback(async () => {
		try {
			const response = await axios.get(`${APIURL}/email/stats`, {
				withCredentials: true,
			});
	
			if (response.data.success) {
				setEmailStats({
					...initialStats,
					...response.data.data,
				});
			}
		} catch (error: any) {
			console.error(
				error.response?.data?.message || "Failed to fetch email statistics"
			);
		}
	}, []);

	// Refresh email list and statistics together
	// const refreshEmails = useCallback(async () => {
	// 	await Promise.all([getEmails(), getEmailStats()]);
	// }, [getEmails, getEmailStats]);

	const refreshEmails = useCallback(async () => {
		await Promise.all([getEmails(), getEmailStats()]);
	}, [getEmails, getEmailStats]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			getEmails({ search: search.trim() });
		}, 400);
	
		return () => clearTimeout(timeout);
	}, [search, getEmails]);

	useEffect(() => {
		getMe();
		// getEmails();
		getEmailStats();
	}, []);
	return (
		<AuthContext.Provider
			value={{
				getMe,
				userData,
				setUserData,

				// Email state
				emails,
				setEmails,
				emailsLoading,
				emailError,

				// Email statistics
				emailStats,

				// Email API functions
				getEmails,
				getEmailStats,
				refreshEmails,

				search, setSearch
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const context = () => useContext(AuthContext);
