import { Card, CardContent } from "@/components/ui/card";

interface AIReasoningProps {
  reasoning: string | undefined;
}

export function AIReasoning({ reasoning }: AIReasoningProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg mb-4">🤖 AI Analysis & Reasoning</h3>
        <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{reasoning || "Generating analysis..."}</p>
      </CardContent>
    </Card>
  );
}
