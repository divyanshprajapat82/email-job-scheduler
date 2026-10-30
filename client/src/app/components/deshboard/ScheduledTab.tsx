"use client";
import { context } from "@/app/context/mainContext";
import React from "react";

interface Email {
    _id: string;
    recipient: string;
    recipientName?: string; 
    subject: string;
    body: string;
    scheduledAt: string;
    sentAt?: string | null;
    status: "SCHEDULED" | "PROCESSING" | "SENT" | "FAILED" | "CANCELLED";
}

export default function ScheduledTab() {
	const { emails, emailsLoading, emailError } = context();

	const scheduledEmails = emails.filter(
		(email: Email) => email.status === "SCHEDULED",
	);

	if (emailsLoading) {
		return <p>Loading scheduled emails...</p>;
	}

	if (emailError) {
		return <p>{emailError}</p>;
	}

	if (scheduledEmails.length === 0) {
		return <p>No scheduled emails yet.</p>;
	}

	const formatDate = (date: string | Date): string => {
		if (!date) return "";
		 return new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
	};
	return (
		<div>
			{scheduledEmails.map((email: Email) => (
				<>
					{/* Scheduled View Rows */}
					<div key={email._id} className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group">
						<div className="w-48 flex-shrink-0 text-[13px] font-medium text-gray-900">
							{/* To: John Smith */}
							{/* {email.userId?.name} */}
							TO: {email?.recipientName || email?.recipient}
						</div>

						<div className="flex-shrink-0 mr-4">
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FFF3E0] text-[#E65100]">
								<svg
									className="w-3.5 h-3.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								{/* Tue 9:15:12 AM */}
								{formatDate(email.scheduledAt)}
							</span>
						</div>

						<div className="flex-1 min-w-0 flex items-center text-[13px]">
							<span className="font-medium text-gray-900 truncate">
								{/* Meeting follow-up - Scheduled */}
								{email.subject} - Scheduled
							</span>
							<span className="mx-2 text-gray-400">-</span>
							<span className="text-gray-500 truncate">
								{/* Hi John, just wanted to follow up on our meeting... */}
								{email.body}
							</span>
						</div>

						<div className="ml-4 flex-shrink-0">
							<button className="text-gray-300 hover:text-yellow-400">
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
									></path>
								</svg>
							</button>
						</div>
					</div>

					{/* <div className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group">
						<div className="w-48 flex-shrink-0 text-[13px] font-medium text-gray-900">
							To: Olive
						</div>

						<div className="flex-shrink-0 mr-4">
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FFF3E0] text-[#E65100]">
								<svg
									className="w-3.5 h-3.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								Thu 8:15:12 PM
							</span>
						</div>

						<div className="flex-1 min-w-0 flex items-center text-[13px]">
							<span className="font-medium text-gray-900 truncate">
								Ramit, great to meet you - you'll love it
							</span>
							<span className="mx-2 text-gray-400">-</span>
							<span className="text-gray-500 truncate">
								Hi Olive, just wanted to follow up on our meeting...
							</span>
						</div>

						<div className="ml-4 flex-shrink-0">
							<button className="text-gray-300 hover:text-yellow-400">
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
									></path>
								</svg>
							</button>
						</div>
					</div> */}
				</>
			))}
		</div>
	);
}
