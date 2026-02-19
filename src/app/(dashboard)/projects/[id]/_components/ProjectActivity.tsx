"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type ProjectActivityProps = {
    templateId: number;
};

export function ProjectActivity({ templateId }: ProjectActivityProps) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch recent activity for this template
        setLoading(false);
        setActivities([]);
    }, [templateId]);

    return (
        <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Latest Events</h3>

            {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
            ) : activities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No recent activity</p>
                    <p className="text-sm mt-2">
                        Activity tracking coming soon with audit logging implementation
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity: any, index: number) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex-1">
                                <div className="text-sm">{activity.description}</div>
                                <div className="text-xs text-gray-500">{activity.timestamp}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
