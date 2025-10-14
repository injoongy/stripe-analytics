import ApiForm from "@/components/api-form";
import StripeResults from "@/components/stripe-results";

export default function Dashboard() {
    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex flex-col gap-3 justify-start w-full p-6">
                <div className="w-full space-y-2 max-w-lg">
                    <p className="font-medium">Run Background Job</p>
                    <ApiForm />
                </div>
                <div className="w-full">
                    <StripeResults />
                </div>
            </div>
        </div>
    );
}
