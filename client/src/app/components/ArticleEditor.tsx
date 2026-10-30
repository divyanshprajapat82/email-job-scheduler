// "use client";

// import dynamic from "next/dynamic";
// import { useMemo, useState } from "react";

// // The editor touches the DOM, so skip server-side rendering for it.
// const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

// export default function ArticleEditor() {
// 	const [content, setContent] = useState("<p>Hello, Jodit!</p>");
// 	const config = useMemo(() => ({ height: 400 }), []);

// 	return <JoditEditor value={content} config={config} onBlur={setContent} />;
// }

"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const JoditEditor = dynamic(() => import("jodit-react"), {
	ssr: false,
});

interface ArticleEditorProps {
	onChange: (content: string) => void;
}

export default function ArticleEditor({ onChange }: ArticleEditorProps) {
	const [content, setContent] = useState("<p>Hello!</p>");

	const config = useMemo(
		() => ({
			height: 400,
		}),
		[],
	);

	const handleChange = (newContent: string) => {
		setContent(newContent);
		onChange(newContent);
	};

	return <JoditEditor value={content} config={config} onBlur={handleChange} />;
}
