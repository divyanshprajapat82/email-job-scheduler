"use client";

import React, { useEffect, useState } from "react";
import { FiRefreshCcw, FiSend } from "react-icons/fi";
import { MdOutlineSchedule } from "react-icons/md";
import SentTab from "./components/deshboard/SentTab";
import ScheduledTab from "./components/deshboard/ScheduledTab";
import { CiFilter } from "react-icons/ci";
import { context } from "./context/mainContext";
import { IoIosArrowDown } from "react-icons/io";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import AuthRoute from "./components/AuthRoute";
import Link from "next/link";

export default function Dashboard() {
	const [activeTab, setActiveTab] = useState("scheduled");
	const [isOpen, setIsOpen] = useState(false);
	const {
		userData,
		setUserData,
		emails,
		emailStats,
		emailsLoading,
		emailError,
		getEmails,
		refreshEmails,
		search, setSearch
	} = context();

	useEffect(() => {
		getEmails();
	}, [getEmails]);

	const APIURL = process.env.NEXT_PUBLIC_APIURL;

	const router = useRouter();

	const logOut = () => {
		axios
			.post(
				`${APIURL}/auth/logout`,
				{},
				{
					withCredentials: true,
				},
			)
			.then((res) => res.data)
			.then((finalData) => {
				if (finalData.success) {
					// setUser(null);
					setUserData(null);
					// toast.success(finalData.message);
					router.push("/login");
					// setUser(finalData.data);
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

	return (
		<AuthRoute>
			<div className="flex h-screen bg-white font-sans text-gray-800">
				{/* Sidebar */}
				<aside className="w-[280px] flex-shrink-0 border-r border-gray-200 flex flex-col px-4 py-6">
					{/* Logo */}
					<div className="mb-6 px-2">
						<h1
							className="text-3xl font-black tracking-widest"
							style={{ fontFamily: "monospace" }}
						>
							ONB
						</h1>
					</div>

					{/* User Profile Dropdown */}
					<div className="relative">
						<div
							onClick={() => setIsOpen(!isOpen)}
							className="flex items-center justify-between p-2 mb-6 bg-gray-50 rounded-lg cursor-pointer"
						>
							<div className="flex items-center gap-3">
								<img
									src="https://i.pravatar.cc/150?u=oliver"
									alt="Oliver Brown"
									className="w-10 h-10 rounded-full bg-gray-200"
								/>
								<div className="flex flex-col">
									<span className="text-sm font-medium text-gray-900">
										{/* Oliver Brown */}
										{userData?.name}
									</span>
									<span className="text-xs text-gray-500">
										{/* oliver.brown@domain.io */}
										{userData?.email}
									</span>
								</div>
							</div>
							{/* <svg
						className="w-4 h-4 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M19 9l-7 7-7-7"
						></path>
					</svg> */}

							<IoIosArrowDown
								className={` text-gray-400 transition-transform duration-200 ${
									isOpen ? "rotate-180" : ""
								}`}
							/>
						</div>
						{isOpen && (
							<div className="absolute top-[60px] left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
								<button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
									Profile
								</button>
								<button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
									Settings
								</button>
								<div className="border-t border-gray-100 my-1"></div>
								<button
									onClick={logOut}
									className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-color cursor-pointer"
								>
									Log out
								</button>
							</div>
						)}
					</div>

					{/* Compose Button */}
					<Link href={"/compose"}>
						<button className="w-full py-2.5 mb-8 border-2 border-[#58A555] text-[#58A555] font-medium rounded-full hover:bg-[#F6FDF7] transition-colors flex items-center justify-center cursor-pointer">
							Compose
						</button>
					</Link>

					{/* Navigation */}
					<div className="flex flex-col">
						<h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
							Core
						</h2>
						<nav className="space-y-1">
							{/* Scheduled Tab */}
							<button
								onClick={() => setActiveTab("scheduled")}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg group transition-colors cursor-pointer ${
									activeTab === "scheduled"
										? "bg-[#EEF5F0]"
										: "hover:bg-gray-50"
								}`}
							>
								<div className="flex items-center gap-3">
									<MdOutlineSchedule
										size={20}
										className={` ${activeTab === "scheduled" ? "text-gray-800" : "text-gray-500"}`}
									/>
									<span
										className={`text-sm font-medium ${activeTab === "scheduled" ? "text-gray-900" : "text-gray-700"}`}
									>
										Scheduled
									</span>
								</div>
								<span
									className={`text-xs font-medium ${activeTab === "scheduled" ? "text-gray-600" : "text-gray-400"}`}
								>
									{/* 12 */}
									{emailStats?.scheduled}
								</span>
							</button>

							{/* Sent Tab */}
							<button
								onClick={() => setActiveTab("sent")}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg group transition-colors cursor-pointer ${
									activeTab === "sent" ? "bg-[#EEF5F0]" : "hover:bg-gray-50"
								}`}
							>
								<div className="flex items-center gap-3">
									<FiSend
										size={20}
										className={`w-5 h-5 ${activeTab === "sent" ? "text-gray-800" : "text-gray-500"}`}
									/>
									<span
										className={`text-sm font-medium ${activeTab === "sent" ? "text-gray-900" : "text-gray-700"}`}
									>
										Sent
									</span>
								</div>
								<span
									className={`text-xs font-medium ${activeTab === "sent" ? "text-gray-600" : "text-gray-400"}`}
								>
									{/* 785 */}
									{emailStats?.sent}
								</span>
							</button>
						</nav>
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-1 flex flex-col min-w-0">
					{/* Top Header / Search */}
					<header className="h-[72px] border-b border-gray-100 flex items-center px-6 gap-4">
						<div className="relative flex-1 max-w-2xl">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg
									className="w-5 h-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									></path>
								</svg>
							</div>
							<input
								type="text"
								placeholder="Search recipient, subject or email body..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="block w-full pl-10 pr-3 py-2 bg-[#F6F7F6] border-transparent rounded-full text-sm placeholder-gray-400 focus:bg-white focus:border-gray-300 focus:ring-0 transition-colors outline-none"
							/>
						</div>

						<button
							// onClick={refreshEmails}
							// disabled={emailsLoading}
							className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-50 cursor-pointer"
						>
							<CiFilter size={20} />
						</button>
{/* 
						<button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 cursor-pointer">
							<FiRefreshCcw
								size={20}
								className={emailsLoading ? "animate-spin" : ""}
							/>
						</button> */}

					<button
						onClick={refreshEmails}
						disabled={emailsLoading}
						className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-50 cursor-pointer"
					>
						<FiRefreshCcw
							size={20}
							className={emailsLoading ? "animate-spin" : ""}
						/>
					</button>
					</header>

					{/* Email List */}
					<div className="flex-1 overflow-y-auto">
						{activeTab === "scheduled" ? <ScheduledTab /> : <SentTab />}
					</div>
				</main>
			</div>
		</AuthRoute>
	);
}
