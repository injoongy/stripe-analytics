"use client"
import { client } from "@/lib/api";
import { useQueryClient } from '@tanstack/react-query';
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Inputs = {
    apiKey: string
}

type JobStatus = {
    id: string;
    state: 'completed' | 'failed' | 'waiting' | 'active' | 'delayed' | 'paused';
    progress?: number;
    failedReason?: string;
    attemptsMade?: number;
    attemptsTotal?: number;
}

export default function ApiForm() {
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset } = useForm<Inputs>()

    // Load jobId from localStorage on mount
    useEffect(() => {
        const storedJobId = localStorage.getItem('pendingJobId');
        if (storedJobId) {
            setJobId(storedJobId);
            setIsLoading(true);
        }
    }, []);

    // Get QueryClient from the context
    const queryClient = useQueryClient()


    // Poll for job status when we have a jobId
    useEffect(() => {
        if (!jobId) return;

        const pollStatus = async () => {
            try {
                const { data, error } = await client.api.stripe.status({
                    jobId,
                }).get()


                if (data && !error) {
                    setJobStatus(data as JobStatus);
                    await queryClient.invalidateQueries({ queryKey: ["stripeResults"], exact: true });

                    // Stop polling if job is completed or failed
                    if (data.state === 'completed' || data.state === 'failed') {
                        setIsLoading(false);
                        // Clear from localStorage when done
                        localStorage.removeItem('pendingJobId');
                        // Clear the jobId to stop the effect

                        setJobId(null);
                        return;
                    }
                }
            } catch (err) {
                console.error('Error polling job status:', err);
            }
        };

        // Poll immediately
        pollStatus();

        // Then poll every 2 seconds
        const interval = setInterval(pollStatus, 2000);

        return () => {
            clearInterval(interval);
        }
    }, [jobId, queryClient]);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setIsLoading(true);
        setJobStatus(null);

        const { data: response, error } = await client.api.stripe.post({
            stripeApiKey: data?.apiKey
        })

        console.log('response', response);

        if (response?.id && !error) {
            setJobId(response.id);
            // Store in localStorage for persistence
            localStorage.setItem('pendingJobId', response.id);
            reset({ apiKey: "" });
        } else {
            setIsLoading(false);
            console.error('Failed to queue job:', error);
            reset({ apiKey: "" });
        }
    }


    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
                <Input  {...register("apiKey", { required: true })} placeholder="Enter stripe api key" />
                <Link
                    target="_blank"
                    href="https://dashboard.stripe.com/apikeys/create?name=GuruCatcher&permissions%5B%5D=rak_charge_read&permissions%5B%5D=rak_refund_read&permissions%5B%5D=rak_invoice_read&permissions%5B%5D=rak_subscription_read">
                    <p className="text-xs hover:underline hover:text-blue-500">Get READ-ONLY Key</p>
                </Link>
            </div>
            <div className="w-full flex justify-end mt-2">
                <Button
                    type="submit"
                    className="w-fit"
                    size="sm"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            {jobStatus?.state === 'active' ? 'Processing...' : 'Queuing...'}
                        </>
                    ) : (
                        'Analyze'
                    )}
                </Button>
            </div>

            {/* Status display */}
            {jobStatus && (
                <div className="mt-4 p-2 text-sm rounded border">
                    <div className="flex justify-between items-start">
                        <div>
                            <p>Status: <span className="font-medium">{jobStatus.state}</span></p>
                            {jobStatus.failedReason && (
                                <p className="text-red-600 mt-1">Error: {jobStatus.failedReason}</p>
                            )}
                            {jobStatus.state === 'completed' && (
                                <p className="text-green-600 mt-1">✓ Metrics stored successfully</p>
                            )}
                        </div>
                        {(jobStatus.state === 'completed' || jobStatus.state === 'failed') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setJobStatus(null);
                                    setJobId(null);
                                    localStorage.removeItem('pendingJobId');
                                }}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </form>

    )
}
