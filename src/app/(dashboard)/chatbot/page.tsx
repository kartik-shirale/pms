import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChatbotClient } from "./_components/ChatbotClient";

export default async function ChatbotPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    // Members cannot access the chatbot
    if (session.user.role === "member") {
        redirect("/tasks");
    }

    return (
        <ChatbotClient
            userName={session.user.name}
            userRole={session.user.role as string}
        />
    );
}
