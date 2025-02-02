import { I18NContext } from "@webiny/api-i18n/types";
import { I18NContentContext } from "@webiny/api-i18n-content/types";
import { CmsContext } from "@webiny/api-headless-cms/types";

// When working with the `context` object (for example while defining a new GraphQL resolver function),
// you can import this interface and assign it to it. This will give you full autocomplete functionality
// and type safety. The easiest way to import it would be via the following import statement:
// import { Context } from "~/types";
// Feel free to extend it with additional context interfaces, if needed. Also, please do not change the
// name of the interface, as existing scaffolding utilities may rely on it during the scaffolding process.
export interface Context extends I18NContext, I18NContentContext, CmsContext {}
