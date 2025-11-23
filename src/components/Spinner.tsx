interface SpinnerProps {
    size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md" }: SpinnerProps) {
    const sizeClasses = {
        sm: "w-3 h-3 border",
        md: "w-4 h-4 border-2",
        lg: "w-6 h-6 border-2",
    };

    return (
        <div
            className={`inline-block ${sizeClasses[size]} animate-spin rounded-full border-gray-300 border-t-osrs-accent`}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}
