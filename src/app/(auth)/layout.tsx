import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-custom-background flex items-center justify-center px-4">
            {children}
        </div>
    );
};

export default AuthLayout;