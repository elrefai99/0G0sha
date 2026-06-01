import { TargetModel } from "../@types";

export const wrapSection = (label: string, content: string, target: TargetModel): string => {
     switch (target) {
          case "claude":
               return `<${label}>\n${content}\n</${label}>`;
          case "gpt":
               const gbtLabel = label.charAt(0).toUpperCase() + label.slice(1);
               return `## ${gbtLabel}\n${content}`;
          case "general":
               return `[${label}]\n${content}`;
     }
}
