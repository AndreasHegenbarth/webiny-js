export interface Params {
    id: string;
    modelId: string;
}

export const createEntryUrl = ({ modelId, id }: Params): string => {
    return `/cms/content-entries/${modelId}?id=${encodeURIComponent(id)}`;
};

export const createNewEntryUrl = (modelId: string): string => {
    return `/cms/content-entries/${modelId}?new=true`;
};