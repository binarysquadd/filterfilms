import * as React from "react";
import { cn } from "@/app/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  wordLimit?: number;
  showWordCount?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      wordLimit,
      showWordCount = false,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [error, setError] = React.useState<string | null>(null);

    const wordCount = React.useMemo(() => {
      if (!value || typeof value !== "string") return 0;
      return value.trim() === "" ? 0 : value.trim().split(/\s+/).length;
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (wordLimit) {
        const words = e.target.value.trim().split(/\s+/);

        if (words.length > wordLimit) {
          setError(`Maximum ${wordLimit} words allowed`);
          return;
        } else {
          setError(null);
        }
      }

      onChange?.(e);
    };

    return (
      <div className="space-y-1">
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={handleChange}
          className={cn(
            "flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error ? "border-destructive focus-visible:ring-destructive" : "border-input",
            className
          )}
          {...props}
        />

        {(showWordCount || error) && (
          <div className="flex justify-between text-xs">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span />
            )}

            {showWordCount && wordLimit && (
              <span
                className={cn(
                  "text-muted-foreground",
                  wordCount === wordLimit && "text-destructive"
                )}
              >
                {wordCount}/{wordLimit} words
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
