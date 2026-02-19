"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SendIcon from "@mui/icons-material/Send";

type CredentialsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    email: string;
    password: string;
};

export function CredentialsDialog({
    open,
    onOpenChange,
    email,
    password,
}: CredentialsDialogProps) {
    const [copied, setCopied] = useState<"email" | "password" | null>(null);

    const copyToClipboard = async (text: string, type: "email" | "password") => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            toast.success(`${type === "email" ? "Email" : "Password"} copied to clipboard`);
            setTimeout(() => setCopied(null), 2000);
        } catch (error) {
            toast.error("Failed to copy to clipboard");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Employee Created Successfully! 🎉</DialogTitle>
                    <DialogDescription>
                        The employee account has been created and a welcome email has been sent. Here are the login credentials:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="credential-email">Email</Label>
                        <div className="flex gap-2">
                            <InputGroup className="flex-1">
                                <InputGroupAddon>
                                    <InputGroupText>
                                        <EmailIcon className="w-4 h-4" />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="credential-email"
                                    value={email}
                                    readOnly
                                />
                            </InputGroup>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(email, "email")}
                            >
                                <ContentCopyIcon className={`w-4 h-4 ${copied === "email" ? "text-green-600" : ""}`} />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="credential-password">Password</Label>
                        <div className="flex gap-2">
                            <InputGroup className="flex-1">
                                <InputGroupAddon>
                                    <InputGroupText>
                                        <LockIcon className="w-4 h-4" />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="credential-password"
                                    value={password}
                                    readOnly
                                    type="text"
                                    className="font-mono"
                                />
                            </InputGroup>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(password, "password")}
                            >
                                <ContentCopyIcon className={`w-4 h-4 ${copied === "password" ? "text-green-600" : ""}`} />
                            </Button>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <p className="text-sm text-amber-900 dark:text-amber-200">
                            ⚠️ <strong>Important:</strong> Make sure to securely share these credentials with the employee. The password cannot be retrieved later.
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
                            <SendIcon className="w-4 h-4" />
                            A welcome email with these credentials has been sent to <strong>{email}</strong>
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
