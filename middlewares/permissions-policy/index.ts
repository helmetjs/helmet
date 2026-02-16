import type { IncomingMessage, ServerResponse } from "node:http";

export interface PermissionsPolicyOptions {
    features: Record<string, string[]>;
}

function getHeaderValueFromOptions(
    options: Readonly<PermissionsPolicyOptions>,
): string | null {
    if (
        !options ||
        !options.features ||
        Object.keys(options.features).length === 0
    ) {
        throw new Error("Permissions-Policy: at least one feature must be defined");
    }

    const result: string[] = [];

    for (const [featureName, featureValue] of Object.entries(options.features)) {
        if (featureValue.length === 0) {
            result.push(`${featureName}=()`);
            continue;
        }

        if (featureValue.length === 1 && featureValue[0] === "*") {
            result.push(`${featureName}=*`);
            continue;
        }

        const values = featureValue.map((value) => {
            if (value === "self" || value === "src" || value === "*") {
                return value;
            }
            return `"${value}"`;
        });

        result.push(`${featureName}=(${values.join(" ")})`);
    }

    return result.join(", ");
}

function permissionsPolicy(options: Readonly<PermissionsPolicyOptions>) {
    const headerValue = getHeaderValueFromOptions(options);

    return function permissionsPolicyMiddleware(
        _req: IncomingMessage,
        res: ServerResponse,
        next: () => void,
    ) {
        if (headerValue) {
            res.setHeader("Permissions-Policy", headerValue);
        }
        next();
    };
}

export default permissionsPolicy;
