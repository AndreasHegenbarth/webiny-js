import get from "lodash/get";
import { useQuery, useMutation } from "@apollo/react-hooks";
import {
    CREATE_CHANGE_REQUEST_MUTATION,
    GET_CHANGE_REQUEST_QUERY,
    LIST_CHANGE_REQUESTS_QUERY,
    DELETE_CHANGE_REQUEST_MUTATION,
    UPDATE_CHANGE_REQUEST_MUTATION,
    GetChangeRequestQueryResponse,
    GetChangeRequestQueryVariables,
    CreateChangeRequestMutationResponse,
    CreateChangeRequestMutationVariables,
    UpdateChangeRequestMutationResponse,
    UpdateChangeRequestMutationVariables,
    DeleteChangeRequestMutationResponse,
    DeleteChangeRequestMutationVariables
} from "~/graphql/changeRequest.gql";
import { useSnackbar } from "@webiny/app-admin";
import { useRouter } from "@webiny/react-router";
import { useContentReviewId, useCurrentStepId } from "~/hooks/useContentReviewId";
import { ApwChangeRequest } from "~/types";
import { GET_CONTENT_REVIEW_QUERY } from "~/graphql/contentReview.gql";

interface UseChangeRequestParams {
    id: string | null;
}

interface UseChangeRequestResult {
    create: Function;
    update: Function;
    deleteChangeRequest: (id: string) => Promise<any>;
    changeRequest: ApwChangeRequest;
    markResolved: (resolved: boolean) => Promise<void>;
    loading: boolean;
}

export const useChangeRequest = ({ id }: UseChangeRequestParams): UseChangeRequestResult => {
    const { showSnackbar } = useSnackbar();
    const { history } = useRouter();
    const { encodedId: stepId } = useCurrentStepId();
    const { encodedId, id: contentReviewId } = useContentReviewId() || { encodedId: "", id: "" };

    const step = `${contentReviewId}#${stepId}`;

    const getQuery = useQuery<GetChangeRequestQueryResponse, GetChangeRequestQueryVariables>(
        GET_CHANGE_REQUEST_QUERY,
        {
            variables: { id: id as string },
            skip: !id,
            onCompleted: response => {
                const error = get(response, "apw.changeRequest.error");
                if (error) {
                    showSnackbar(error.message);
                    history.push(`/apw/content-reviews/${encodedId}/${stepId}`);
                }
            }
        }
    );

    const [create, createMutationResponse] = useMutation<
        CreateChangeRequestMutationResponse,
        CreateChangeRequestMutationVariables
    >(CREATE_CHANGE_REQUEST_MUTATION, {
        refetchQueries: [
            {
                query: LIST_CHANGE_REQUESTS_QUERY,
                variables: { where: { step } }
            },
            { query: GET_CONTENT_REVIEW_QUERY, variables: { id: contentReviewId } }
        ],
        onCompleted: response => {
            const error = get(response, "apw.changeRequest.error");
            if (error) {
                showSnackbar(error.message);
                return;
            }
            const { id } = get(response, "apw.changeRequest.data");
            showSnackbar("Change request created successfully!");
            history.push(`/apw/content-reviews/${encodedId}/${stepId}/${encodeURIComponent(id)}`);
        }
    });

    const [update, updateResponse] = useMutation<
        UpdateChangeRequestMutationResponse,
        UpdateChangeRequestMutationVariables
    >(UPDATE_CHANGE_REQUEST_MUTATION, {
        refetchQueries: [{ query: LIST_CHANGE_REQUESTS_QUERY, variables: { where: { step } } }],
        onCompleted: response => {
            const error = get(response, "apw.changeRequest.error");
            if (error) {
                showSnackbar(error.message);
                return;
            }
            const { id } = get(response, "apw.changeRequest.data");
            showSnackbar("Change request updated successfully!");
            history.push(`/apw/content-reviews/${encodedId}/${stepId}/${encodeURIComponent(id)}`);
        }
    });

    const [deleteChangeRequest, deleteChangeRequestMutationResponse] = useMutation<
        DeleteChangeRequestMutationResponse,
        DeleteChangeRequestMutationVariables
    >(DELETE_CHANGE_REQUEST_MUTATION, {
        refetchQueries: [
            {
                query: LIST_CHANGE_REQUESTS_QUERY,
                variables: { where: { step } }
            },
            { query: GET_CONTENT_REVIEW_QUERY, variables: { id: contentReviewId } }
        ],
        onCompleted: response => {
            const error = get(response, "apw.deleteChangeRequest.error");
            if (error) {
                showSnackbar(error.message);
                return;
            }
            showSnackbar("Change request deleted successfully!");

            history.push(`/apw/content-reviews/${encodedId}/${stepId}`);
        }
    });

    const [updateMutation, updateMutationResponse] = useMutation<
        UpdateChangeRequestMutationResponse,
        UpdateChangeRequestMutationVariables
    >(UPDATE_CHANGE_REQUEST_MUTATION, {
        refetchQueries: [
            { query: LIST_CHANGE_REQUESTS_QUERY },
            {
                query: GET_CONTENT_REVIEW_QUERY,
                variables: { id: contentReviewId }
            }
        ],
        onCompleted: response => {
            const error = get(response, "apw.changeRequest.error");
            if (error) {
                showSnackbar(error.message);
                return;
            }
            const { title, resolved } = get(response, "apw.changeRequest.data");
            showSnackbar(
                `Successfully marked "${title}" as ${resolved ? "resolved" : "unresolved"}!`
            );
        }
    });

    const markResolved = async (resolved: boolean) => {
        await updateMutation({ variables: { id: id as string, data: { resolved } } });
    };

    return {
        create,
        update,
        deleteChangeRequest: async id => deleteChangeRequest({ variables: { id } }),
        changeRequest: get(getQuery, "data.apw.getChangeRequest.data"),
        markResolved,
        loading: [
            getQuery.loading,
            createMutationResponse.loading,
            updateMutationResponse.loading,
            deleteChangeRequestMutationResponse.loading,
            updateResponse.loading
        ].some(loading => loading === true)
    };
};

export const useChangeRequestStep = (): string => {
    const { encodedId: stepId } = useCurrentStepId();
    const { id: contentReviewId } = useContentReviewId() || { id: "" };

    return `${contentReviewId}#${stepId}`;
};
