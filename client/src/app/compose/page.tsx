"use client";

import React, { useRef, useState } from "react";
import ArticleEditor from "../components/ArticleEditor";
import { context } from "../context/mainContext";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
FiArrowLeft,
FiPaperclip,
FiClock,
FiUploadCloud,
FiChevronDown,
FiX,
} from "react-icons/fi";

export default function ComposeEmail() {
const { userData } = context();


const APIURL = process.env.NEXT_PUBLIC_APIURL;
const router = useRouter();
const fileInputRef = useRef<HTMLInputElement>(null);
const recipientInputRef = useRef<HTMLInputElement>(null);

const [recipients, setRecipients] = useState<string[]>([]);
const [recipientInput, setRecipientInput] = useState("");
const [subject, setSubject] = useState("");
const [body, setBody] = useState("");
const [delay, setDelay] = useState(0);
const [hourlyLimit, setHourlyLimit] = useState(0);
const [scheduledAt, setScheduledAt] = useState("");
const [senderId, setSenderId] = useState("sender-1");

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState(false);
const [showAllRecipients, setShowAllRecipients] = useState(false);
const [uploadedFile, setUploadedFile] = useState("");

const [uploadedRecipients, setUploadedRecipients] = useState<string[]>([]);
const [invalidFileEmails, setInvalidFileEmails] = useState<string[]>([]);

// Add recipient
const addRecipient = (value: string) => {
    const emails = value
        .split(/[,;\s]+/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

    const validEmails = emails.filter((email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    setRecipients((previous) => [
        ...new Set([...previous, ...validEmails]),
    ]);

    setRecipientInput("");
};

// Remove recipient
const removeRecipient = (email: string) => {
    setRecipients((previous) =>
        previous.filter((item) => item !== email)
    );
};

// Handle recipient keyboard input
const handleRecipientKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
) => {
    if (
        e.key === "Enter" ||
        e.key === "," ||
        e.key === " "
    ) {
        e.preventDefault();

        if (recipientInput.trim()) {
            addRecipient(recipientInput);
        }
    }

    if (
        e.key === "Backspace" &&
        !recipientInput &&
        recipients.length
    ) {
        removeRecipient(recipients[recipients.length - 1]);
    }
};

// Upload CSV or TXT recipient list
const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["csv", "txt"].includes(extension || "")) {
        setError(true);
        setMessage("Please upload a CSV or TXT file.");
        e.target.value = "";
        return;
    }

    // Maximum file size: 5 MB
    if (file.size > 5 * 1024 * 1024) {
        setError(true);
        setMessage("File size must be less than 5 MB.");
        e.target.value = "";
        return;
    }

    try {
        const fileText = await file.text();

        if (!fileText.trim()) {
            setError(true);
            setMessage("The uploaded file is empty.");
            e.target.value = "";
            return;
        }

        // Extract possible email addresses
        const extractedEmails =
            fileText.match(/[^\s,;<>"]+@[^\s,;<>"]+/g) || [];

        const cleanedEmails = extractedEmails.map((email) =>
            email
                .trim()
                .replace(/^[("'[{]+|[)"'\]},.]+$/g, "")
                .toLowerCase()
        );

        // Validate extracted addresses
        const validEmails = cleanedEmails.filter((email) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
        );

        const invalidEmails = cleanedEmails.filter(
            (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
        );

        // Remove duplicates
        const uniqueEmails = [...new Set(validEmails)];

        if (!uniqueEmails.length) {
            setError(true);
            setMessage("No valid email addresses found in the file.");
            setInvalidFileEmails(invalidEmails);
            e.target.value = "";
            return;
        }

        // Add only new recipients
        setRecipients((previous) => [
            ...new Set([...previous, ...uniqueEmails]),
        ]);

        setUploadedRecipients((previous) => [
            ...new Set([...previous, ...uniqueEmails]),
        ]);

        setInvalidFileEmails(invalidEmails);
        setUploadedFile(file.name);
        setError(false);

        setMessage(
            `${uniqueEmails.length} unique valid email(s) imported.${
                invalidEmails.length
                    ? ` ${invalidEmails.length} invalid entr${invalidEmails.length === 1 ? "y" : "ies"} skipped.`
                    : ""
            }`
        );
    } catch (err) {
        console.error("File upload error:", err);
        setError(true);
        setMessage("Unable to read the uploaded file.");
    }

    e.target.value = "";
};

// Schedule emails


const handleScheduleEmail = async () => {
    const finalRecipients = [...recipients];

    if (recipientInput.trim()) {
        const pendingEmails = recipientInput
            .split(/[,;\s]+/)
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean);

        finalRecipients.push(...pendingEmails);
    }

    const uniqueRecipients = [...new Set(finalRecipients)];

    if (!uniqueRecipients.length || !subject.trim() || !body.trim() || !scheduledAt) {
        setError(true);
        setMessage("Please fill in all required fields.");
        return;
    }

    const invalidEmails = uniqueRecipients.filter(
        (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (invalidEmails.length) {
        setError(true);
        setMessage(`Invalid email address: ${invalidEmails[0]}`);
        return;
    }

    if (!APIURL) {
        setError(true);
        setMessage("API URL is not configured.");
        return;
    }

    const scheduleDate = new Date(scheduledAt);

    if (
        Number.isNaN(scheduleDate.getTime()) ||
        scheduleDate <= new Date()
    ) {
        setError(true);
        setMessage("Please select a future date and time.");
        return;
    }

    try {
        setLoading(true);
        setError(false);
        setMessage("");

		console.log("Selected time:", scheduledAt);
console.log("Converted UTC:", scheduleDate.toISOString());
console.log("Converted IST:", scheduleDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
}));


        // Existing backend accepts one recipient per request.
        // Schedule each recipient separately.
        for (const recipient of uniqueRecipients) {
            await axios.post(
                `${APIURL}/email/schedule`,
                {
                    recipient,
                    subject,
                    body,
                    scheduledAt: scheduleDate.toISOString(),
                    senderId,
                    delay,
                    hourlyLimit,
                },
                {
                    withCredentials: true,
                }
            );
        }

        setMessage(
            `${uniqueRecipients.length} email(s) scheduled successfully!`
        );

        setTimeout(() => {
            router.push("/");
        }, 1200);

    } catch (err: unknown) {
        setError(true);

        if (axios.isAxiosError(err)) {
            setMessage(
                err.response?.data?.message ||
                "Failed to schedule email."
            );
        } else {
            setMessage("Something went wrong.");
        }

        console.error("Schedule email error:", err);

    } finally {
        setLoading(false);
    }
};

const visibleRecipients = showAllRecipients
    ? recipients
    : recipients.slice(0, 3);

const hiddenCount = recipients.length - 3;

return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-sans">

        {/* Header */}
        <header className="h-[76px] flex items-center justify-between px-6 md:px-8 border-b border-gray-100">

            <Link
                href="/"
                className="flex items-center gap-3 text-gray-900"
            >
                <FiArrowLeft size={26} />

                <h1 className="text-xl md:text-2xl font-medium">
                    Compose New Email
                </h1>
            </Link>

            <div className="flex items-center gap-5">

                <button
                    type="button"
                    className="relative text-[#58A555] hover:text-[#438b40]"
                    title="Upload recipient list"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <FiPaperclip size={23} />

                    {uploadedFile && (
                        <span className="absolute -bottom-2 -right-2 bg-gray-100 text-gray-600 rounded-full text-[10px] px-1">
                            1
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        document.getElementById("schedule-date")?.focus()
                    }
                    className="text-[#58A555] hover:text-[#438b40]"
                    title="Choose schedule time"
                >
                    <FiClock size={23} />
                </button>

                <button
                    type="button"
                    onClick={handleScheduleEmail}
                    disabled={loading}
                    className="px-5 py-2 border border-[#58A555] text-[#58A555] text-sm font-medium rounded-full hover:bg-[#F6FDF7] transition disabled:opacity-50"
                >
                    {loading ? "Scheduling..." : "Send Later"}
                </button>

            </div>
        </header>

        {/* Hidden file input */}
        <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFileUpload}
        />

        {/* Main Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-5 md:px-8 py-8">

            {/* Message */}
            {message && (
                <div
                    className={`mb-5 p-3 rounded-lg text-sm ${
                        error
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                    }`}
                >
                    {message}
                </div>
            )}

            <div className="flex flex-col">

                {/* From */}
                <div className="flex items-center gap-8 mb-7">

                    <label className="w-[50px] text-sm font-medium">
                        From
                    </label>

                    <div className="relative">

                        <select
                            value={senderId}
                            onChange={(e) =>
                                setSenderId(e.target.value)
                            }
                            className="appearance-none bg-[#F6F7F6] rounded-xl pl-4 pr-10 py-2.5 text-sm text-gray-800 outline-none cursor-pointer hover:bg-gray-100"
                        >
                            <option value="sender-1">
                                Sender 1
                            </option>

                            <option value="sender-2">
                                Sender 2
                            </option>

                            <option value="sender-3">
                                Sender 3
                            </option>
                        </select>

                        <FiChevronDown
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                            size={16}
                        />

                    </div>
                </div>

                {/* To */}
                <div className="flex items-start gap-8 border-b border-gray-200 pb-3 mb-7">

                    <label className="w-[50px] text-sm font-medium pt-2">
                        To
                    </label>

                    <div
                        className="flex-1 flex flex-wrap items-center gap-2 min-h-9"
                        onClick={() =>
                            recipientInputRef.current?.focus()
                        }
                    >

                        {visibleRecipients.map((email) => (
                            <span
                                key={email}
                                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#58A555] bg-[#F6FDF7] text-sm"
                            >
                                {email}

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeRecipient(email);
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <FiX size={13} />
                                </button>
                            </span>
                        ))}

                        {hiddenCount > 0 && !showAllRecipients && (
                            <button
                                type="button"
                                onClick={() =>
                                    setShowAllRecipients(true)
                                }
                                className="px-3 py-1 rounded-full border border-[#58A555] bg-[#F6FDF7] text-sm"
                            >
                                +{hiddenCount}
                            </button>
                        )}

                        {showAllRecipients && recipients.length > 3 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setShowAllRecipients(false)
                                }
                                className="text-xs text-gray-500"
                            >
                                Show less
                            </button>
                        )}

                        <input
                            ref={recipientInputRef}
                            type="text"
                            placeholder={
                                recipients.length
                                    ? "Add another recipient..."
                                    : "recipient@example.com"
                            }
                            value={recipientInput}
                            onChange={(e) =>
                                setRecipientInput(e.target.value)
                            }
                            onKeyDown={handleRecipientKeyDown}
                            onBlur={() => {
                                if (recipientInput.trim()) {
                                    addRecipient(recipientInput);
                                }
                            }}
                            className="flex-1 min-w-[150px] text-sm outline-none bg-transparent py-2"
                        />

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fileInputRef.current?.click()
                        }
						// onClick={() => {
						// 	setUploadedFile("");
						// 	setRecipients([]);
						// }}
                        className="flex items-center gap-2 text-sm text-[#58A555] hover:text-[#438b40] whitespace-nowrap pt-2 cursor-pointer"
                    >
                        <FiUploadCloud size={18} />
                        Upload List
                    </button>

                </div>

                {/* Subject */}
                <div className="flex items-center gap-8 border-b border-gray-200 pb-3 mb-6">

                    <label className="w-[50px] text-sm font-medium">
                        Subject
                    </label>

                    <input
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) =>
                            setSubject(e.target.value)
                        }
                        className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
                    />

                </div>

                {/* Delay and Hourly Limit */}
                <div className="flex flex-wrap items-center gap-8 mb-5">

                    <div className="flex items-center gap-3">

                        <label className="text-sm font-medium whitespace-nowrap">
                            Delay between 2 emails
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={delay}
                            onChange={(e) =>
                                setDelay(Math.max(0, Number(e.target.value)))
                            }
                            className="w-[76px] px-2 py-2 text-center text-sm border border-gray-200 rounded-xl outline-none focus:border-[#58A555]"
                        />

                        <span className="text-xs text-gray-400">
                            sec
                        </span>

                    </div>

                    <div className="flex items-center gap-3">

                        <label className="text-sm font-medium whitespace-nowrap">
                            Hourly Limit
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={hourlyLimit}
                            onChange={(e) =>
                                setHourlyLimit(
                                    Math.max(0, Number(e.target.value))
                                )
                            }
                            className="w-[76px] px-2 py-2 text-center text-sm border border-gray-200 rounded-xl outline-none focus:border-[#58A555]"
                        />

                        <span className="text-xs text-gray-400">
                            emails
                        </span>

                    </div>

                </div>

                {/* Editor */}
                <div className="bg-[#FAFAFA] rounded-xl min-h-[480px] overflow-hidden">

                    <ArticleEditor onChange={setBody} />

                </div>

                {/* Uploaded file information */}
                {uploadedFile && (
                    <div className="mt-4 flex items-center gap-3 w-fit px-4 py-3 border border-gray-200 rounded-lg">

                        <FiPaperclip className="text-[#58A555]" />

                        <div>
                            <p className="text-sm font-medium">
                                {uploadedFile}
                            </p>

                            <p className="text-xs text-gray-400">
                                {/* {recipients.length} recipients detected */}
								{uploadedRecipients.length} unique recipients imported
                            </p>

							{invalidFileEmails.length > 0 && (
    <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-600">
        <p className="text-sm font-medium">
            {invalidFileEmails.length} invalid email entr
            {invalidFileEmails.length === 1 ? "y" : "ies"} skipped
        </p>

        <div className="mt-2 text-xs space-y-1">
            {invalidFileEmails.slice(0, 5).map((email, index) => (
                <p key={`${email}-${index}`}>{email}</p>
            ))}

            {invalidFileEmails.length > 5 && (
                <p>
                    +{invalidFileEmails.length - 5} more
                </p>
            )}
        </div>
    </div>
)}
                        </div>

                        <button
                            type="button"
                            // onClick={() => {
                            //     setUploadedFile("");
                            //     setRecipients([]);
                            // }}
							onClick={() => {
								setRecipients((previous) =>
									previous.filter(
										(email) => !uploadedRecipients.includes(email)
									)
								);
							
								setUploadedRecipients([]);
								setInvalidFileEmails([]);
								setUploadedFile("");
							}}
                            className="ml-3 text-gray-400 hover:text-red-500 "
                        >
                            <FiX size={17} />
                        </button>

                    </div>
                )}

                {/* Schedule */}
                <div className="mt-7 flex items-center gap-8 border-b border-gray-100 pb-4">

                    <label className="w-[50px] text-sm font-medium">
                        Schedule
                    </label>

                    <input
                        id="schedule-date"
                        type="datetime-local"
                        value={scheduledAt}
                        min={new Date(
                            Date.now() -
                            new Date().getTimezoneOffset() * 60000
                        )
                            .toISOString()
                            .slice(0, 16)}
                        onChange={(e) =>
                            setScheduledAt(e.target.value)
                        }
                        className="text-sm outline-none bg-transparent"
                    />

                </div>

            </div>
        </main>
    </div>
);


}
