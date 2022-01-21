export interface CreatedBy {
    /**
     * ID if the user.
     */
    id: string;
    /**
     * Full name of the user.
     */
    displayName: string;
    /**
     * Type of the user (admin, user)
     */
    type: string;
}

export enum ApwWorkflowScopeTypes {
    DEFAULT = "default",
    PB = "pb",
    CMS = "cms"
}

export enum ApwContentReviewStepStatus {
    DONE = "done",
    ACTIVE = "active",
    INACTIVE = "inactive"
}

export enum ApwWorkflowApplications {
    PB = "pageBuilder",
    CMS = "cms"
}

export interface ApwWorkflowScope {
    type: ApwWorkflowScopeTypes;
    data: {
        categories?: string[];
        pages?: string[];
        models?: string[];
        entries?: string[];
    };
}

export enum ApwWorkflowStepTypes {
    MANDATORY_BLOCKING = "mandatoryBlocking",
    MANDATORY_NON_BLOCKING = "mandatoryNonBlocking",
    NON_MANDATORY = "notMandatory"
}

export enum ApwContentReviewStatus {
    UNDER_REVIEW = "underReview",
    READY_TO_BE_PUBLISHED = "readyToBePublished",
    PUBLISHED = "published"
}

export interface ApwWorkflowStep {
    title: string;
    type: ApwWorkflowStepTypes;
    reviewers: any[];
}

export interface ApwContentReviewStep extends ApwWorkflowStep {
    status: ApwContentReviewStepStatus;
    pendingChangeRequests: number;
    signOffProvidedOn: string;
}

interface BaseFields {
    id: string;
    createdOn: string;
    savedOn: string;
    createdBy: CreatedBy;
}

export interface ApwReviewer extends BaseFields {
    identityId: string;
    displayName: string;
    type: string;
}
