import apwHooks from "./hooks";
import WebinyError from "@webiny/error";
import { createContentHeadlessCmsContext } from "@webiny/api-headless-cms";
import { ContextPlugin } from "@webiny/handler/plugins/ContextPlugin";
import { ApwContentTypes, ApwContext, PageWithWorkflow } from "~/types";
import { createApw } from "~/createApw";
import { apwPageBuilderPlugins } from "./pageBuilder";
import { createStorageOperations } from "~/storageOperations";
import { createManageCMSPlugin } from "~/plugins/createManageCMSPlugin";
import { SecurityPermission } from "@webiny/api-security/types";
import { Tenant } from "@webiny/api-tenancy/types";
import { CreateApwContextParams } from "~/scheduler/types";
import { createScheduler } from "~/scheduler";

export default (params: CreateApwContextParams) => [
    new ContextPlugin<ApwContext>(async context => {
        const { tenancy, security, i18nContent, handlerClient } = context;

        const contentHeadlessCmsContextPlugins = createContentHeadlessCmsContext({
            storageOperations: context.cms.storageOperations
        });
        /**
         * Register cms plugins required by `api-apw` package.
         */
        context.plugins.register([createManageCMSPlugin(), ...contentHeadlessCmsContextPlugins]);

        const getLocale = () => {
            if (!i18nContent.locale) {
                throw new WebinyError(
                    "Missing context.i18nContent.locale in api-apw/plugins/context.ts",
                    "LOCALE_ERROR"
                );
            }
            // TODO: Check which locale do we need here?
            return i18nContent.locale;
        };

        const getTenant = (): Tenant => {
            return tenancy.getCurrentTenant();
        };

        const getPermission = async (name: string): Promise<SecurityPermission | null> => {
            return security.getPermission(name);
        };
        const getIdentity = () => security.getIdentity();

        const scheduler = createScheduler({
            getLocale,
            getIdentity,
            getTenant,
            getPermission,
            storageOperations: params.storageOperations
        });

        context.apw = createApw({
            getLocale,
            getIdentity,
            getTenant,
            getPermission,
            storageOperations: createStorageOperations({
                /**
                 * TODO: We need to figure out a way to pass "cms" from outside (e.g. api/code/graphql)
                 */
                cms: context.cms,
                /**
                 * TODO: This is required for "entryFieldFromStorageTransform" which access plugins from context.
                 */
                getCmsContext: () => context
            }),
            scheduler,
            handlerClient
        });
        /**
         * TODO: @ashutosh
         * Move these call into a separate package let say "ap-apw-page-builder"
         */
        context.apw.addContentGetter(ApwContentTypes.PAGE, async id => {
            return context.pageBuilder.getPage<PageWithWorkflow>(id);
        });
        context.apw.addContentGetter(ApwContentTypes.CMS_ENTRY, async (id, settings) => {
            if (!settings.modelId) {
                return null;
            }
            const model = await context.cms.getModel(settings.modelId);
            if (!model) {
                return null;
            }
            const entry = await context.cms.getEntry(model, {
                where: { id: id, tenant: model.tenant }
            });
            if (!entry) {
                return null;
            }
            return { ...entry, title: `Extract "title" form entity.` };
        });
        context.apw.addContentPublisher(ApwContentTypes.PAGE, async id => {
            await context.pageBuilder.publishPage<PageWithWorkflow>(id);
            return true;
        });
        context.apw.addContentPublisher(ApwContentTypes.CMS_ENTRY, async (id, settings) => {
            if (!settings.modelId) {
                return null;
            }
            const model = await context.cms.getModel(settings.modelId);

            if (!model) {
                return null;
            }
            const publishedEntry = await context.cms.publishEntry(model, id);

            if (!publishedEntry) {
                return null;
            }

            return true;
        });
        context.apw.addContentUnPublisher(ApwContentTypes.PAGE, async id => {
            await context.pageBuilder.unpublishPage<PageWithWorkflow>(id);
            return true;
        });
        context.apw.addContentUnPublisher(ApwContentTypes.CMS_ENTRY, async (id, settings) => {
            if (!settings.modelId) {
                return null;
            }
            const model = await context.cms.getModel(settings.modelId);
            if (!model) {
                return null;
            }
            const unpublishedEntry = await context.cms.unpublishEntry(model, id);

            if (!unpublishedEntry) {
                return null;
            }

            return true;
        });

        apwPageBuilderPlugins({ pageBuilder: context.pageBuilder, apw: context.apw });
    }),
    apwHooks()
];
