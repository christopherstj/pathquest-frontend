import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import { Theme } from "@mui/material";
import React from "react";

type Props = {
    challenge: ChallengeProgress;
    theme: Theme;
};

const ChallengePopup = ({ challenge, theme }: Props) => {
    const color =
        challenge.completed === challenge.total
            ? "primary"
            : challenge.completed === 0
            ? "secondary"
            : "tertiary";
    return `
        <div style="display: flex">
            <div class="tag-${color}">
                <p style="font-size: 12px">
                    ${
                        challenge.completed === challenge.total
                            ? "Completed"
                            : challenge.completed > 0
                            ? "In Progress"
                            : "Not Started"
                    }
                </p>
            </div>
        </div>
        <p style="font-size: 16px; color: ${
            theme.palette[color].onContainer
        }; margin-bottom: 8px">
            ${challenge.name}
        </p>
        <p style="color: ${
            theme.palette[color].onContainerDim
        }; margin-bottom: 8px">
            ${challenge.completed}/${challenge.total} peaks completed
        </p>
        <a href="/app/peaks/${challenge.id}" class="link-${color}">
            View Challenge
        </a>
  `;
};

export default ChallengePopup;
