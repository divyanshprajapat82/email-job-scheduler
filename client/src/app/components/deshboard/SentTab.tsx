"use client";
import { context } from "@/app/context/mainContext";
import React from "react";

interface Email {
	_id: string;
	recipient: string;
	subject: string;
	body: string;
	scheduledAt: string;
	sentAt?: string | null;
	status: "SCHEDULED" | "PROCESSING" | "SENT" | "FAILED" | "CANCELLED";
}

export default function SentTab() {
	const { emails, emailsLoading, emailError } = context();

	// const sentEmails = emails.filter((email) => email.status === "SENT");

	const sentEmails = emails.filter((email: Email) => email.status === "SENT");

	if (emailsLoading) {
		return <p>Loading sent emails...</p>;
	}

	if (emailError) {
		return <p>{emailError}</p>;
	}

	if (sentEmails.length === 0) {
		return <p>No sent emails yet.</p>;
	}
	return (
		<div>
			{sentEmails.map((email: Email) => (
				<>
					{/* Sent View Rows */}
					<div className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group">
						<div className="w-48 flex-shrink-0 text-[13px] font-medium text-gray-900">
							{/* To: Sarah Wilson */}
							{/* {email?.recipientName} */}
							To: {email?.recipientName || email?.recipient}
						</div>

						<div className="flex-shrink-0 mr-4">
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-gray-600">
								Sent
							</span>
						</div>

						<div className="flex-1 min-w-0 flex items-center text-[13px]">
							<span className="font-medium text-gray-900 truncate">
								{/* Re: Project Update */}
								{email?.subject}
							</span>
							<span className="mx-2 text-gray-400">-</span>
							<span className="text-gray-400 truncate">
								{/* Thanks for the update, Sarah. Looks good! */}
								{/* {email?.body} */}
								<div
										className="text-gray-400 truncate"
										dangerouslySetInnerHTML={{ __html: email?.body || "" }}
									/>

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
							To: Support
						</div>

						<div className="flex-shrink-0 mr-4">
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-gray-600">
								Sent
							</span>
						</div>

						<div className="flex-1 min-w-0 flex items-center text-[13px]">
							<span className="font-medium text-gray-900 truncate">
								Issue with login
							</span>
							<span className="mx-2 text-gray-400">-</span>
							<span className="text-gray-400 truncate">
								I am having trouble logging in to the dashboard...
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
