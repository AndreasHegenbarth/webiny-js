import React from "react";
import styled from "@emotion/styled";
import { RichTextEditor } from "@webiny/ui/RichTextEditor";
import { ApwComment } from "~/types";
import { Box, Columns, Stack } from "~/components/Layout";
import { fromNow } from "~/components/utils";
import { Avatar } from "~/views/publishingWorkflows/components/ReviewersList";
import { useCommentsList } from "~/hooks/useCommentsList";
import { TypographyBody, TypographySecondary, AuthorName } from "../Styled";
import { CommentFile } from "../ChangeRequest/ApwFile";
import { FileWithOverlay } from "../ChangeRequest/ChangeRequestMedia";

const CommentsBox = styled(Stack)`
    background-color: var(--mdc-theme-background);
    overflow: auto;
    height: calc(100vh - 64px - 178px - 56px);
    overscroll-behavior: contain;
`;

const CommentBox = styled(Box)`
    background-color: var(--mdc-theme-surface);
    border-radius: 4px;
`;

interface CommentProps {
    comment: ApwComment;
    width?: string;
}

const Comment: React.FC<CommentProps> = props => {
    const { comment, ...restProps } = props;
    return (
        <Stack marginBottom={6} space={2} {...restProps}>
            <Columns space={2.5} paddingLeft={1}>
                <Box>
                    <Avatar index={0} />
                </Box>
                <Box>
                    <AuthorName use={"subtitle1"}>{comment.createdBy.displayName}</AuthorName>
                </Box>
            </Columns>
            <CommentBox paddingX={3.5} paddingY={5}>
                <TypographyBody use={"caption"}>
                    <RichTextEditor readOnly={true} value={comment.body} />
                </TypographyBody>
                {comment.media && (
                    <Box padding={4}>
                        <FileWithOverlay media={comment.media} fullWidth={true}>
                            <CommentFile value={comment.media} />
                        </FileWithOverlay>
                    </Box>
                )}
            </CommentBox>
            <Box paddingLeft={3.5}>
                <TypographySecondary use={"caption"}>
                    {fromNow(comment.createdOn)}
                </TypographySecondary>
            </Box>
        </Stack>
    );
};

export const Comments = React.forwardRef<HTMLDivElement>(function comments(_, ref) {
    const { comments } = useCommentsList();

    return (
        <CommentsBox space={6} paddingX={6} paddingY={5}>
            <Box>
                {comments.map(item => (
                    <Comment key={item.id} comment={item} />
                ))}
            </Box>
            <Box ref={ref} />
        </CommentsBox>
    );
});
