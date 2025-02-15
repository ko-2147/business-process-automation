import { useMemo } from "react";
import { Stack, IconButton } from "@fluentui/react";
import DOMPurify from "dompurify";

import styles from "./Answer.module.css";

import { getCitationFilePath } from "../../api";
import { parseAnswerToHtml } from "./AnswerParser";
import { AnswerIcon } from "./AnswerIcon";


const renderButtons = (answer, onThoughtProcessClicked, onSupportingContentClicked) => {
    if (answer && !answer?.error) {
        return (
            <Stack horizontal horizontalAlign="space-between">
                <AnswerIcon />
                <div>
                    <IconButton
                        style={{ color: "black" }}
                        iconProps={{ iconName: "Lightbulb" }}
                        title="Show thought process"
                        ariaLabel="Show thought process"
                        onClick={() => onThoughtProcessClicked()}
                        disabled={!answer.thoughts}
                    />
                    <IconButton
                        style={{ color: "black" }}
                        iconProps={{ iconName: "ClipboardList" }}
                        title="Show supporting content"
                        ariaLabel="Show supporting content"
                        onClick={() => onSupportingContentClicked()}
                        disabled={!answer.data_points.length}
                    />
                </div>
            </Stack>
        )
    }
}

export const Answer = ({
    answer,
    isSelected,
    onCitationClicked,
    onThoughtProcessClicked,
    onSupportingContentClicked,
    onFollowupQuestionClicked,
    showFollowupQuestions
}) => {
    const parsedAnswer = useMemo(() => parseAnswerToHtml(answer.answer, onCitationClicked), [answer, onCitationClicked]);

    const sanitizedAnswerHtml = DOMPurify.sanitize(parsedAnswer.answerHtml);

    return (
        <Stack className={`${styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
            <Stack.Item>
                {renderButtons(answer, onThoughtProcessClicked, onSupportingContentClicked)}
            </Stack.Item>

            <Stack.Item grow>
                <div className={styles.answerText} dangerouslySetInnerHTML={{ __html: sanitizedAnswerHtml }}></div>
            </Stack.Item>

            {!!parsedAnswer.citations.length && (
                <Stack.Item>
                    <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                        <span className={styles.citationLearnMore}>Citations:</span>
                        {parsedAnswer.citations.map((x, i) => {
                            const docIndex = Number(x.replace('doc',''))
                            const docPath = answer.data_points[docIndex - 1].filepath
                            const path = getCitationFilePath(docPath);
                            return (
                                //eslint-disable-next-line
                                <a key={i} className={styles.citation} title={x} onClick={() => onCitationClicked(path)}>
                                    {`${++i}. ${path}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>
            )}

            {!!parsedAnswer.followupQuestions.length && showFollowupQuestions && onFollowupQuestionClicked && (
                <Stack.Item>
                    <Stack horizontal wrap className={`${!!parsedAnswer.citations.length ? styles.followupQuestionsList : ""}`} tokens={{ childrenGap: 6 }}>
                        <span className={styles.followupQuestionLearnMore}>Follow-up questions:</span>
                        {parsedAnswer.followupQuestions.map((x, i) => {
                            return (
                                <a key={i} href={{}} className={styles.followupQuestion} title={x} onClick={() => onFollowupQuestionClicked(x)}>
                                    {`${x}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>
            )}
        </Stack>
    );
};
